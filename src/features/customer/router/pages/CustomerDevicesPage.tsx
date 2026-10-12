'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { Smartphone, ArrowLeft, RefreshCw, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState } from '@/features/customer/shared';
import { DataTable } from '@/features/shared/data-table';
import { useDeviceAccess, useRouterDevices } from '../hooks/use-customer-router';
import { RouterActionResultPanel } from '../components/RouterActionResultPanel';
import type { RouterActionResult, RouterDevice } from '@/lib/api/adapters/customer.adapter';

const deviceSearchFilter = (row: LegacyRow<RouterDevice>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const d = row.original;
  return d.hostname.toLowerCase().includes(q) || d.ip.toLowerCase().includes(q) || d.mac.toLowerCase().includes(q);
};

/**
 * GET /v1/customer/router-control/devices. The provider router only sees the
 * PPPoE session; home devices are listed when the CPE is TR-069 managed.
 * Block / unblock (POST /v1/customer/device/{block|unblock}) shows the real
 * outcome: `queued` with the ACS job id when the router is remotely managed,
 * otherwise `pending` with router-admin steps.
 */
export function CustomerDevicesPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useRouterDevices();
  const { mutate: changeAccess, isPending: accessPending } = useDeviceAccess();
  const [mac, setMac] = useState('');
  const [accessResult, setAccessResult] = useState<{ title: string; result: RouterActionResult } | null>(null);

  const runAccess = useCallback(
    (target: string, block: boolean) => {
      const value = target.trim();
      if (!value) return;
      changeAccess(
        { mac: value, block },
        { onSuccess: (result) => setAccessResult({ title: `${block ? 'Block' : 'Unblock'} ${value}`, result }) },
      );
    },
    [changeAccess],
  );

  const columns = useMemo<LegacyColumnDef<RouterDevice, unknown>[]>(
    () => [
      {
        accessorKey: 'hostname',
        header: 'Device Name',
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Smartphone className="h-4 w-4" />
            </div>
            <span className="font-bold text-foreground">{row.original.hostname || 'Unnamed device'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'ip',
        header: 'IP Address',
        size: 140,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.ip || '—'}</span>,
      },
      {
        accessorKey: 'mac',
        header: 'MAC',
        size: 160,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.mac || '—'}</span>,
      },
      {
        accessorKey: 'online',
        header: 'Status',
        size: 100,
        cell: ({ row }) => (
          <Badge variant={row.original.online ? 'default' : 'outline'} className="text-[11px]">
            {row.original.online ? 'Online' : 'Offline'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 90,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.mac ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-destructive"
              disabled={accessPending}
              onClick={() => runAccess(row.original.mac, true)}
            >
              Block
            </Button>
          ) : null,
      },
    ],
    [accessPending, runAccess],
  );

  if (isLoading) {
    return (
      <CustomerPageShell title="Connection & Devices" subtitle="Reading your connection...">
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="Connection & Devices" subtitle="Session and devices">
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { connection } = data;
  const online = connection.online;

  return (
    <CustomerPageShell
      title="Connection & Devices"
      subtitle="Your live session on the provider network and, where supported, the devices on your home network."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Router', href: '/customer/router' },
        { label: 'Connection & Devices' },
      ]}
      actions={
        <div className="flex gap-2">
          <Link href="/customer/router">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Router
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} className="gap-2 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Session
              <Badge variant={online ? 'default' : online === false ? 'destructive' : 'outline'} className="text-xs">
                {online ? 'Online' : online === false ? 'Offline' : 'Unknown'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs">
              <div>
                <span className="text-muted-foreground font-medium">IP</span>
                <div className="font-mono font-semibold text-sm mt-0.5">{connection.ip || '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">MAC</span>
                <div className="font-mono font-semibold text-sm mt-0.5">{connection.mac || '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Uptime</span>
                <div className="font-mono font-semibold text-sm mt-0.5">{connection.uptime || '—'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {data.homeDevicesSupported ? (
          <DataTable
            columns={columns}
            data={data.devices}
            getRowId={(row, i) => row.mac || row.ip || String(i)}
            searchKey="hostname"
            searchPlaceholder="Search device name, IP address, MAC..."
            searchFilterFn={deviceSearchFilter}
            emptyTitle="No devices found"
            emptyDescription={data.message || 'No devices are connected to your router right now.'}
          />
        ) : (
          <RouterActionResultPanel title="Home devices" result={data} />
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Ban className="h-4 w-4 text-destructive" />
              Block a device
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Block or unblock a phone or laptop on your home Wi-Fi by its MAC address. A remotely managed router applies the change at its
              next check-in; otherwise you get the steps for your router&apos;s admin page.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                placeholder="AA:BB:CC:DD:EE:FF"
                aria-label="Device MAC address"
                className="font-mono text-xs sm:max-w-xs"
              />
              <Button size="sm" onClick={() => runAccess(mac, true)} disabled={!mac.trim() || accessPending}>
                {accessPending ? 'Sending…' : 'Block'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => runAccess(mac, false)} disabled={!mac.trim() || accessPending}>
                Unblock
              </Button>
            </div>
            {accessResult && <RouterActionResultPanel title={accessResult.title} result={accessResult.result} />}
          </CardContent>
        </Card>
      </div>
    </CustomerPageShell>
  );
}

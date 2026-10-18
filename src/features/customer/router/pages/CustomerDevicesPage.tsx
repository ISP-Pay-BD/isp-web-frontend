'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { Smartphone, ArrowLeft, RefreshCw, Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState, statusLabel } from '@/features/customer/shared';
import { DataTable } from '@/features/shared/data-table';
import { useDeviceAccess, useRouterDevices } from '../hooks/use-customer-router';
import { RouterActionResultPanel } from '../components/RouterActionResultPanel';
import { useLocale } from '@/i18n/locale-context';
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
  const { t } = useLocale();
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
        {
          onSuccess: (result) =>
            setAccessResult({
              title: block
                ? t('customer.devices.blockResult', 'Block {mac}', { mac: value })
                : t('customer.devices.unblockResult', 'Unblock {mac}', { mac: value }),
              result,
            }),
        },
      );
    },
    [changeAccess, t],
  );

  const columns = useMemo<LegacyColumnDef<RouterDevice, unknown>[]>(
    () => [
      {
        accessorKey: 'hostname',
        header: t('customer.devices.colName', 'Device name'),
        size: 220,
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
              <Smartphone className="h-4 w-4" />
            </div>
            <span className="text-foreground min-w-0 break-words font-bold">
              {row.original.hostname || row.original.mac || t('customer.devices.unnamed', 'Unnamed device')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'ip',
        header: t('customer.devices.colIp', 'IP address'),
        size: 140,
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.ip || '—'}</span>,
      },
      {
        accessorKey: 'mac',
        header: t('customer.devices.colMac', 'MAC'),
        size: 160,
        cell: ({ row }) => <span className="text-muted-foreground font-mono text-sm">{row.original.mac || '—'}</span>,
      },
      {
        accessorKey: 'online',
        header: t('customer.devices.colStatus', 'Status'),
        size: 100,
        meta: { mobile: 'status' },
        cell: ({ row }) => {
          const state = row.original.online ? 'online' : 'offline';
          return <StatusBadge status={state} label={statusLabel(t, state)} />;
        },
      },
      {
        id: 'actions',
        header: '',
        size: 90,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.mac ? (
            <Button
              variant="ghost"
              className="text-destructive h-11 px-4 md:h-8 md:px-2.5"
              disabled={accessPending}
              onClick={() => runAccess(row.original.mac, true)}
            >
              {t('customer.devices.block', 'Block')}
            </Button>
          ) : null,
      },
    ],
    [accessPending, runAccess, t],
  );

  const title = t('customer.devices.title', 'Connection & devices');
  const crumbs = [
    { label: t('customer.nav.home', 'Customer'), href: '/customer/dashboard' },
    { label: t('customer.router.crumb', 'Router'), href: '/customer/router' },
    { label: title },
  ];

  if (isLoading) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.devices.loading', 'Reading your connection…')} breadcrumbs={crumbs}>
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title={title} breadcrumbs={crumbs}>
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { connection } = data;
  const sessionState = connection.online ? 'online' : connection.online === false ? 'offline' : null;

  return (
    <CustomerPageShell
      title={title}
      subtitle={t(
        'customer.devices.subtitle',
        'Your live session on the provider network and, where supported, the devices on your home network.',
      )}
      breadcrumbs={crumbs}
      actions={
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button variant="outline" className="h-11 gap-2" render={<Link href="/customer/router" />}>
            <ArrowLeft className="h-4 w-4" />
            {t('customer.devices.back', 'Back to router')}
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="h-11 gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {t('customer.devices.refresh', 'Refresh')}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              {t('customer.devices.session', 'Session')}
              {sessionState ? (
                <StatusBadge status={sessionState} label={statusLabel(t, sessionState)} />
              ) : (
                <StatusBadge status="unknown" label={t('customer.devices.unknown', 'Unknown')} />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <span className="text-muted-foreground font-medium">{t('customer.devices.ip', 'IP')}</span>
                <div className="mt-0.5 font-mono text-sm font-semibold">{connection.ip || '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">{t('customer.devices.mac', 'MAC')}</span>
                <div className="mt-0.5 break-all font-mono text-sm font-semibold">{connection.mac || '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">{t('customer.devices.uptime', 'Uptime')}</span>
                <div className="mt-0.5 font-mono text-sm font-semibold">{connection.uptime || '—'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {data.homeDevicesSupported ? (
          <DataTable
            urlState
            columns={columns}
            data={data.devices}
            getRowId={(row, i) => row.mac || row.ip || String(i)}
            searchKey="hostname"
            searchPlaceholder={t('customer.devices.search', 'Search device name, IP address, MAC…')}
            searchFilterFn={deviceSearchFilter}
            emptyTitle={t('customer.devices.emptyTitle', 'No devices found')}
            emptyDescription={data.message || t('customer.devices.emptyDesc', 'No devices are connected to your router right now.')}
          />
        ) : (
          <RouterActionResultPanel title={t('customer.devices.homeDevices', 'Home devices')} result={data} />
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Ban className="text-destructive h-4 w-4" />
              {t('customer.devices.blockTitle', 'Block a device')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              {t(
                'customer.devices.blockDesc',
                'Block or unblock a phone or laptop on your home Wi-Fi by its MAC address. A remotely managed router applies the change at its next check-in; otherwise you get the steps for your router’s admin page.',
              )}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                placeholder="AA:BB:CC:DD:EE:FF"
                aria-label={t('customer.devices.macLabel', 'Device MAC address')}
                autoCapitalize="characters"
                autoComplete="off"
                className="h-11 font-mono sm:max-w-xs"
              />
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Button className="h-11 gap-2" onClick={() => runAccess(mac, true)} disabled={!mac.trim() || accessPending}>
                  {accessPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {accessPending ? t('customer.devices.sending', 'Sending…') : t('customer.devices.block', 'Block')}
                </Button>
                <Button variant="outline" className="h-11" onClick={() => runAccess(mac, false)} disabled={!mac.trim() || accessPending}>
                  {t('customer.devices.unblock', 'Unblock')}
                </Button>
              </div>
            </div>
            {accessResult && <RouterActionResultPanel title={accessResult.title} result={accessResult.result} />}
          </CardContent>
        </Card>
      </div>
    </CustomerPageShell>
  );
}

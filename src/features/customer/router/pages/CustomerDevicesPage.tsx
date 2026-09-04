'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import {
  Smartphone,
  Laptop,
  Tv,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
} from '@/features/customer/shared';
import { DataTable } from '@/features/shared/data-table';
import { useCustomerRouter } from '../hooks/use-customer-router';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';
import type { RouterDevice } from '@/data/shared/types';

type DeviceRow = RouterDevice & { accessStatus: 'Online' | 'Blocked' };

const deviceSearchFilter = (
  row: LegacyRow<DeviceRow>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const d = row.original;
  return (
    d.name.toLowerCase().includes(q) ||
    d.ip.toLowerCase().includes(q) ||
    d.mac.toLowerCase().includes(q)
  );
};

function getDeviceIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('laptop') || lower.includes('pc') || lower.includes('dell')) {
    return <Laptop className="h-4 w-4" />;
  }
  if (lower.includes('tv') || lower.includes('smart')) {
    return <Tv className="h-4 w-4" />;
  }
  return <Smartphone className="h-4 w-4" />;
}

export function CustomerDevicesPage() {
  const { data, isLoading, isError, refetch } = useCustomerRouter();
  const [blockedDevices, setBlockedDevices] = useState<string[]>([]);

  const toggleBlock = (id: string, name: string) => {
    if (blockedDevices.includes(id)) {
      setBlockedDevices((prev) => prev.filter((d) => d !== id));
      toast.success(`${name} unblocked. Access restored.`);
    } else {
      setBlockedDevices((prev) => [...prev, id]);
      toast.error(`${name} blocked from accessing broadband.`);
    }
  };

  const deviceRows: DeviceRow[] = useMemo(
    () =>
      (data?.connectedDevices ?? []).map((dev) => ({
        ...dev,
        accessStatus: blockedDevices.includes(dev.id) ? 'Blocked' : 'Online',
      })),
    [data?.connectedDevices, blockedDevices],
  );

  const columns = useMemo<LegacyColumnDef<DeviceRow, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Device Name',
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              {getDeviceIcon(row.original.name)}
            </div>
            <span className="font-bold text-foreground">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'ip',
        header: 'IP Address',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.ip}</span>
        ),
      },
      {
        accessorKey: 'mac',
        header: 'Physical MAC',
        size: 160,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.mac}</span>
        ),
      },
      {
        accessorKey: 'connectedAt',
        header: 'Connected Since',
        size: 140,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.connectedAt)}
          </span>
        ),
      },
      {
        accessorKey: 'accessStatus',
        header: 'Status',
        size: 100,
        cell: ({ row }) => {
          const isBlocked = row.original.accessStatus === 'Blocked';
          return (
            <Badge variant={isBlocked ? 'destructive' : 'default'} className="text-[11px]">
              {row.original.accessStatus}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Access Control</span>,
        size: 160,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const isBlocked = row.original.accessStatus === 'Blocked';
          return (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant={isBlocked ? 'outline' : 'destructive'}
                onClick={() => toggleBlock(row.original.id, row.original.name)}
                className="h-8 text-xs font-semibold"
              >
                {isBlocked ? 'Restore Access' : 'Block Device'}
              </Button>
            </div>
          );
        },
      },
    ],
    [blockedDevices],
  );

  if (isLoading) {
    return (
      <CustomerPageShell title="Connected Devices" subtitle="Scanning local network ARP table...">
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="Connected Devices" subtitle="Active DHCP Clients">
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  return (
    <CustomerPageShell
      title="Connected Devices"
      subtitle="Inspect all active smartphones, laptops, smart TVs, and IoT hardware assigned an IP address by your router."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Router', href: '/customer/router' },
        { label: 'Connected Devices' },
      ]}
      actions={
        <div className="flex gap-2">
          <Link href="/customer/router">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Router
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh List
          </Button>
        </div>
      }
    >
      <DataTable
        columns={columns}
        data={deviceRows}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search device name, IP address, MAC..."
        searchFilterFn={deviceSearchFilter}
        facetFilters={[{ columnId: 'accessStatus', title: 'Status' }]}
        emptyTitle="No devices found"
        emptyDescription="No active clients matching your search criteria."
      />
    </CustomerPageShell>
  );
}

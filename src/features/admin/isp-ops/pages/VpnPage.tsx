'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type Row = IspOpsData['vpnTunnels'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.peer).toLowerCase().includes(q) ||
    String(r.protocol).toLowerCase().includes(q) ||
    String(r.uptime).toLowerCase().includes(q)
  );
};

export function VpnPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Tunnel',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'peer',
        header: 'Peer',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.peer)}</span>,
      },
      {
        accessorKey: 'protocol',
        header: 'Protocol',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.protocol)}</Badge>
        ),
      },
      {
        accessorKey: 'uptime',
        header: 'Uptime',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.uptime)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.status)}</Badge>
        ),
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.vpnTunnels;
  const up = rows.filter((r) => r.status === 'up').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="VPN Tunnels"
        subtitle="Backhaul and POP tunnels"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "VPN Tunnels" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} tunnels · {up} up
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="name"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}

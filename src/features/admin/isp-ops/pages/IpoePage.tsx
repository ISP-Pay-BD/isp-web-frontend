'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type Row = IspOpsData['ipoeSessions'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.mac).toLowerCase().includes(q) ||
    String(r.ipv4).toLowerCase().includes(q) ||
    String(r.ipv6).toLowerCase().includes(q) ||
    String(r.vlan).toLowerCase().includes(q)
  );
};

const statusBadgeClass: Record<string, string> = {
  online: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25',
  offline: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:bg-zinc-500/15 dark:text-zinc-400 dark:border-zinc-500/25',
};

export function IpoePage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'mac',
        header: 'MAC',
        cell: ({ row }) => (
          <span className="text-foreground font-mono text-xs tabular-nums">{String(row.original.mac)}</span>
        ),
      },
      {
        accessorKey: 'ipv4',
        header: 'IPv4',
        cell: ({ row }) => (
          <span className="text-foreground font-mono text-xs tabular-nums">{String(row.original.ipv4)}</span>
        ),
      },
      {
        accessorKey: 'ipv6',
        header: 'IPv6',
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-xs tabular-nums">{String(row.original.ipv6)}</span>
        ),
      },
      {
        accessorKey: 'vlan',
        header: 'VLAN',
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-xs tabular-nums">{String(row.original.vlan)}</span>
        ),
      },
      {
        accessorKey: 'uptime',
        header: 'Uptime',
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">{String(row.original.uptime)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = String(row.original.status);
          return (
            <Badge variant="outline" className={`capitalize ${statusBadgeClass[status] ?? ''}`}>
              {status}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.ipoeSessions;
  const online = rows.filter((r) => r.status === 'online').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="IPoE Dual-Stack"
        subtitle="MAC-based IPoE sessions"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'IPoE Dual-Stack' }]}
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: 'sessions' },
          { value: online, label: 'online' },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="mac"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}

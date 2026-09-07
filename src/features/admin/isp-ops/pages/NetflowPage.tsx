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

type Row = IspOpsData['netflowTopTalkers'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.ip).toLowerCase().includes(q) ||
    String(r.username).toLowerCase().includes(q) ||
    String(r.rxGb).toLowerCase().includes(q) ||
    String(r.txGb).toLowerCase().includes(q)
  );
};

export function NetflowPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'ip',
        header: 'IP',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.ip)}</span>,
      },
      {
        accessorKey: 'username',
        header: 'User',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.username)}</span>,
      },
      {
        accessorKey: 'rxGb',
        header: 'RX GB',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.rxGb)}</span>,
      },
      {
        accessorKey: 'txGb',
        header: 'TX GB',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.txGb)}</span>,
      },
      {
        accessorKey: 'apps',
        header: 'Apps',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.apps)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.netflowTopTalkers;
  const totalGb = rows.reduce((s, r) => s + r.rxGb + r.txGb, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="NetFlow Top Talkers"
        subtitle="High bandwidth talkers by username"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "NetFlow Top Talkers" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} talkers · {totalGb.toLocaleString()} GB
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="username"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}

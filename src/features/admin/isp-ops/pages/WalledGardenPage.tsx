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

type Row = IspOpsData['walledGardenRules'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.host).toLowerCase().includes(q) ||
    String(r.comment).toLowerCase().includes(q) ||
    String(r.enabled).toLowerCase().includes(q)
  );
};

export function WalledGardenPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'host',
        header: 'Host',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.host)}</span>,
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.comment)}</span>,
      },
      {
        accessorKey: 'enabled',
        header: 'Enabled',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.enabled)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.walledGardenRules;
  const enabled = rows.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Walled Garden"
        subtitle="Hosts reachable before hotspot login"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Walled Garden" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} hosts · {enabled} enabled
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="host"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}

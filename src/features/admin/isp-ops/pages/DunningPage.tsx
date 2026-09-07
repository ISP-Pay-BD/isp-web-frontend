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

type Row = IspOpsData['dunningSteps'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.dayOffset).toLowerCase().includes(q) ||
    String(r.action).toLowerCase().includes(q) ||
    String(r.channel).toLowerCase().includes(q) ||
    String(r.enabled).toLowerCase().includes(q)
  );
};

export function DunningPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'dayOffset',
        header: 'Day',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.dayOffset)}</span>,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.action)}</span>,
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.channel)}</span>,
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

  const rows = data.dunningSteps;
  const enabled = rows.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dunning Schedule"
        subtitle="Automated collection and suspend timeline"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Dunning Schedule" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} steps · {enabled} enabled
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="action"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}

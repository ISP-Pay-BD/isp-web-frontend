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

type Row = IspOpsData['fraudEvents'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.at).toLowerCase().includes(q) ||
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.score).toLowerCase().includes(q) ||
    String(r.reason).toLowerCase().includes(q)
  );
};

export function FraudPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'at',
        header: 'When',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.at)}</span>,
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.customerName)}</span>,
      },
      {
        accessorKey: 'score',
        header: 'Score',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.score)}</span>,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.reason)}</span>,
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

  const rows = data.fraudEvents;
  const open = rows.filter((r) => r.status === 'open').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Score"
        subtitle="Suspicious session and sharing signals"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Fraud Score" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} events · {open} open
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="customerName"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}

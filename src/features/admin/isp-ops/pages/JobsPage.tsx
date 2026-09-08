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

type Row = IspOpsData['workOrders'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.title).toLowerCase().includes(q) ||
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.type).toLowerCase().includes(q) ||
    String(r.assignee).toLowerCase().includes(q)
  );
};

export function JobsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Job',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.title)}</span>,
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.customerName)}</span>,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.type)}</Badge>
        ),
      },
      {
        accessorKey: 'assignee',
        header: 'Assignee',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.assignee)}</span>,
      },
      {
        accessorKey: 'dueAt',
        header: 'Due',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.dueAt)}</span>,
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

  const rows = data.workOrders;
  const open = rows.filter((r) => r.status === 'open' || r.status === 'in_progress').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Work Orders"
        subtitle="Install, repair, shift, and collection jobs"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Work Orders' }]}
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: 'jobs' },
          { value: open, label: 'open' },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="title"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search jobs…"
      />
    </div>
  );
}

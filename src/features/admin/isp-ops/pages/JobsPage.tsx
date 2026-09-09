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

const typeBadgeClass: Record<string, string> = {
  install: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/25',
  repair: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25',
  shift: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/25',
  collect: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25',
};

const statusBadgeClass: Record<string, string> = {
  open: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/25',
  in_progress: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25',
  done: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25',
  cancelled: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:bg-zinc-500/15 dark:text-zinc-400 dark:border-zinc-500/25',
};

export function JobsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Job',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="text-foreground font-medium">{String(row.original.title)}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{String(row.original.customerName)}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const type = String(row.original.type);
          return (
            <Badge variant="outline" className={`capitalize ${typeBadgeClass[type] ?? ''}`}>
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'assignee',
        header: 'Assignee',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{String(row.original.assignee)}</span>
        ),
      },
      {
        accessorKey: 'dueAt',
        header: 'Due',
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">{String(row.original.dueAt)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = String(row.original.status);
          const label = status.replace('_', ' ');
          return (
            <Badge variant="outline" className={`capitalize ${statusBadgeClass[status] ?? ''}`}>
              {label}
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

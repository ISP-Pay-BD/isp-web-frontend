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

type Row = IspOpsData['outages'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.title).toLowerCase().includes(q) ||
    String(r.severity).toLowerCase().includes(q) ||
    String(r.area).toLowerCase().includes(q) ||
    String(r.affected).toLowerCase().includes(q)
  );
};

const severityBadgeClass: Record<string, string> = {
  minor: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/25',
  major: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25',
  critical: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25',
};

const statusBadgeClass: Record<string, string> = {
  investigating: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25',
  identified: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/25',
  monitoring: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/25',
  resolved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25',
};

export function OutagesPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Incident',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="text-foreground font-medium">{String(row.original.title)}</span>
        ),
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ row }) => {
          const severity = String(row.original.severity);
          return (
            <Badge variant="outline" className={`capitalize ${severityBadgeClass[severity] ?? ''}`}>
              {severity}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'area',
        header: 'Area',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{String(row.original.area)}</span>
        ),
      },
      {
        accessorKey: 'affected',
        header: 'Affected',
        cell: ({ row }) => (
          <span className="text-foreground font-medium tabular-nums">{String(row.original.affected)}</span>
        ),
      },
      {
        accessorKey: 'startedAt',
        header: 'Started',
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">{String(row.original.startedAt)}</span>
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

  const rows = data.outages;
  const open = rows.filter((r) => r.status !== 'resolved');
  const affected = open.reduce((s, r) => s + r.affected, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Outage Board"
        subtitle="Live network incidents and customer impact"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Outage Board' }]}
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: 'incidents' },
          { value: open.length, label: 'open' },
          { value: affected.toLocaleString(), label: 'affected' },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="title"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}

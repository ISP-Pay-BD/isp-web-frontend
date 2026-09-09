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

type Row = IspOpsData['leads'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.phone).toLowerCase().includes(q) ||
    String(r.area).toLowerCase().includes(q) ||
    String(r.packageInterest).toLowerCase().includes(q)
  );
};

const stageBadgeClass: Record<string, string> = {
  new: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/25',
  contacted: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/25',
  survey: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25',
  won: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25',
  lost: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 dark:bg-zinc-500/15 dark:text-zinc-400 dark:border-zinc-500/25',
};

export function LeadsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Lead',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="text-foreground font-medium">{String(row.original.name)}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-xs tabular-nums">{String(row.original.phone)}</span>
        ),
      },
      {
        accessorKey: 'area',
        header: 'Area',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{String(row.original.area)}</span>
        ),
      },
      {
        accessorKey: 'packageInterest',
        header: 'Interest',
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {String(row.original.packageInterest)}
          </Badge>
        ),
      },
      {
        accessorKey: 'stage',
        header: 'Stage',
        cell: ({ row }) => {
          const stage = String(row.original.stage);
          return (
            <Badge variant="outline" className={`capitalize ${stageBadgeClass[stage] ?? ''}`}>
              {stage}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'owner',
        header: 'Owner',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{String(row.original.owner)}</span>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.leads;
  const open = rows.filter((r) => r.stage !== 'won' && r.stage !== 'lost').length;
  const won = rows.filter((r) => r.stage === 'won').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leads Pipeline"
        subtitle="Sales leads and conversion stages"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Leads Pipeline' }]}
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: 'leads' },
          { value: open, label: 'open' },
          { value: won, label: 'won' },
        ]}
      />
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

'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type Row = IspOpsData['billingPolicies'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.mode).toLowerCase().includes(q) ||
    String(r.graceDays).toLowerCase().includes(q) ||
    String(r.fupGb).toLowerCase().includes(q)
  );
};

export function BillingPoliciesPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Policy Name',
        enableHiding: false,
        cell: ({ row }) => <span className="font-semibold text-foreground text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'mode',
        header: 'Mode',
        cell: ({ row }) => {
          const mode = String(row.original.mode);
          return (
            <Badge
              variant="outline"
              className={cn(
                'capitalize text-xs font-semibold',
                mode === 'prepaid' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                mode === 'postpaid' && 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                mode === 'hybrid' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              )}
            >
              {mode}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'graceDays',
        header: 'Grace Period',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {row.original.graceDays} {row.original.graceDays === 1 ? 'day' : 'days'}
          </span>
        ),
      },
      {
        accessorKey: 'fupGb',
        header: 'FUP Cap',
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-foreground">
            {row.original.fupGb ? `${row.original.fupGb} GB` : <span className="text-muted-foreground italic">Unlimited</span>}
          </span>
        ),
      },
      {
        accessorKey: 'autoSuspend',
        header: 'Auto Suspend',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              'text-[11px] font-semibold',
              row.original.autoSuspend
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-muted/40 text-muted-foreground border-border/60'
            )}
          >
            {row.original.autoSuspend ? 'Enabled' : 'Disabled'}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.billingPolicies;
  const autoSuspend = rows.filter((r) => r.autoSuspend).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Billing Policies"
        subtitle="Grace, FUP, prepaid / postpaid / hybrid rules"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Billing Policies" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "policies" },
          { value: autoSuspend, label: "auto-suspend" },
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

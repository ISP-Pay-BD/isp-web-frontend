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
        header: 'Policy',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'mode',
        header: 'Mode',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.mode)}</Badge>
        ),
      },
      {
        accessorKey: 'graceDays',
        header: 'Grace days',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.graceDays)}</span>,
      },
      {
        accessorKey: 'fupGb',
        header: 'FUP GB',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.fupGb)}</span>,
      },
      {
        accessorKey: 'autoSuspend',
        header: 'Auto suspend',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.autoSuspend)}</span>,
      }
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

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

type Row = IspOpsData['referralAnalytics'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.referrer).toLowerCase().includes(q) ||
    String(r.referrals).toLowerCase().includes(q) ||
    String(r.converted).toLowerCase().includes(q) ||
    String(r.rewardBdt).toLowerCase().includes(q)
  );
};

export function ReferralAnalyticsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'referrer',
        header: 'Referrer',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.referrer)}</span>,
      },
      {
        accessorKey: 'referrals',
        header: 'Referrals',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.referrals)}</span>,
      },
      {
        accessorKey: 'converted',
        header: 'Converted',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.converted)}</span>,
      },
      {
        accessorKey: 'rewardBdt',
        header: 'Reward BDT',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.rewardBdt)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.referralAnalytics;
  const rewards = rows.reduce((s, r) => s + r.rewardBdt, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Analytics"
        subtitle="Top referrers and conversion rewards"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Referral Analytics" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} referrers · {rewards.toLocaleString()} ৳ rewards
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="referrer"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}

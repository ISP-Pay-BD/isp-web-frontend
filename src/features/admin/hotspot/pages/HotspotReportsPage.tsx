'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import type { HotspotReportItem } from '@/data/admin/network-ops.data';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { formatBdtWithSymbol } from '@/lib/format';
import { BarChart3 } from 'lucide-react';

const reportSearchFilter = (
  row: LegacyRow<HotspotReportItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    r.username.toLowerCase().includes(q) ||
    r.soldBy.toLowerCase().includes(q) ||
    r.routerName.toLowerCase().includes(q)
  );
};

export function HotspotReportsPage() {
  const { data, isLoading, isError, refetch } = useHotspotData();

  const reports = data?.reports ?? [];
  const totalRevenue = reports.reduce((s, r) => s + r.priceBdt, 0);
  const cashSales = reports.filter((r) => r.paymentMethod === 'Cash').length;
  const mobileSales = reports.filter((r) => r.paymentMethod !== 'Cash').length;

  const columns = useMemo<LegacyColumnDef<HotspotReportItem, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        enableHiding: false,
      },
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
      },
      {
        accessorKey: 'profileName',
        header: 'Profile',
      },
      {
        accessorKey: 'priceBdt',
        header: 'Amount',
        cell: ({ row }) => formatBdtWithSymbol(row.original.priceBdt),
      },
      {
        accessorKey: 'soldBy',
        header: 'Sold by',
      },
      {
        accessorKey: 'routerName',
        header: 'Router',
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Payment',
        cell: ({ row }) => <Badge variant="outline">{row.original.paymentMethod}</Badge>,
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load hotspot reports"
          description="Could not fetch voucher sales data."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Sales Report"
        subtitle="Voucher sales by date, router, and payment method"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Hotspot', url: '/admin/hotspot' },
          { label: 'Reports' },
        ]}
      />

            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{formatBdtWithSymbol(totalRevenue)}</span>{' '}
          <span className="text-muted-foreground">total sales</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{String(cashSales)}</span>{' '}
          <span className="text-muted-foreground">cash transactions</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{String(mobileSales)}</span>{' '}
          <span className="text-muted-foreground">mobile wallet</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        getRowId={(row) => row.id}
        searchKey="username"
        searchPlaceholder="Filter by user, cashier, or router…"
        searchFilterFn={reportSearchFilter}
        facetFilters={[{ columnId: 'paymentMethod', title: 'Payment' }]}
        emptyTitle="No sales records"
        emptyDescription="Voucher sales will appear here."
      />

      <Link href="/admin/hotspot" className="text-primary text-sm hover:underline">
        ← Back to hotspot hub
      </Link>
    </div>
  );
}

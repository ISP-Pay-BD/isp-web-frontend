'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import type { HotspotReportItem } from '@/data/admin/network-ops.data';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
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
  const { data, isLoading } = useHotspotData();

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

  if (isLoading) return <PageSkeleton variant="dashboard" rows={5} />;

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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total sales" value={formatBdtWithSymbol(totalRevenue)} icon={BarChart3} />
        <StatCard title="Cash transactions" value={String(cashSales)} />
        <StatCard title="Mobile wallet" value={String(mobileSales)} />
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

'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useHotspotData } from '../hooks/useHotspotData';
import type { HotspotReportItem } from '@/data/admin/network-ops.data';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import {
  Download,
  BarChart3,
  TrendingUp,
  Receipt,
  CreditCard,
  Banknote,
  Printer,
  MoreHorizontal,
  Router,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

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
    r.routerName.toLowerCase().includes(q) ||
    r.profileName.toLowerCase().includes(q) ||
    r.paymentMethod.toLowerCase().includes(q)
  );
};

export function HotspotReportsPage() {
  const { data, isLoading, isError, refetch } = useHotspotData();

  const reports = data?.reports ?? [];
  const totalRevenue = reports.reduce((s, r) => s + (r.priceBdt || 0), 0);
  const totalCount = reports.length;
  const cashSales = reports.filter((r) => r.paymentMethod === 'Cash').length;
  const digitalSales = totalCount - cashSales;
  const cashRevenue = reports.filter((r) => r.paymentMethod === 'Cash').reduce((s, r) => s + (r.priceBdt || 0), 0);
  const digitalRevenue = totalRevenue - cashRevenue;

  const handleExportCsv = () => {
    const headers = ['Sale Date', 'Username / PIN', 'Profile Name', 'Amount (BDT)', 'Sold By', 'Router Gateway', 'Payment Method'];
    const rows = reports.map((r) => [
      r.date,
      r.username,
      `"${r.profileName}"`,
      r.priceBdt,
      `"${r.soldBy}"`,
      `"${r.routerName}"`,
      r.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotspot_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Hotspot sales report exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<HotspotReportItem, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Transaction Date',
        enableHiding: false,
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.date}</span>
        ),
      },
      {
        accessorKey: 'username',
        header: 'Voucher PIN User',
        enableHiding: false,
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-foreground text-sm">{row.original.username}</span>
          </div>
        ),
      },
      {
        accessorKey: 'profileName',
        header: 'Bandwidth Tier',
        size: 180,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background text-xs font-medium">
            {row.original.profileName}
          </Badge>
        ),
      },
      {
        accessorKey: 'priceBdt',
        header: 'Amount',
        size: 130,
        cell: ({ row }) => (
          <span className="font-bold text-sm tabular-nums text-foreground">
            {formatBdtWithSymbol(row.original.priceBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'soldBy',
        header: 'Cashier / Counter',
        size: 170,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.soldBy}</span>
        ),
      },
      {
        accessorKey: 'routerName',
        header: 'Router Gateway',
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Router className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{row.original.routerName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Payment Mode',
        size: 130,
        cell: ({ row }) => {
          const isCash = row.original.paymentMethod === 'Cash';
          return (
            <Badge
              variant="outline"
              className={
                isCash
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  : 'bg-primary/10 text-primary border-primary/30'
              }
            >
              {row.original.paymentMethod}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Report Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.info(`Printing sales receipt for ${r.username}`)}>
                  <Printer className="h-3.5 w-3.5 mr-2" />
                  Print Sales Receipt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
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
        title="Hotspot Sales & Revenue Report"
        subtitle="Detailed audit log of voucher transactions by date, selling cashier, payment method, and router location."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Hotspot', href: '/admin/hotspot' },
          { label: 'Sales Reports' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export Sales CSV
            </Button>
            <Button size="sm" onClick={() => toast.info('Printing revenue summary')} className="h-9">
              <Printer className="mr-2 h-4 w-4" />
              Print Summary
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Sales</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatBdtWithSymbol(totalRevenue)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{totalCount} transactions logged</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Cash Counter</span>
            <Banknote className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatBdtWithSymbol(cashRevenue)}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">{cashSales} physical vouchers</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Digital & MFS</span>
            <CreditCard className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatBdtWithSymbol(digitalRevenue)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{digitalSales} bKash/Nagad sales</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Transaction</span>
            <Receipt className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatBdtWithSymbol(totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Per voucher ticket</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={reports}
        searchKey="username"
        searchFilterFn={reportSearchFilter}
        searchPlaceholder="Search by username, cashier, router, or payment method..."
      />
    </div>
  );
}

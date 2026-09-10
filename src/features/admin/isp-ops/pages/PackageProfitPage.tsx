'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import {
  TrendingUp,
  Boxes,
  Building2,
  Download,
  Percent,
  DollarSign,
  Users,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Row = IspOpsData['packageProfitRows'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.popName).toLowerCase().includes(q) ||
    String(r.packageName).toLowerCase().includes(q)
  );
};

export function PackageProfitPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const rows = data?.packageProfitRows ?? [];

  const stats = useMemo(() => {
    const totalRevenue = rows.reduce((s, r) => s + r.revenueBdt, 0);
    const totalCost = rows.reduce((s, r) => s + r.costBdt, 0);
    const totalProfit = rows.reduce((s, r) => s + r.profitBdt, 0);
    const totalCustomers = rows.reduce((s, r) => s + r.customers, 0);
    const marginPct = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    // Find top package
    const topPackage = [...rows].sort((a, b) => b.profitBdt - a.profitBdt)[0];

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      totalCustomers,
      marginPct,
      topPackage,
    };
  }, [rows]);

  const handleExportCsv = () => {
    const headers = [
      'POP Hub',
      'Package Name',
      'Customers',
      'Revenue (BDT)',
      'Cost (BDT)',
      'Profit (BDT)',
      'Margin (%)',
    ];
    const csvRows = rows.map((r) => {
      const margin = r.revenueBdt > 0 ? Math.round((r.profitBdt / r.revenueBdt) * 100) : 0;
      return [
        r.popName,
        r.packageName,
        r.customers,
        r.revenueBdt,
        r.costBdt,
        r.profitBdt,
        `${margin}%`,
      ];
    });
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `package_profitability_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Package profitability statement exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'popName',
        header: 'POP Reseller Hub',
        enableHiding: false,
        size: 220,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.popName}</div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {row.original.id}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'packageName',
        header: 'Internet Package Plan',
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-secondary/80 border border-border/50 text-foreground">
              <Boxes className="h-3.5 w-3.5" />
            </div>
            <div className="font-semibold text-xs text-foreground">
              {row.original.packageName}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'customers',
        header: 'Subscribers',
        size: 120,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 font-mono text-xs font-semibold text-foreground">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.customers}</span>
          </div>
        ),
      },
      {
        accessorKey: 'revenueBdt',
        header: 'Gross Revenue',
        size: 140,
        cell: ({ row }) => (
          <div className="font-mono text-xs font-bold text-foreground">
            <CurrencyDisplay amount={row.original.revenueBdt} />
          </div>
        ),
      },
      {
        accessorKey: 'costBdt',
        header: 'Bandwidth Cost',
        size: 130,
        cell: ({ row }) => (
          <div className="font-mono text-xs font-medium text-muted-foreground">
            <CurrencyDisplay amount={row.original.costBdt} />
          </div>
        ),
      },
      {
        accessorKey: 'profitBdt',
        header: 'Net Gross Profit',
        size: 140,
        cell: ({ row }) => (
          <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={row.original.profitBdt} />
          </div>
        ),
      },
      {
        id: 'margin',
        header: 'Margin %',
        size: 130,
        cell: ({ row }) => {
          const rev = row.original.revenueBdt;
          const profit = row.original.profitBdt;
          const margin = rev > 0 ? Math.round((profit / rev) * 100) : 0;
          return (
            <div className="space-y-1 w-full max-w-[100px]">
              <div className="flex justify-between text-[11px] font-mono font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">{margin}%</span>
                <span className="text-muted-foreground text-[9px]">margin</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(margin, 100)}%` }}
                />
              </div>
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load profitability records"
        description="Could not fetch package profit analytics."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Package Profit by POP"
        subtitle="Revenue vs bandwidth delivery cost per package plan across all Point-of-Presence reseller hubs"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'POP Suite' },
          { label: 'Package Profit' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Analytics
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">
            <CurrencyDisplay amount={stats.totalRevenue} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">total gross revenue</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-muted-foreground">
            <CurrencyDisplay amount={stats.totalCost} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">upstream bandwidth costs</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={stats.totalProfit} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">net aggregate profit</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{stats.marginPct}%</span>{' '}
          <span className="text-muted-foreground">overall gross profit margin</span>
        </p>
      </div>

      {/* Top Performer Highlights */}
      {stats.topPackage && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Top Profitable Package
                  </span>
                  <div className="font-bold text-sm text-foreground">
                    {stats.topPackage.packageName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.topPackage.popName} &middot; {stats.topPackage.customers} Users
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ৳{stats.topPackage.profitBdt.toLocaleString()}
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  {Math.round((stats.topPackage.profitBdt / stats.topPackage.revenueBdt) * 100)}% Margin
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Subscriber Footprint
                  </span>
                  <div className="font-bold text-sm text-foreground">
                    {stats.totalCustomers.toLocaleString()} Active Reseller Lines
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Across {rows.length} Package SKU deployments
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-foreground">
                  ৳{stats.totalCustomers > 0 ? Math.round(stats.totalRevenue / stats.totalCustomers) : 0}
                </div>
                <span className="text-[10px] text-muted-foreground">ARPU / Subscriber</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        searchKey="popName"
        searchPlaceholder="Search by POP hub or package plan..."
        searchFilterFn={searchFilter}
        emptyTitle="No package profitability records"
        emptyDescription="Profitability breakdown by package will appear once bandwidth telemetry is processed."
      />
    </div>
  );
}

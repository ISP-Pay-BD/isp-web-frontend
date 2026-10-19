'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { Boxes, Building2, Download, DollarSign, Users, TrendingUp, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { saveBlob } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { cn } from '@/lib/utils';
import { useLocale } from '@/i18n/locale-context';
import { monthToDateRange, usePackageRevenue, type PackageRevenueRow } from '@/features/admin/reports/hooks/use-billing-reports';

const searchFilter = (row: LegacyRow<PackageRevenueRow>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  return row.original.ownerName.toLowerCase().includes(q) || row.original.packageName.toLowerCase().includes(q);
};

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Collected revenue per POP / package — only money actually received; no invented cost or margin. */
export function PackageProfitPage() {
  const { t } = useLocale();
  const [range, setRange] = useState(monthToDateRange);
  const { data, isLoading, isError, error, refetch } = usePackageRevenue(range);
  const rows = useMemo(() => data?.items ?? [], [data]);
  const totals = data?.totals;
  const top = rows[0];

  // The endpoint returns the complete (non-paginated) set, so this CSV is the whole report.
  const handleExportCsv = () => {
    const header = ['Owner', 'Role', 'Package', 'List price (BDT)', 'Customers', 'Active', 'Collected (BDT)', 'Payments'];
    const lines = rows.map((r) =>
      [r.ownerName, r.ownerRole, r.packageName, r.listPriceBdt ?? '', r.customers, r.activeCustomers, r.collectedBdt, r.payments].map(csvCell).join(','),
    );
    saveBlob(new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' }), `package_revenue_${range.from}_${range.to}.csv`);
    toast.success(t('admin.ops.packageProfit.exported', 'Package revenue exported to CSV'));
  };

  const columns = useMemo<LegacyColumnDef<PackageRevenueRow, unknown>[]>(
    () => [
      {
        accessorKey: 'ownerName',
        header: t('admin.ops.packageProfit.colOwner', 'Owner (tenant / POP)'),
        enableHiding: false,
        size: 220,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.ownerName || `#${row.original.ownerId}`}</div>
              <div className="text-xs text-muted-foreground">{row.original.ownerRole === 'resellerAdmin' ? t('admin.ops.packageProfit.popReseller', 'POP reseller') : t('admin.ops.packageProfit.direct', 'Direct')}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'packageName',
        header: t('admin.customers.list.colPackage', 'Package'),
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-secondary/80 border border-border/50 text-foreground"><Boxes className="h-3.5 w-3.5" /></div>
            <div className="font-semibold text-xs text-foreground">{row.original.packageName || t('admin.ops.packageProfit.noPackage', 'No package')}</div>
          </div>
        ),
      },
      {
        accessorKey: 'listPriceBdt',
        header: t('admin.ops.packageProfit.colListPrice', 'List price'),
        size: 110,
        cell: ({ row }) => (row.original.listPriceBdt === null ? <span className="text-muted-foreground">—</span> : <CurrencyDisplay amount={row.original.listPriceBdt} />),
      },
      {
        accessorKey: 'customers',
        header: t('admin.ops.packageProfit.colCustomers', 'Customers'),
        size: 100,
        cell: ({ row }) => <span className="font-mono">{row.original.customers}</span>,
      },
      {
        accessorKey: 'activeCustomers',
        header: t('status.active', 'Active'),
        size: 90,
        cell: ({ row }) => <span className="font-mono text-emerald-600 dark:text-emerald-400">{row.original.activeCustomers}</span>,
      },
      {
        accessorKey: 'collectedBdt',
        header: t('admin.ops.packageProfit.colCollected', 'Collected'),
        size: 130,
        cell: ({ row }) => <CurrencyDisplay amount={row.original.collectedBdt} className="font-bold text-foreground" />,
      },
      {
        accessorKey: 'payments',
        header: t('admin.ops.packageProfit.colPayments', 'Payments'),
        size: 90,
        cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.original.payments}</span>,
      },
    ],
    [t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return <EmptyState variant="error" title={t('admin.ops.packageProfit.loadFailed', 'Failed to load package revenue')} description={errorMessage(error)} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.ops.packageProfit.title', 'Package Revenue')}
        subtitle={t('admin.ops.packageProfit.subtitle', 'Money collected per package and POP for the selected period')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('admin.ops.packageProfit.breadcrumbPop', 'POP Suite') },
          { label: t('admin.ops.packageProfit.breadcrumb', 'Package revenue') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Input type="date" value={range.from} max={range.to} onChange={(e) => e.target.value && setRange((r) => ({ ...r, from: e.target.value }))} className="h-8 w-[140px] text-xs" aria-label={t('admin.ops.packageProfit.from', 'From')} />
            <Input type="date" value={range.to} min={range.from} onChange={(e) => e.target.value && setRange((r) => ({ ...r, to: e.target.value }))} className="h-8 w-[140px] text-xs" aria-label={t('admin.ops.packageProfit.to', 'To')} />
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!rows.length} className="text-xs h-8">
              <Download className="mr-1.5 h-3.5 w-3.5" /> {t('admin.ops.packageProfit.exportCsv', 'Export CSV')}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label={t('admin.ops.packageProfit.colCollected', 'Collected')} icon={<DollarSign className="h-4 w-4" />} tone="bg-emerald-500/10 text-emerald-500">
          <CurrencyDisplay amount={totals?.collectedBdt ?? 0} />
        </Kpi>
        <Kpi label={t('admin.ops.packageProfit.colCustomers', 'Customers')} icon={<Users className="h-4 w-4" />} tone="bg-primary/10 text-primary">{totals?.customers ?? 0}</Kpi>
        <Kpi label={t('admin.ops.packageProfit.kpiActive', 'Active customers')} icon={<UserCheck className="h-4 w-4" />} tone="bg-blue-500/10 text-blue-500">{totals?.activeCustomers ?? 0}</Kpi>
        <Kpi label={t('admin.ops.packageProfit.kpiTop', 'Top package')} icon={<TrendingUp className="h-4 w-4" />} tone="bg-amber-500/10 text-amber-500">
          <span className="text-base">{top && top.collectedBdt > 0 ? top.packageName || t('admin.ops.packageProfit.noPackage', 'No package') : '—'}</span>
        </Kpi>
      </div>

      <DataTable urlState
        columns={columns}
        data={rows}
        getRowId={(r) => r.key}
        searchKey="packageName"
        searchFilterFn={searchFilter}
        searchPlaceholder={t('admin.ops.packageProfit.search', 'Search owner or package...')}
        emptyTitle={t('admin.ops.packageProfit.emptyTitle', 'No packages')}
        emptyDescription={t('admin.ops.packageProfit.emptyHint', 'No customers are assigned to packages yet.')}
      />
    </div>
  );
}

function Kpi({ label, icon, tone, children }: { label: string; icon: ReactNode; tone: string; children: ReactNode }) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className={cn('p-2 rounded-lg', tone)}>{icon}</div>
        </div>
        <div className="mt-2 text-xl font-bold tracking-tight text-foreground tabular-nums truncate">{children}</div>
      </CardContent>
    </Card>
  );
}

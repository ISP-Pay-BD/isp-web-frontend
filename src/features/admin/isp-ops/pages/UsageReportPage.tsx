'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Activity, ArrowUpRight, ArrowDownLeft, Users, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate, numberLocale } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import {
  monthToDateRange,
  useBandwidthSeries,
  useUsageReport,
  type UsageFilters,
  type UsageRow,
} from '@/features/admin/reports/hooks/use-billing-reports';

const gb = (v: number) => `${v.toLocaleString(numberLocale(), { maximumFractionDigits: 2 })} GB`;

export function UsageReportPage() {
  const t = useTranslations();
  const [filters, setFilters] = useState<UsageFilters>(() => ({ page: 1, pageSize: 20, search: '', ...monthToDateRange() }));
  const { data, isLoading, isError, error, isFetching, refetch } = useUsageReport(filters);
  const series = useBandwidthSeries({ from: filters.from, to: filters.to });

  const peak = useMemo(() => Math.max(1, ...(series.data ?? []).map((p) => p.downloadGb + p.uploadGb)), [series.data]);

  const rows = useMemo(() => data?.items ?? [], [data?.items]);

  const columns = useMemo<LegacyColumnDef<UsageRow, unknown>[]>(
    () => [
      {
        id: 'customer',
        accessorFn: (r) => r.customerName || r.customerId,
        header: t('admin.ops.usageReport.colCustomer', 'Customer'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-foreground">{row.original.customerName || `#${row.original.customerId}`}</div>
            <div className="font-mono text-xs font-normal text-muted-foreground">{row.original.mobile || t('admin.ops.usageReport.idLabel', 'ID {id}', { id: row.original.customerId })}</div>
          </div>
        ),
      },
      {
        accessorKey: 'packageName',
        header: t('admin.ops.usageReport.colPackage', 'Package'),
        cell: ({ row }) => <span>{row.original.packageName || '—'}</span>,
      },
      {
        accessorKey: 'downloadGb',
        header: t('admin.ops.usageReport.colDownload', 'Download'),
        cell: ({ row }) => <span className="font-mono tabular-nums">{gb(row.original.downloadGb)}</span>,
      },
      {
        accessorKey: 'uploadGb',
        header: t('admin.ops.usageReport.colUpload', 'Upload'),
        cell: ({ row }) => <span className="font-mono tabular-nums">{gb(row.original.uploadGb)}</span>,
      },
      {
        id: 'total',
        accessorFn: (r) => r.downloadGb + r.uploadGb,
        header: t('admin.ops.usageReport.colTotal', 'Total'),
        cell: ({ row }) => <span className="font-mono font-bold tabular-nums">{gb(Math.round((row.original.downloadGb + row.original.uploadGb) * 100) / 100)}</span>,
      },
      {
        accessorKey: 'activeDays',
        header: t('admin.ops.usageReport.colActiveDays', 'Active days'),
        cell: ({ row }) => <span className="font-mono tabular-nums">{row.original.activeDays}</span>,
      },
      {
        accessorKey: 'lastSeen',
        header: t('admin.ops.usageReport.colLastSeen', 'Last seen'),
        cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.original.lastSeen ? formatDate(row.original.lastSeen) : '—'}</span>,
      },
    ],
    [t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError && !data) {
    return <EmptyState variant="error" title={t('admin.ops.usageReport.loadFailed', 'Failed to load usage report')} description={errorMessage(error)} actionLabel={t('common.retry', 'Retry')} onAction={() => refetch()} />;
  }

  const summary = data?.summary ?? { customers: 0, downloadGb: 0, uploadGb: 0 };
  const avg = summary.customers > 0 ? (summary.downloadGb + summary.uploadGb) / summary.customers : 0;

  return (
    <div className="space-y-6 w-full pb-16">
      <PageHeader
        title={t('admin.ops.usageReport.title', 'Bandwidth Usage Report')}
        subtitle={t('admin.ops.usageReport.subtitle', 'Recorded customer transfer for the selected period')}
        breadcrumb={[{ label: 'Admin', url: '/admin/dashboard' }, { label: 'Reports' }, { label: 'Usage' }]}
        actions={
          <div className="flex items-center gap-2">
            <Input type="date" value={filters.from} max={filters.to} onChange={(e) => e.target.value && setFilters((f) => ({ ...f, page: 1, from: e.target.value }))} className="h-8 w-[140px] text-xs" aria-label={t('admin.ops.usageReport.from', 'From')} />
            <Input type="date" value={filters.to} min={filters.from} onChange={(e) => e.target.value && setFilters((f) => ({ ...f, page: 1, to: e.target.value }))} className="h-8 w-[140px] text-xs" aria-label={t('admin.ops.usageReport.to', 'To')} />
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label={t('admin.ops.usageReport.colDownload', 'Download')} icon={<ArrowDownLeft className="h-4 w-4" />} tone="bg-blue-500/10 text-blue-500">{gb(summary.downloadGb)}</Kpi>
        <Kpi label={t('admin.ops.usageReport.colUpload', 'Upload')} icon={<ArrowUpRight className="h-4 w-4" />} tone="bg-emerald-500/10 text-emerald-500">{gb(summary.uploadGb)}</Kpi>
        <Kpi label={t('admin.ops.usageReport.kpiCustomers', 'Customers with usage')} icon={<Users className="h-4 w-4" />} tone="bg-primary/10 text-primary">{summary.customers}</Kpi>
        <Kpi label={t('admin.ops.usageReport.kpiAverage', 'Average per customer')} icon={<TrendingUp className="h-4 w-4" />} tone="bg-amber-500/10 text-amber-500">{gb(Math.round(avg * 100) / 100)}</Kpi>
      </div>

      <Card className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> {t('admin.ops.usageReport.daily', 'Daily transfer')}</CardTitle>
          <CardDescription className="text-xs">{t('admin.ops.usageReport.dailyHint', 'Most recent recorded days in the period')}</CardDescription>
        </CardHeader>
        <CardContent>
          {series.isLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-muted/30" />
          ) : series.isError ? (
            <p className="text-xs text-destructive">{errorMessage(series.error)}</p>
          ) : !series.data?.length ? (
            <p className="text-xs text-muted-foreground py-4 text-center">{t('admin.ops.usageReport.noUsage', 'No usage recorded in this period.')}</p>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {series.data.map((p) => {
                const total = p.downloadGb + p.uploadGb;
                return (
                  <div key={p.date} className="flex-1 min-w-0 flex flex-col items-center gap-1" title={`${p.date}: ↓${gb(p.downloadGb)} ↑${gb(p.uploadGb)}`}>
                    <div className="w-full flex flex-col justify-end h-24 rounded bg-muted/30 overflow-hidden">
                      <div className="w-full bg-emerald-500/70" style={{ height: `${(p.uploadGb / peak) * 100}%` }} />
                      <div className="w-full bg-blue-500/80" style={{ height: `${(p.downloadGb / peak) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground truncate w-full text-center">{p.date.slice(5)}</span>
                    <span className="sr-only">{gb(total)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <DataTable
        urlState
        className={cn(isFetching && 'opacity-80')}
        columns={columns}
        data={rows}
        getRowId={(r) => r.customerId}
        searchPlaceholder={t('admin.ops.usageReport.searchPlaceholder', 'Search customer, mobile or PPPoE name...')}
        emptyTitle={t('admin.ops.usageReport.noUsage', 'No usage recorded in this period.')}
        server={{
          page: filters.page,
          pageSize: filters.pageSize,
          total: data?.meta.total ?? 0,
          onPageChange: (page) => setFilters((f) => ({ ...f, page })),
          onPageSizeChange: (pageSize) => setFilters((f) => ({ ...f, page: 1, pageSize })),
          search: filters.search,
          onSearchChange: (search) => setFilters((f) => (f.search === search ? f : { ...f, page: 1, search })),
        }}
        toolbarActions={
          <Badge variant="secondary" className="text-xs">
            {formatDate(filters.from)} – {formatDate(filters.to)}
          </Badge>
        }
      />
    </div>
  );
}

function Kpi({ label, icon, tone, children }: { label: string; icon: ReactNode; tone: string; children: ReactNode }) {
  return (
    <Card className="p-4 border-border/60 bg-card/80 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn('p-2 rounded-lg', tone)}>{icon}</div>
      </div>
      <div className="mt-2 text-xl font-bold tracking-tight text-foreground tabular-nums">{children}</div>
    </Card>
  );
}

'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Activity, Search, ArrowUpRight, ArrowDownLeft, Users, X, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { TablePagination } from '@/components/shared/TablePagination';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import {
  monthToDateRange,
  useBandwidthSeries,
  useUsageReport,
  type UsageFilters,
} from '@/features/admin/reports/hooks/use-billing-reports';

const gb = (v: number) => `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB`;

export function UsageReportPage() {
  const [filters, setFilters] = useState<UsageFilters>(() => ({ page: 1, pageSize: 20, search: '', ...monthToDateRange() }));
  const [searchInput, setSearchInput] = useState('');
  const { data, isLoading, isError, error, isFetching, refetch } = useUsageReport(filters);
  const series = useBandwidthSeries({ from: filters.from, to: filters.to });

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.search === searchInput.trim() ? f : { ...f, page: 1, search: searchInput.trim() })), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const peak = useMemo(() => Math.max(1, ...(series.data ?? []).map((p) => p.downloadGb + p.uploadGb)), [series.data]);

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError && !data) {
    return <EmptyState title="Failed to load usage report" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const summary = data?.summary ?? { customers: 0, downloadGb: 0, uploadGb: 0 };
  const rows = data?.items ?? [];
  const avg = summary.customers > 0 ? (summary.downloadGb + summary.uploadGb) / summary.customers : 0;

  return (
    <div className="space-y-6 w-full pb-16">
      <PageHeader
        title="Bandwidth Usage Report"
        subtitle="Recorded customer transfer for the selected period"
        breadcrumb={[{ label: 'Admin', url: '/admin/dashboard' }, { label: 'Reports' }, { label: 'Usage' }]}
        actions={
          <div className="flex items-center gap-2">
            <Input type="date" value={filters.from} max={filters.to} onChange={(e) => e.target.value && setFilters((f) => ({ ...f, page: 1, from: e.target.value }))} className="h-8 w-[140px] text-xs" aria-label="From" />
            <Input type="date" value={filters.to} min={filters.from} onChange={(e) => e.target.value && setFilters((f) => ({ ...f, page: 1, to: e.target.value }))} className="h-8 w-[140px] text-xs" aria-label="To" />
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Download" icon={<ArrowDownLeft className="h-4 w-4" />} tone="bg-blue-500/10 text-blue-500">{gb(summary.downloadGb)}</Kpi>
        <Kpi label="Upload" icon={<ArrowUpRight className="h-4 w-4" />} tone="bg-emerald-500/10 text-emerald-500">{gb(summary.uploadGb)}</Kpi>
        <Kpi label="Customers with usage" icon={<Users className="h-4 w-4" />} tone="bg-primary/10 text-primary">{summary.customers}</Kpi>
        <Kpi label="Average per customer" icon={<TrendingUp className="h-4 w-4" />} tone="bg-amber-500/10 text-amber-500">{gb(Math.round(avg * 100) / 100)}</Kpi>
      </div>

      <Card className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Daily transfer</CardTitle>
          <CardDescription className="text-xs">Most recent recorded days in the period</CardDescription>
        </CardHeader>
        <CardContent>
          {series.isLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-muted/30" />
          ) : series.isError ? (
            <p className="text-xs text-destructive">{errorMessage(series.error)}</p>
          ) : !series.data?.length ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No usage recorded in this period.</p>
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
                    <span className="text-[9px] text-muted-foreground truncate w-full text-center">{p.date.slice(5)}</span>
                    <span className="sr-only">{gb(total)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={cn('border-border/70 overflow-hidden', isFetching && 'opacity-80')}>
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search customer, mobile or PPPoE name..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9 pr-8 h-9 text-xs" />
            {searchInput ? (
              <button type="button" onClick={() => setSearchInput('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          <Badge variant="secondary" className="text-xs">{formatDate(filters.from)} – {formatDate(filters.to)}</Badge>
        </CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-border/80 bg-muted/40 text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4 text-right">Download</th>
                <th className="py-3 px-4 text-right">Upload</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Active days</th>
                <th className="py-3 px-4 text-right">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No usage recorded for this period.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.customerId} className="hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{r.customerName || `#${r.customerId}`}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{r.mobile || `ID ${r.customerId}`}</div>
                    </td>
                    <td className="py-3 px-4">{r.packageName || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono">{gb(r.downloadGb)}</td>
                    <td className="py-3 px-4 text-right font-mono">{gb(r.uploadGb)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{gb(Math.round((r.downloadGb + r.uploadGb) * 100) / 100)}</td>
                    <td className="py-3 px-4 text-right font-mono">{r.activeDays}</td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">{r.lastSeen ? formatDate(r.lastSeen) : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={filters.page}
          pageSize={filters.pageSize}
          totalItems={data?.meta.total ?? 0}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          onPageSizeChange={(pageSize) => setFilters((f) => ({ ...f, page: 1, pageSize }))}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </Card>
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

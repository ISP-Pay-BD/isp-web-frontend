'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Search, Download, Users, Activity, Receipt, Building2, MapPin, X, Printer, ShieldCheck, AlignJustify, AlignCenter, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAreaOptions, useBtrcReport, downloadBtrc, type BtrcFilters } from '../hooks/use-btrc-report';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge, TablePagination } from '@/components/shared';
import { useThemeCustomizerStore } from '@/stores/theme-store';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';

const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function BtrcReportPage() {
  const globalTableLayout = useThemeCustomizerStore((s) => s.tableLayout);
  const setGlobalTableLayout = useThemeCustomizerStore((s) => s.setTableLayout);
  const [layoutMode, setLayoutMode] = useState<'full' | 'centered'>(globalTableLayout ?? 'full');
  const [filters, setFilters] = useState<BtrcFilters>({ page: 1, pageSize: 20, search: '', status: 'all', clientType: 'all', areaId: 'all' });
  const [searchInput, setSearchInput] = useState('');
  const [exporting, setExporting] = useState<'pdf' | 'excel' | 'csv' | null>(null);

  const { data, isLoading, isError, error, isFetching, refetch } = useBtrcReport(filters);
  const areas = useAreaOptions();

  useEffect(() => {
    if (globalTableLayout) setLayoutMode(globalTableLayout);
  }, [globalTableLayout]);

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.search === searchInput.trim() ? f : { ...f, page: 1, search: searchInput.trim() })), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Client-type options come from the report itself (plus the active filter).
  const seenTypes = useMemo(() => {
    const keys = Object.keys(data?.summary.byClientType ?? {}).filter((k) => k !== 'unspecified');
    if (filters.clientType !== 'all') keys.push(filters.clientType);
    return Array.from(new Set(keys)).sort();
  }, [data, filters.clientType]);

  const patch = (next: Partial<BtrcFilters>) => setFilters((f) => ({ ...f, page: 1, ...next }));
  const toggleLayoutMode = (mode: 'full' | 'centered') => {
    setLayoutMode(mode);
    setGlobalTableLayout(mode);
  };

  const exportAs = async (kind: 'pdf' | 'excel' | 'csv') => {
    setExporting(kind);
    try {
      await downloadBtrc(kind, filters);
      toast.success(`BTRC report downloaded (${kind.toUpperCase()})`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setExporting(null);
    }
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError && !data) {
    return <EmptyState title="Failed to load BTRC report" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const summary = data?.summary;
  const subscribers = data?.items ?? [];
  const home = summary?.byClientType.home ?? 0;
  const corporate = summary?.byClientType.corporate ?? 0;

  return (
    <div className={cn('space-y-6 pb-16 transition-all duration-200', layoutMode === 'centered' ? 'max-w-6xl mx-auto' : 'w-full')}>
      <PageHeader
        title="BTRC Regulatory Report"
        subtitle="Subscriber census with package, bandwidth, area and client type for BTRC filing."
        breadcrumb={[{ label: 'Admin', url: '/admin/dashboard' }, { label: 'Reports' }, { label: 'BTRC Report' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportAs('pdf')} disabled={!!exporting} className="text-xs h-8">
              {exporting === 'pdf' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Printer className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />} PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportAs('excel')} disabled={!!exporting} className="text-xs h-8">
              {exporting === 'excel' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />} Excel
            </Button>
            <Button size="sm" onClick={() => exportAs('csv')} disabled={!!exporting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5">
              {exporting === 'csv' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Subscribers" icon={<Users className="h-4 w-4" />} tone="bg-primary/10 text-primary">
          {summary?.subscribers ?? 0}
        </Kpi>
        <Kpi label="Active" icon={<Activity className="h-4 w-4" />} tone="bg-blue-500/10 text-blue-500">
          {summary?.active ?? 0}
        </Kpi>
        <Kpi label="Declared monthly revenue" icon={<Receipt className="h-4 w-4" />} tone="bg-emerald-500/10 text-emerald-500">
          <CurrencyDisplay amount={summary?.declaredRevenueBdt ?? 0} />
        </Kpi>
        <Kpi label="Home / Corporate" icon={<Building2 className="h-4 w-4" />} tone="bg-purple-500/10 text-purple-500">
          {home} <span className="text-sm font-normal text-muted-foreground">/</span> {corporate}
        </Kpi>
      </div>

      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search name, mobile or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-background border-border/60"
            />
            {searchInput ? (
              <button type="button" onClick={() => setSearchInput('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={filters.clientType} onValueChange={(v) => patch({ clientType: v ?? 'all' })}>
              <SelectTrigger className="h-9 text-xs w-[130px]"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {seenTypes.map((t) => (
                  <SelectItem key={t} value={t}>{titleCase(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.areaId} onValueChange={(v) => patch({ areaId: v ?? 'all' })}>
              <SelectTrigger className="h-9 text-xs w-[150px]">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All areas</SelectItem>
                {(areas.data ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(v) => patch({ status: v ?? 'all' })}>
              <SelectTrigger className="h-9 text-xs w-[120px]"><SelectValue placeholder="All status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5">
              {(['full', 'centered'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleLayoutMode(mode)}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition duration-150',
                    layoutMode === mode ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                  )}
                  title={mode === 'full' ? 'Full width layout' : 'Centered layout'}
                >
                  {mode === 'full' ? <AlignJustify className="h-3.5 w-3.5" /> : <AlignCenter className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{mode === 'full' ? 'Full' : 'Center'}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cn('border-border/70 shadow-2xs bg-card overflow-hidden ring-1 ring-border/50', isFetching && 'opacity-80')}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                <th className="py-3.5 px-4 w-12">SL</th>
                <th className="py-3.5 px-4">Client name</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Bandwidth</th>
                <th className="py-3.5 px-4">Rate (BDT)</th>
                <th className="py-3.5 px-4">Area</th>
                <th className="py-3.5 px-4">Client type</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No subscribers match</p>
                      <p className="text-xs text-muted-foreground">Clear the search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                subscribers.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">{(filters.page - 1) * filters.pageSize + idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-foreground">{sub.clientName || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-foreground">{sub.mobile || '—'}</td>
                    <td className="py-3.5 px-4 font-medium text-foreground">{sub.packageName || '—'}</td>
                    <td className="py-3.5 px-4">
                      {sub.bandwidth ? <Badge variant="secondary" className="font-mono text-xs bg-muted/60">{sub.bandwidth}</Badge> : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-foreground">{sub.priceBdt === null ? '—' : <CurrencyDisplay amount={sub.priceBdt} />}</td>
                    <td className="py-3.5 px-4 text-foreground">{sub.area || '—'}</td>
                    <td className="py-3.5 px-4">
                      {sub.clientType ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-[10px] font-medium',
                            sub.clientType.toLowerCase() === 'corporate'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                          )}
                        >
                          {sub.clientType}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={sub.status === 'active' ? 'active' : 'expired'} label={sub.status || '—'} />
                    </td>
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
          onPageSizeChange={(pageSize) => patch({ pageSize })}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </Card>
    </div>
  );
}

function Kpi({ label, icon, tone, children }: { label: string; icon: ReactNode; tone: string; children: ReactNode }) {
  return (
    <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn('p-2 rounded-lg', tone)}>{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">{children}</div>
    </Card>
  );
}

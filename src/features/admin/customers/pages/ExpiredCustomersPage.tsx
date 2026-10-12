'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  AlertTriangle,
  Send,
  Zap,
  Download,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  AlignJustify,
  AlignCenter,
  History,
} from 'lucide-react';
import {
  useAreaOptions,
  useCustomerSummary,
  useCustomers,
  useExportCustomers,
} from '../hooks/use-customers';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { SendSmsDialog } from '../components/SendSmsDialog';
import type { CustomerListFilters } from '../types';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { TablePagination } from '@/components/shared/TablePagination';
import { DEFAULT_PAGE_SIZE, STORAGE_KEYS } from '@/lib/constants/status';
import { useThemeCustomizerStore } from '@/stores/theme-store';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const DAYS_BUCKET: Record<string, string | undefined> = {
  all: undefined,
  today: 'expired_today',
  last_7: 'expired_7',
  over_30: 'expired_over_30',
};

export function ExpiredCustomersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [areaFilter, setAreaFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState('all'); // all | today | last_7 | over_30
  const globalTableLayout = useThemeCustomizerStore((s) => s.tableLayout);
  const [smsTargets, setSmsTargets] = useState<string[] | null>(null);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [layoutMode, setLayoutMode] = useState<'full' | 'centered'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.tableLayout);
        if (saved === 'centered' || saved === 'full') return saved;
      } catch {
        /* storage unavailable */
      }
    }
    return globalTableLayout || 'full';
  });

  // Sync when global theme setting changes
  useEffect(() => {
    if (globalTableLayout) {
      setLayoutMode(globalTableLayout);
    }
  }, [globalTableLayout]);

  const handleLayoutModeChange = (mode: 'full' | 'centered') => {
    setLayoutMode(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.tableLayout, mode);
    } catch {
      /* storage unavailable */
    }
  };

  const scopeFilters = useMemo<CustomerListFilters>(
    () => ({ search: debouncedSearch || undefined, areaId: areaFilter !== 'all' ? areaFilter : undefined }),
    [debouncedSearch, areaFilter],
  );
  // Expired = will_expire passed (server-side), optionally narrowed to an expiry bucket.
  const listFilters = useMemo<CustomerListFilters>(
    () => ({ ...scopeFilters, status: 'expired', expiry: DAYS_BUCKET[daysFilter] }),
    [scopeFilters, daysFilter],
  );

  const pageKey = `${JSON.stringify(listFilters)}|${pageSize}`;
  const [pageState, setPageState] = useState({ key: pageKey, page: 1 });
  const currentPage = pageState.key === pageKey ? pageState.page : 1;

  const { data, isLoading, isError, isFetching, refetch } = useCustomers({ ...listFilters, page: currentPage, perPage: pageSize });
  const summaryQuery = useCustomerSummary(scopeFilters);
  const areasQuery = useAreaOptions();
  const exportMutation = useExportCustomers();

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const summary = summaryQuery.data;
  const count = (n: number | undefined) => (summary ? n ?? 0 : '…');

  if (isLoading) return <PageSkeleton variant="table" rows={6} layoutMode={layoutMode} />;
  if (isError) {
    return (
      <EmptyState
        title="Error loading expired customers"
        description="Could not load expired line data."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const areaOptions = areasQuery.data ?? [];

  return (
    <div
      className={cn(
        'space-y-6 pb-16 transition-all duration-200',
        layoutMode === 'centered' ? 'max-w-7xl mx-auto' : 'w-full'
      )}
    >
      {/* Page Header */}
      <PageHeader
        title="Expired Customers"
        subtitle="Subscribers with lapsed account cycles requiring follow-up, payment renewal, or line reconnection."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customers', url: '/admin/customers' },
          { label: 'Expired Customers' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Layout Toggle */}
            <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/40">
              <button
                type="button"
                onClick={() => handleLayoutModeChange('full')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150',
                  layoutMode === 'full'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Full width layout"
              >
                <AlignJustify className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Full</span>
              </button>
              <button
                type="button"
                onClick={() => handleLayoutModeChange('centered')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150',
                  layoutMode === 'centered'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Centered layout"
              >
                <AlignCenter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Center</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate(listFilters)}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              {exportMutation.isPending ? 'Exporting…' : 'Export'}
            </Button>
            <Button
              size="sm"
              disabled={rows.length === 0}
              onClick={() => setSmsTargets(rows.map((c) => c.id))}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" /> SMS This Page
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips (backend summary) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(
          [
            { label: 'Total Expired', value: count(summary?.expired), unit: 'subscribers', icon: AlertTriangle, tone: 'bg-rose-500/10 text-rose-500', valueTone: 'text-rose-600 dark:text-rose-400' },
            { label: 'Expired Today', value: count(summary?.expiredToday), unit: 'accounts', icon: Clock, tone: 'bg-blue-500/10 text-blue-500', valueTone: 'text-foreground' },
            { label: 'Last 7 Days', value: count(summary?.expired7), unit: 'accounts', icon: History, tone: 'bg-amber-500/10 text-amber-500', valueTone: 'text-amber-500' },
            { label: 'Over 30 Days', value: count(summary?.expiredOver30), unit: 'dormant', icon: Calendar, tone: 'bg-muted text-muted-foreground', valueTone: 'text-muted-foreground' },
          ] as const
        ).map((kpi) => (
          <Card key={kpi.label} className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
              <div className={cn('p-2 rounded-lg', kpi.tone)}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={cn('text-2xl font-bold tracking-tight tabular-nums', kpi.valueTone)}>{kpi.value}</span>
              <span className="text-xs text-muted-foreground">{kpi.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar & Filters */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, mobile, email or PPPoE username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={areaFilter}
              onValueChange={(v) => setAreaFilter(v || 'all')}
              items={{ all: 'All Areas', ...Object.fromEntries(areaOptions.map((a) => [a.id, a.name])) }}
            >
              <SelectTrigger className="h-9 text-xs w-[140px] bg-background border-border/60">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areaOptions.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={daysFilter}
              onValueChange={(v) => setDaysFilter(v || 'all')}
              items={{ all: 'All Durations', today: 'Expired Today', last_7: 'Last 7 Days', over_30: 'Over 30 Days' }}
            >
              <SelectTrigger className="h-9 text-xs w-[150px] bg-background border-border/60">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All Durations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                <SelectItem value="today">Expired Today</SelectItem>
                <SelectItem value="last_7">Last 7 Days</SelectItem>
                <SelectItem value="over_30">Over 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className={cn('border-border/70 shadow-2xs bg-card overflow-hidden ring-1 ring-border/50', isFetching && 'opacity-80')}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                <th className="py-3.5 px-4">Subscriber</th>
                <th className="py-3.5 px-4">Package & Rate</th>
                <th className="py-3.5 px-4">Coverage Area</th>
                <th className="py-3.5 px-4">Expired On</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
                      <p className="font-semibold text-foreground">No expired customers found</p>
                      <p className="text-xs text-muted-foreground">
                        Nobody in this filter set has a lapsed cycle.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="font-bold text-foreground hover:text-primary hover:underline text-xs"
                          >
                            {c.name}
                          </Link>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {c.username || '—'} • {c.phone || '—'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{c.packageName || '—'}</div>
                      {c.packagePrice !== null && (
                        <div className="text-[10px] text-muted-foreground font-mono">৳{c.packagePrice}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-foreground font-medium">
                      {c.areaName || '—'}
                      {c.subAreaName && (
                        <div className="text-[10px] text-muted-foreground">{c.subAreaName}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-semibold text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{c.expiryDate ? c.expiryDate.slice(0, 10) : '—'}</span>
                      </div>
                      {c.paymentSummary && <div className="text-[10px] text-muted-foreground">{c.paymentSummary}</div>}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-amber-500">
                      <CurrencyDisplay amount={c.balanceBdt} />
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/customer-payments/new?customerId=${c.id}`}>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                          >
                            <Zap className="h-3 w-3" /> Recharge
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-border/80 hover:bg-muted/80"
                          title="Send SMS"
                          onClick={() => setSmsTargets([c.id])}
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination Controls */}
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={data?.meta.total ?? 0}
          onPageChange={(page) => setPageState({ key: pageKey, page })}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* SMS to one customer or everyone on this page */}
      <SendSmsDialog
        open={smsTargets !== null}
        onOpenChange={(o) => !o && setSmsTargets(null)}
        ids={smsTargets ?? []}
        title="Send Expiry Reminders"
      />
    </div>
  );
}

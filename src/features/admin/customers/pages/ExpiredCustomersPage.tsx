'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  AlertTriangle,
  Send,
  Zap,
  Download,
  MapPin,
  Calendar,
  Clock,
  X,
  History,
} from 'lucide-react';
import {
  useAreaOptions,
  useCustomerSummary,
  useCustomers,
  useExportCustomers,
} from '../hooks/use-customers';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { replaceQuery } from '@/hooks/use-url-state';
import { SendSmsDialog } from '../components/SendSmsDialog';
import type { Customer, CustomerListFilters } from '../types';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { DataTable } from '@/features/shared/data-table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
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
import { useTranslations } from '@/i18n/locale-context';
import { customerStatusLabel } from '../lib/labels';

const DAYS_BUCKET: Record<string, string | undefined> = {
  all: undefined,
  today: 'expired_today',
  last_7: 'expired_7',
  over_30: 'expired_over_30',
};

export function ExpiredCustomersPage() {
  const t = useTranslations();
  const params = useSearchParams();
  const areaFilter = params.get('area') || 'all';
  const daysParam = params.get('days') || 'all';
  const daysFilter = daysParam in DAYS_BUCKET ? daysParam : 'all';
  const urlSearch = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = Number(params.get('size')) || DEFAULT_PAGE_SIZE;
  const update = useCallback((patch: Record<string, string | number | null>) => {
    replaceQuery((p) => {
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '' || value === 'all') p.delete(key);
        else p.set(key, String(value));
      }
      if (!('page' in patch)) p.delete('page');
    });
  }, []);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(searchInput.trim());
  useEffect(() => {
    if (debouncedSearch !== urlSearch) update({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const [smsTargets, setSmsTargets] = useState<string[] | null>(null);

  const scopeFilters = useMemo<CustomerListFilters>(
    () => ({ search: urlSearch || undefined, areaId: areaFilter !== 'all' ? areaFilter : undefined }),
    [urlSearch, areaFilter],
  );
  // Expired = will_expire passed (server-side), optionally narrowed to an expiry bucket.
  const listFilters = useMemo<CustomerListFilters>(
    () => ({ ...scopeFilters, status: 'expired', expiry: DAYS_BUCKET[daysFilter] }),
    [scopeFilters, daysFilter],
  );

  const { data, isLoading, isError, isFetching, refetch } = useCustomers({ ...listFilters, page, perPage: pageSize });
  const summaryQuery = useCustomerSummary(scopeFilters);
  const areasQuery = useAreaOptions();
  const exportMutation = useExportCustomers();

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const summary = summaryQuery.data;
  const count = (n: number | undefined) => (summary ? n ?? 0 : '…');

  const columns = useMemo<LegacyColumnDef<Customer, unknown>[]>(
    () => [
      {
        id: 'customer',
        header: t('admin.customers.expiredPage.colSubscriber', 'Subscriber'),
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-400">
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <Link href={`/admin/customers/${c.id}`} className="block truncate py-0.5 text-sm font-bold text-foreground hover:text-primary hover:underline">
                  {c.name}
                </Link>
                <div className="truncate font-mono text-xs text-muted-foreground">
                  {c.username || '—'} • {c.phone ? <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a> : '—'}
                </div>
              </div>
            </div>
          );
        },
        meta: { mobile: 'title' },
      },
      {
        id: 'package',
        header: t('admin.customers.expiredPage.colPackage', 'Package & Rate'),
        cell: ({ row }) => (
          <>
            <div className="font-semibold text-foreground">{row.original.packageName || '—'}</div>
            {row.original.packagePrice !== null && (
              <div className="font-mono text-xs text-muted-foreground">
                <CurrencyDisplay amount={row.original.packagePrice} />
              </div>
            )}
          </>
        ),
      },
      {
        id: 'area',
        header: t('admin.customers.expiredPage.colArea', 'Coverage Area'),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.areaName || '—'}
            {row.original.subAreaName && <span className="block text-xs text-muted-foreground">{row.original.subAreaName}</span>}
          </span>
        ),
      },
      {
        id: 'expired',
        header: t('admin.customers.expiredPage.colExpiredOn', 'Expired On'),
        cell: ({ row }) => (
          <>
            <div className="flex items-center gap-1 font-mono text-xs font-semibold text-rose-500">
              <AlertTriangle className="h-3 w-3" />
              <span>{row.original.expiryDate ? row.original.expiryDate.slice(0, 10) : '—'}</span>
            </div>
            {row.original.paymentSummary && <div className="text-xs text-muted-foreground">{row.original.paymentSummary}</div>}
          </>
        ),
      },
      {
        id: 'balance',
        header: t('admin.customers.expiredPage.colBalance', 'Balance'),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
            <CurrencyDisplay amount={row.original.balanceBdt} />
          </span>
        ),
      },
      {
        id: 'status',
        header: t('admin.customers.expiredPage.colStatus', 'Status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} label={customerStatusLabel(t, row.original.status)} />,
        meta: { mobile: 'status' },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.expiredPage.colActions', 'Actions')}</span>,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button size="sm" className="h-9 gap-1 bg-primary text-xs text-primary-foreground hover:bg-primary/90" render={<Link href={`/admin/customer-payments/new?customerId=${row.original.id}`} />}>
              <Zap className="h-3 w-3" /> {t('admin.customers.expiredPage.recharge', 'Recharge')}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 border-border/80 hover:bg-muted/80"
              aria-label={t('admin.customers.expiredPage.smsTo', 'Send SMS to {name}', { name: row.original.name })}
              title={t('admin.customers.expiredPage.sendSms', 'Send SMS')}
              onClick={() => setSmsTargets([row.original.id])}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
        meta: { mobile: 'actions' },
      },
    ],
    [t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.customers.expiredPage.loadFailed', 'Error loading expired customers')}
        description={t('admin.customers.expiredPage.loadFailedHint', 'Could not load expired line data.')}
        actionLabel={t('admin.customers.expiredPage.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const areaOptions = areasQuery.data ?? [];

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Page Header */}
      <PageHeader
        title={t('admin.customers.expiredPage.title', 'Expired Customers')}
        subtitle={t('admin.customers.expiredPage.subtitle', 'Subscribers with lapsed account cycles requiring follow-up, payment renewal, or line reconnection.')}
        breadcrumb={[
          { label: t('admin.customers.expiredPage.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('admin.customers.expiredPage.breadcrumbCustomers', 'Customers'), url: '/admin/customers' },
          { label: t('admin.customers.expiredPage.title', 'Expired Customers') },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate(listFilters)}
              className="text-xs h-9 border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              {exportMutation.isPending ? t('admin.customers.expiredPage.exporting', 'Exporting…') : t('admin.customers.expiredPage.export', 'Export')}
            </Button>
            <Button
              size="sm"
              disabled={rows.length === 0}
              onClick={() => setSmsTargets(rows.map((c) => c.id))}
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs h-9 gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" /> {t('admin.customers.expiredPage.smsPage', 'SMS This Page')}
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips (backend summary) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(
          [
            { key: 'total', label: t('admin.customers.expiredPage.kpiTotal', 'Total Expired'), value: count(summary?.expired), unit: t('admin.customers.expiredPage.unitSubscribers', 'subscribers'), icon: AlertTriangle, tone: 'bg-rose-500/10 text-rose-500', valueTone: 'text-rose-600 dark:text-rose-400' },
            { key: 'today', label: t('admin.customers.expiredPage.kpiToday', 'Expired Today'), value: count(summary?.expiredToday), unit: t('admin.customers.expiredPage.unitAccounts', 'accounts'), icon: Clock, tone: 'bg-blue-500/10 text-blue-500', valueTone: 'text-foreground' },
            { key: 'last7', label: t('admin.customers.expiredPage.kpiLast7', 'Last 7 Days'), value: count(summary?.expired7), unit: t('admin.customers.expiredPage.unitAccounts', 'accounts'), icon: History, tone: 'bg-amber-500/10 text-amber-500', valueTone: 'text-amber-500' },
            { key: 'over30', label: t('admin.customers.expiredPage.kpiOver30', 'Over 30 Days'), value: count(summary?.expiredOver30), unit: t('admin.customers.expiredPage.unitDormant', 'dormant'), icon: Calendar, tone: 'bg-muted text-muted-foreground', valueTone: 'text-muted-foreground' },
          ] as const
        ).map((kpi) => (
          <Card key={kpi.key} className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
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
              placeholder={t('admin.customers.expiredPage.searchPlaceholder', 'Search by name, mobile, email or PPPoE username...')}
              aria-label={t('admin.customers.expiredPage.searchLabel', 'Search expired customers')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-9 h-10 text-sm bg-background border-border/60 shadow-inner"
            />
            {searchInput && (
              <button
                type="button"
                aria-label={t('admin.customers.expiredPage.clearSearch', 'Clear search')}
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={areaFilter}
              onValueChange={(v) => update({ area: v || 'all' })}
              items={{ all: t('admin.customers.expiredPage.allAreas', 'All Areas'), ...Object.fromEntries(areaOptions.map((a) => [a.id, a.name])) }}
            >
              <SelectTrigger className="h-10 text-xs w-[150px] bg-background border-border/60">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder={t('admin.customers.expiredPage.allAreas', 'All Areas')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.customers.expiredPage.allAreas', 'All Areas')}</SelectItem>
                {areaOptions.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={daysFilter}
              onValueChange={(v) => update({ days: v || 'all' })}
              items={{
                all: t('admin.customers.expiredPage.allDurations', 'All Durations'),
                today: t('admin.customers.expiredPage.kpiToday', 'Expired Today'),
                last_7: t('admin.customers.expiredPage.kpiLast7', 'Last 7 Days'),
                over_30: t('admin.customers.expiredPage.kpiOver30', 'Over 30 Days'),
              }}
            >
              <SelectTrigger className="h-10 text-xs w-[160px] bg-background border-border/60">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder={t('admin.customers.expiredPage.allDurations', 'All Durations')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.customers.expiredPage.allDurations', 'All Durations')}</SelectItem>
                <SelectItem value="today">{t('admin.customers.expiredPage.kpiToday', 'Expired Today')}</SelectItem>
                <SelectItem value="last_7">{t('admin.customers.expiredPage.kpiLast7', 'Last 7 Days')}</SelectItem>
                <SelectItem value="over_30">{t('admin.customers.expiredPage.kpiOver30', 'Over 30 Days')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className={cn(isFetching && 'opacity-80')}>
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(c) => c.id}
          enableLayoutToggle={false}
          pageSizeOptions={[10, 20, 50, 100]}
          emptyTitle={t('admin.customers.expiredPage.emptyTitle', 'No expired customers found')}
          emptyDescription={t('admin.customers.expiredPage.emptyHint', 'Nobody in this filter set has a lapsed cycle.')}
          server={{
            page,
            pageSize,
            total: data?.meta.total ?? 0,
            onPageChange: (p) => update({ page: p }),
            onPageSizeChange: (size) => update({ size }),
          }}
        />
      </div>

      {/* SMS to one customer or everyone on this page */}
      <SendSmsDialog
        open={smsTargets !== null}
        onOpenChange={(o) => !o && setSmsTargets(null)}
        ids={smsTargets ?? []}
        title={t('admin.customers.expiredPage.smsTitle', 'Send Expiry Reminders')}
      />
    </div>
  );
}

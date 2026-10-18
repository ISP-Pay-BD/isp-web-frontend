'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import Link from 'next/link';
import { Plus, ArrowDownLeft, ArrowUpRight, Download, Scale, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DataTable } from '@/features/shared/data-table';
import { Can } from '@/components/shared/Can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime, formatBdtWithSymbol } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import {
  downloadCashbookCsv,
  monthToDateRange,
  useCashbook,
  type CashbookEntry,
  type CashbookFilters,
} from '@/features/admin/reports/hooks/use-billing-reports';

/** Cash book: successful customer collections (in) and recorded expenses (out) for a period. */
export function CashbookPage() {
  const t = useTranslations();
  const [filters, setFilters] = useState<CashbookFilters>(() => ({ page: 1, pageSize: 20, search: '', method: 'all', ...monthToDateRange() }));
  const [exporting, setExporting] = useState(false);
  const { data, isLoading, isError, error, isFetching, refetch } = useCashbook(filters);

  const columns = useMemo<LegacyColumnDef<CashbookEntry, unknown>[]>(
    () => [
      {
        id: 'date',
        header: t('admin.customerPayments.receipt.date', 'Date'),
        enableSorting: false,
        cell: ({ row: { original: e } }) => (
          <span className="font-mono text-muted-foreground whitespace-nowrap">{e.at.length > 10 ? formatDateTime(e.at) : formatDate(e.at)}</span>
        ),
      },
      {
        id: 'type',
        header: t('admin.ops.cashbook.colType', 'Type'),
        enableSorting: false,
        meta: { mobile: 'status' },
        cell: ({ row: { original: e } }) => (
          <Badge variant="outline" tone={e.direction === 'in' ? 'success' : 'danger'}>
            {e.direction === 'in' ? t('admin.ops.cashbook.cashIn', 'Cash in') : t('admin.ops.cashbook.cashOut', 'Cash out')}
          </Badge>
        ),
      },
      {
        id: 'party',
        header: t('admin.ops.cashbook.colParty', 'Party'),
        enableSorting: false,
        meta: { mobile: 'title' },
        cell: ({ row: { original: e } }) => <span className="font-medium text-foreground">{e.party || '—'}</span>,
      },
      {
        id: 'method',
        header: t('admin.ops.cashbook.colMethod', 'Method / head'),
        enableSorting: false,
        cell: ({ row: { original: e } }) => e.method || '—',
      },
      {
        id: 'reference',
        header: t('admin.ops.cashbook.colReference', 'Reference'),
        enableSorting: false,
        cell: ({ row: { original: e } }) =>
          e.direction === 'in' && e.refId ? (
            <Link href={`/admin/invoices/${e.refId}`} className="font-mono hover:text-primary">{e.reference || `#${e.refId}`}</Link>
          ) : (
            <span className="font-mono">{e.reference || '—'}</span>
          ),
      },
      {
        id: 'handledBy',
        header: t('admin.ops.cashbook.colHandledBy', 'Handled by'),
        enableSorting: false,
        cell: ({ row: { original: e } }) => <span className="text-muted-foreground">{e.handledBy || '—'}</span>,
      },
      {
        id: 'amount',
        header: () => <div className="text-right">{t('admin.ops.cashbook.colAmount', 'Amount')}</div>,
        enableSorting: false,
        meta: { mobileLabel: t('admin.ops.cashbook.colAmount', 'Amount') },
        cell: ({ row: { original: e } }) => (
          <div className={cn('font-mono font-semibold md:text-right', e.direction === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500')}>
            {e.direction === 'in' ? '+' : '-'} <CurrencyDisplay amount={e.amountBdt} />
          </div>
        ),
      },
    ],
    [t],
  );

  const patch = (next: Partial<CashbookFilters>) => setFilters((f) => ({ ...f, page: 1, ...next }));

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadCashbookCsv(filters);
      toast.success(t('admin.ops.cashbook.exported', 'Cash book exported to CSV'));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError && !data) {
    return <EmptyState variant="error" title={t('admin.ops.cashbook.loadFailed', 'Failed to load cash book')} description={errorMessage(error)} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />;
  }

  const s = data?.summary;
  const entries = data?.items ?? [];

  return (
    <div className="space-y-6 w-full pb-16">
      <PageHeader
        title={t('admin.ops.cashbook.title', 'Cash Book')}
        subtitle={t('admin.ops.cashbook.subtitle', 'Customer collections and expenses for the selected period')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('nav.collections', 'Collections') },
          { label: t('nav.collections-cashbook', 'Cash book') },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Input type="date" value={filters.from} max={filters.to} onChange={(e) => e.target.value && patch({ from: e.target.value })} className="h-8 w-[140px] text-xs" aria-label={t('admin.ops.cashbook.from', 'From')} />
            <Input type="date" value={filters.to} min={filters.from} onChange={(e) => e.target.value && patch({ to: e.target.value })} className="h-8 w-[140px] text-xs" aria-label={t('admin.ops.cashbook.to', 'To')} />
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="text-xs h-8">
              {exporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />} {t('admin.ops.cashbook.exportCsv', 'Export CSV')}
            </Button>
            <Can menu="customer_payment" action="create">
              <Button size="sm" className="text-xs h-8 gap-1.5" render={<Link href="/admin/customer-payments/new" />}><Plus className="h-3.5 w-3.5" /> {t('admin.ops.cashbook.recordPayment', 'Record payment')}</Button>
            </Can>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          label={t('admin.ops.cashbook.cashIn', 'Cash in')}
          icon={<ArrowDownLeft className="h-4 w-4" />}
          tone="bg-emerald-500/10 text-emerald-500"
          hint={t('admin.ops.cashbook.hintCollections', '{n} collections', { n: s?.cashInCount ?? 0 })}
        >
          <CurrencyDisplay amount={s?.cashIn ?? 0} />
        </Kpi>
        <Kpi
          label={t('admin.ops.cashbook.cashOut', 'Cash out')}
          icon={<ArrowUpRight className="h-4 w-4" />}
          tone="bg-rose-500/10 text-rose-500"
          hint={
            s?.expensesTracked
              ? t('admin.ops.cashbook.hintExpenses', '{n} expenses', { n: s?.cashOutCount ?? 0 })
              : t('admin.ops.cashbook.hintNoLedger', 'Expense ledger not set up')
          }
        >
          <CurrencyDisplay amount={s?.cashOut ?? 0} />
        </Kpi>
        <Kpi
          label={t('admin.ops.cashbook.kpiNet', 'Net')}
          icon={<Scale className="h-4 w-4" />}
          tone="bg-primary/10 text-primary"
          hint={`${formatDate(filters.from)} – ${formatDate(filters.to)}`}
        >
          <CurrencyDisplay amount={s?.net ?? 0} />
        </Kpi>
        <Kpi
          label={t('admin.ops.cashbook.kpiCollectors', 'Collectors')}
          icon={<Users className="h-4 w-4" />}
          tone="bg-amber-500/10 text-amber-500"
          hint={t('admin.ops.cashbook.hintCollectors', 'who recorded collections')}
        >
          {s?.byCollector.length ?? 0}
        </Kpi>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('admin.ops.cashbook.byMethod', 'Collections by method')}</CardTitle>
            <CardDescription className="text-xs">{t('admin.ops.cashbook.byMethodHint', 'Click a method to filter the entries')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant={filters.method === 'all' ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => patch({ method: 'all' })}>
              {t('admin.customers.list.pillAll', 'All')}
            </Button>
            {(s?.byMethod ?? []).map((m) => {
              const key = m.method.toLowerCase();
              return (
                <Button
                  key={m.method || 'unspecified'}
                  size="sm"
                  variant={filters.method === key ? 'default' : 'outline'}
                  className="h-7 text-xs gap-1.5"
                  disabled={!m.method}
                  onClick={() => patch({ method: key })}
                >
                  {m.method || t('admin.ops.cashbook.unspecified', 'Unspecified')} <span className="font-mono opacity-80">{formatBdtWithSymbol(m.total)}</span>
                </Button>
              );
            })}
            {!s?.byMethod.length ? <p className="text-xs text-muted-foreground">{t('admin.ops.cashbook.noCollections', 'No collections in this period.')}</p> : null}
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('admin.ops.cashbook.byCollector', 'Collections by collector')}</CardTitle>
            <CardDescription className="text-xs">{t('admin.ops.cashbook.byCollectorHint', 'Staff who recorded the payments')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(s?.byCollector ?? []).length ? (
              s!.byCollector.map((c) => (
                <div key={c.name || 'none'} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{c.name || t('admin.ops.cashbook.notRecorded', 'Online / not recorded')}</span>
                  <span className="font-mono">
                    {formatBdtWithSymbol(c.total)} <span className="text-muted-foreground">({c.count})</span>
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">{t('admin.ops.cashbook.noCollections', 'No collections in this period.')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <DataTable
        urlState
        className={cn(isFetching && 'opacity-80')}
        columns={columns}
        data={entries}
        getRowId={(e) => e.key}
        searchPlaceholder={t('admin.ops.cashbook.searchPlaceholder', 'Search customer, invoice, TrxID or expense...')}
        emptyTitle={t('admin.ops.cashbook.emptyTitle', 'No cash entries in this period.')}
        pageSizeOptions={[10, 20, 50, 100]}
        server={{
          page: filters.page,
          pageSize: filters.pageSize,
          total: data?.meta.total ?? 0,
          onPageChange: (page) => setFilters((f) => ({ ...f, page })),
          onPageSizeChange: (pageSize) => patch({ pageSize }),
          search: filters.search,
          onSearchChange: (search) => setFilters((f) => (f.search === search ? f : { ...f, page: 1, search })),
        }}
      />
    </div>
  );
}

function Kpi({ label, icon, tone, hint, children }: { label: string; icon: ReactNode; tone: string; hint: string; children: ReactNode }) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className={cn('p-2 rounded-lg', tone)}>{icon}</div>
        </div>
        <div className="mt-2 text-xl font-bold tracking-tight text-foreground tabular-nums">{children}</div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

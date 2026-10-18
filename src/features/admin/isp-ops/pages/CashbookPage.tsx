'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Search, Plus, ArrowDownLeft, ArrowUpRight, Download, X, Scale, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { TablePagination } from '@/components/shared/TablePagination';
import { Can } from '@/components/shared/Can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import {
  downloadCashbookCsv,
  monthToDateRange,
  useCashbook,
  type CashbookFilters,
} from '@/features/admin/reports/hooks/use-billing-reports';

/** Cash book: successful customer collections (in) and recorded expenses (out) for a period. */
export function CashbookPage() {
  const [filters, setFilters] = useState<CashbookFilters>(() => ({ page: 1, pageSize: 20, search: '', method: 'all', ...monthToDateRange() }));
  const [searchInput, setSearchInput] = useState('');
  const [exporting, setExporting] = useState(false);
  const { data, isLoading, isError, error, isFetching, refetch } = useCashbook(filters);

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.search === searchInput.trim() ? f : { ...f, page: 1, search: searchInput.trim() })), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const patch = (next: Partial<CashbookFilters>) => setFilters((f) => ({ ...f, page: 1, ...next }));

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadCashbookCsv(filters);
      toast.success('Cash book exported to CSV');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError && !data) {
    return <EmptyState title="Failed to load cash book" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const s = data?.summary;
  const entries = data?.items ?? [];

  return (
    <div className="space-y-6 w-full pb-16">
      <PageHeader
        title="Cash Book"
        subtitle="Customer collections and expenses for the selected period"
        breadcrumb={[{ label: 'Admin', url: '/admin/dashboard' }, { label: 'Collections' }, { label: 'Cash book' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Input type="date" value={filters.from} max={filters.to} onChange={(e) => e.target.value && patch({ from: e.target.value })} className="h-8 w-[140px] text-xs" aria-label="From" />
            <Input type="date" value={filters.to} min={filters.from} onChange={(e) => e.target.value && patch({ to: e.target.value })} className="h-8 w-[140px] text-xs" aria-label="To" />
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="text-xs h-8">
              {exporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />} Export CSV
            </Button>
            <Can menu="customer_payment" action="create">
              <Link href="/admin/customer-payments/new">
                <Button size="sm" className="text-xs h-8 gap-1.5"><Plus className="h-3.5 w-3.5" /> Record payment</Button>
              </Link>
            </Can>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Cash in" icon={<ArrowDownLeft className="h-4 w-4" />} tone="bg-emerald-500/10 text-emerald-500" hint={`${s?.cashInCount ?? 0} collections`}>
          <CurrencyDisplay amount={s?.cashIn ?? 0} />
        </Kpi>
        <Kpi
          label="Cash out"
          icon={<ArrowUpRight className="h-4 w-4" />}
          tone="bg-rose-500/10 text-rose-500"
          hint={s?.expensesTracked ? `${s?.cashOutCount ?? 0} expenses` : 'Expense ledger not set up'}
        >
          <CurrencyDisplay amount={s?.cashOut ?? 0} />
        </Kpi>
        <Kpi label="Net" icon={<Scale className="h-4 w-4" />} tone="bg-primary/10 text-primary" hint={`${formatDate(filters.from)} – ${formatDate(filters.to)}`}>
          <CurrencyDisplay amount={s?.net ?? 0} />
        </Kpi>
        <Kpi label="Collectors" icon={<Users className="h-4 w-4" />} tone="bg-amber-500/10 text-amber-500" hint="who recorded collections">
          {s?.byCollector.length ?? 0}
        </Kpi>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Collections by method</CardTitle>
            <CardDescription className="text-xs">Click a method to filter the entries</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant={filters.method === 'all' ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => patch({ method: 'all' })}>
              All
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
                  {m.method || 'Unspecified'} <span className="font-mono opacity-80">৳{m.total.toLocaleString()}</span>
                </Button>
              );
            })}
            {!s?.byMethod.length ? <p className="text-xs text-muted-foreground">No collections in this period.</p> : null}
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Collections by collector</CardTitle>
            <CardDescription className="text-xs">Staff who recorded the payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(s?.byCollector ?? []).length ? (
              s!.byCollector.map((c) => (
                <div key={c.name || 'none'} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{c.name || 'Online / not recorded'}</span>
                  <span className="font-mono">
                    ৳{c.total.toLocaleString()} <span className="text-muted-foreground">({c.count})</span>
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No collections in this period.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={cn('border-border/70 overflow-hidden', isFetching && 'opacity-80')}>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search customer, invoice, TrxID or expense..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9 pr-8 h-9 text-xs" />
            {searchInput ? (
              <button type="button" onClick={() => setSearchInput('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-border/80 bg-muted/40 text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Party</th>
                <th className="py-3 px-4">Method / head</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Handled by</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {entries.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No cash entries in this period.</td></tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.key} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">{e.at.length > 10 ? formatDateTime(e.at) : formatDate(e.at)}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={e.direction === 'in' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : 'border-rose-500/30 bg-rose-500/10 text-rose-600'}>
                        {e.direction === 'in' ? 'Cash in' : 'Cash out'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{e.party || '—'}</td>
                    <td className="py-3 px-4">{e.method || '—'}</td>
                    <td className="py-3 px-4 font-mono">
                      {e.direction === 'in' && e.refId ? (
                        <Link href={`/admin/invoices/${e.refId}`} className="hover:text-primary">{e.reference || `#${e.refId}`}</Link>
                      ) : (
                        e.reference || '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{e.handledBy || '—'}</td>
                    <td className={cn('py-3 px-4 text-right font-mono font-semibold', e.direction === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500')}>
                      {e.direction === 'in' ? '+' : '-'} <CurrencyDisplay amount={e.amountBdt} />
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

function Kpi({ label, icon, tone, hint, children }: { label: string; icon: ReactNode; tone: string; hint: string; children: ReactNode }) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className={cn('p-2 rounded-lg', tone)}>{icon}</div>
        </div>
        <div className="mt-2 text-xl font-bold tracking-tight text-foreground tabular-nums">{children}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

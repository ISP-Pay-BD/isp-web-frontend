'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useEffect, useState } from 'react';
import { useSalaries, useSalarySummary } from '../hooks/use-salaries';
import { useHrMeta } from '../../shared/use-hr-meta';
import { useDebouncedValue } from '../../shared/use-debounced-value';
import { datePart, initials, titleCase } from '../../shared/format';
import { PageSkeleton, EmptyState, CurrencyDisplay, TablePagination } from '@/components/shared';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { SalaryPaymentModal } from '../components/SalaryPaymentModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Banknote, PlusCircle, Search, X } from 'lucide-react';

const statusBadge: Record<string, { cls: string; dot: string; label: string }> = {
  successful: { cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500', label: 'Paid' },
  pending: { cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500', label: 'Pending' },
  failed: { cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500', label: 'Failed' },
};

export function SalariesPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [monthFilter, setMonthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, monthFilter, statusFilter, pageSize]);

  const list = useSalaries({ page, perPage: pageSize, search: debouncedSearch, month: monthFilter, status: statusFilter });
  const summary = useSalarySummary({ search: debouncedSearch, month: monthFilter });
  const meta = useHrMeta();

  const payments = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;
  const months = meta.data?.months ?? [];
  const statuses = meta.data?.paymentStatuses ?? [];
  const activeStaff = (meta.data?.employees ?? []).filter((e) => e.status === 'active').length;
  const s = summary.data;
  const avgPayout = s && s.successfulCount > 0 ? Math.round(s.successfulTotal / s.successfulCount) : 0;

  if (list.isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (list.isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load salary disbursements" description={list.error?.message ?? 'Could not load the payroll payment registry.'} actionLabel="Retry" onAction={() => list.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Banknote className="h-6 w-6" />
            </div>
            Salary Payments
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Disburse and review monthly employee payroll and payment vouchers.
          </p>
        </div>
        <div >
          <Button onClick={() => setModalOpen(true)} disabled={!meta.data} className="bg-primary hover:bg-primary/90 font-semibold shadow-sm gap-1.5">
            <PlusCircle className="h-4 w-4" /> New Salary Payment
          </Button>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">
            {s ? <CurrencyDisplay amount={s.successfulTotal} className="inline font-semibold" /> : '—'}
          </span>{' '}
          <span className="text-muted-foreground">disbursed</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{s?.totalCount ?? '—'}</span>{' '}
          <span className="text-muted-foreground">vouchers</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">
            {s ? <CurrencyDisplay amount={s.pendingTotal} className="inline font-semibold" /> : '—'}
          </span>{' '}
          <span className="text-muted-foreground">pending</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">
            {s ? <CurrencyDisplay amount={avgPayout} className="inline font-semibold" /> : '—'}
          </span>{' '}
          <span className="text-muted-foreground">avg payout</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{meta.data ? activeStaff : '—'}</span>{' '}
          <span className="text-muted-foreground">staff on payroll</span>
        </p>
      </div>

      <div>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 min-w-[200px] sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by employee, invoice or method..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select items={Object.fromEntries([['all', 'All Months'], ...months.map((m) => [m, m])])} value={monthFilter} onValueChange={(v) => setMonthFilter(v ?? 'all')}>
                  <SelectTrigger className="w-[150px] h-9 text-xs border-border/60">
                    <SelectValue placeholder="Salary Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select items={Object.fromEntries([['all', 'All Status'], ...statuses.map((st) => [st, titleCase(st)])])} value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
                  <SelectTrigger className="w-[130px] h-9 text-xs border-border/60">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((st) => <SelectItem key={st} value={st}>{titleCase(st)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">{total} result{total !== 1 ? 's' : ''}</Badge>
              </div>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="py-16">
              <EmptyState icon={<Banknote className="h-10 w-10" />} title="No salary disbursements found" description={debouncedSearch || monthFilter !== 'all' || statusFilter !== 'all' ? 'No salary payment matches your search or filters.' : 'Recorded salary payments will appear here.'} actionLabel={meta.data ? 'Disburse Salary' : undefined} onAction={meta.data ? () => setModalOpen(true) : undefined} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-12 text-[11px] font-medium tracking-wide text-muted-foreground">#</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Voucher</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Employee</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Month</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Paid Date</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Paid Via</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p, idx) => {
                    const st = statusBadge[p.status] ?? statusBadge.pending;
                    return (
                      <tr
                        key={p.id}
                        className="group border-border/40 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-muted-foreground font-mono text-xs">{(page - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell>
                          <span className="font-mono text-xs font-semibold bg-muted/40 px-2 py-1 rounded-md">{p.invoice || `#${p.id}`}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold text-[10px]">
                              {initials(p.employeeName)}
                            </div>
                            <span className="font-semibold text-sm group-hover:text-primary transition-colors">{p.employeeName || `#${p.employeeId}`}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs bg-muted/40">{p.month || '—'}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-bold text-sm"><CurrencyDisplay amount={p.amount} /></span>
                          {p.advanceDeducted > 0 ? (
                            <div className="text-[10px] text-muted-foreground">
                              + <CurrencyDisplay amount={p.advanceDeducted} className="inline" /> advance recovered
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">{datePart(p.paidAt) || '—'}</TableCell>
                        <TableCell>
                          {p.paidVia ? (
                            <Badge variant="secondary" className="text-[10px] font-medium border border-border/50 bg-muted/40">
                              {p.paidVia}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${st.cls} text-xs font-medium gap-1`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot} inline-block`} /> {st.label}
                          </Badge>
                        </TableCell>
                      </tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <TablePagination
            currentPage={list.data?.meta.page ?? page}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </Card>
      </div>

      </PageContent>
      {modalOpen && meta.data && <SalaryPaymentModal open={modalOpen} onOpenChange={setModalOpen} meta={meta.data} />}
    </div>
  );
}

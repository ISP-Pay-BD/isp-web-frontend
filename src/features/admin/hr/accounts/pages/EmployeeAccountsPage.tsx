'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useEmployeeAccounts } from '../hooks/use-employee-accounts';
import { useAdvanceSummary } from '../../advance-salary/hooks/use-advance-salary';
import { useHrMeta } from '../../shared/use-hr-meta';
import { useDebouncedValue } from '../../shared/use-debounced-value';
import { currentPayPeriod, initials, titleCase } from '../../shared/format';
import { PageSkeleton, EmptyState, CurrencyDisplay, TablePagination } from '@/components/shared';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
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
import { FileSpreadsheet, Search, HandCoins, CreditCard, ArrowUpRight, X, Briefcase, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmployeeAccountsPage() {
  const period = currentPayPeriod();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [month, setMonth] = useState(period.month);
  const [yearInput, setYearInput] = useState(String(period.year));
  const year = Number(yearInput);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, month, year, pageSize]);

  const list = useEmployeeAccounts({ page, perPage: pageSize, search: debouncedSearch, month, year });
  const advances = useAdvanceSummary();
  const meta = useHrMeta();

  const accounts = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;
  const months = meta.data?.months ?? [];
  const adv = advances.data;

  if (list.isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (list.isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load employee accounts" description={list.error?.message ?? 'Could not load staff financial ledger accounts.'} actionLabel="Retry" onAction={() => list.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Briefcase className="h-6 w-6" />
            </div>
            Employee Accounts Ledger
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Monthly ledger tracking: <strong>Balance = Salary − Approved Advances − Paid Salary</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div >
            <Button variant="outline" render={<Link href="/admin/hr/advance-salary" />}>
              <HandCoins className="mr-2 h-4 w-4" /> Advance Salary
            </Button>
          </div>
          <div >
            <Button className="bg-primary hover:bg-primary/90 font-semibold" render={<Link href="/admin/hr/salaries" />}>
              <CreditCard className="mr-2 h-4 w-4" /> Salary Payments
            </Button>
          </div>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{total}</span>{' '}
          <span className="text-muted-foreground">ledgers</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">
            {adv ? <CurrencyDisplay amount={adv.approvedTotal} className="inline font-semibold" /> : '—'}
          </span>{' '}
          <span className="text-muted-foreground">approved advances outstanding</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{adv?.approvedCount ?? '—'}</span>{' '}
          <span className="text-muted-foreground">open advances</span>
        </p>
        <p className="text-muted-foreground">Pay cycle <span className="font-medium text-foreground">{month} {Number.isFinite(year) ? year : ''}</span></p>
      </div>

      <div>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by staff name, mobile, or designation..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Select items={Object.fromEntries(months.map((m) => [m, m]))} value={month} onValueChange={(v) => v && setMonth(String(v))}>
                  <SelectTrigger className="w-[140px] h-9 text-xs border-border/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" value={yearInput} onChange={(e) => setYearInput(e.target.value)} className="h-9 w-[90px] text-xs" aria-label="Year" />
              </div>
            </div>
          </div>

          {accounts.length === 0 ? (
            <div className="py-16">
              <EmptyState icon={<FileSpreadsheet className="h-10 w-10" />} title="No employee accounts found" description={debouncedSearch ? 'No account records matching your search.' : 'Add employees to start tracking their payroll ledger.'} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-12 text-[11px] font-medium tracking-wide text-muted-foreground">#</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Employee</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Designation</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Monthly Base</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Outstanding Advance</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Paid This Month</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Net Balance Due</TableHead>
                    <TableHead className="text-right text-[11px] font-medium tracking-wide text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((acc, idx) => (
                    <tr key={acc.employeeId} className="group border-border/40 hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground font-mono text-xs">{(page - 1) * pageSize + idx + 1}</TableCell>
                      <TableCell>
                        <Link href={`/admin/hr/employees/${acc.employeeId}`} className="flex items-center gap-3">
                          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl font-semibold text-[10px] border border-border/60 bg-muted/50 text-muted-foreground">
                            {initials(acc.employeeName)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm group-hover:text-primary transition-colors">{acc.employeeName}</div>
                            <div className="text-muted-foreground font-mono text-[10px]">{acc.mobile || `#${acc.employeeId}`}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {acc.designation ? (
                          <Badge variant="secondary" className="text-[10px] font-medium border bg-muted/60 text-muted-foreground border-border/50">{titleCase(acc.designation)}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-sm"><CurrencyDisplay amount={acc.salary} /></span>
                      </TableCell>
                      <TableCell>
                        {acc.advance > 0 ? (
                          <span className="flex items-center gap-1.5 font-semibold text-sm text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <CurrencyDisplay amount={acc.advance} />
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs"><CurrencyDisplay amount={0} /></span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs"><CurrencyDisplay amount={acc.paid} /></TableCell>
                      <TableCell>
                        <span className={cn('font-mono font-bold text-sm', acc.balance > 0 ? 'text-rose-500' : 'text-emerald-500')}>
                          <CurrencyDisplay amount={acc.balance} />
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex">
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-primary/10 hover:text-primary" render={<Link href="/admin/hr/salaries" />}>
                            Pay <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </tr>
                  ))}
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
    </div>
  );
}

'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useEmployeeAccounts } from '../hooks/use-employee-accounts';
import { useAdvanceSummary } from '../../advance-salary/hooks/use-advance-salary';
import { useHrMeta } from '../../shared/use-hr-meta';
import { currentPayPeriod, initials, titleCase } from '../../shared/format';
import { monthLabel } from '../../shared/labels';
import { useTranslations } from '@/i18n/locale-context';
import { PageSkeleton, EmptyState, CurrencyDisplay } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HandCoins, CreditCard, ArrowUpRight, Briefcase, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EmployeeAccountItem } from '../types';

export function EmployeeAccountsPage() {
  const t = useTranslations();
  const period = currentPayPeriod();
  const table = useServerTable(DEFAULT_PAGE_SIZE);
  const [month, setMonth] = useState(period.month);
  const [yearInput, setYearInput] = useState(String(period.year));
  const year = Number(yearInput);

  const list = useEmployeeAccounts({ page: table.page, perPage: table.pageSize, search: table.search, month, year });
  const advances = useAdvanceSummary();
  const meta = useHrMeta();

  const accounts = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;
  const months = meta.data?.months ?? [];
  const adv = advances.data;

  const columns = useMemo<LegacyColumnDef<EmployeeAccountItem, unknown>[]>(
    () => [
      {
        accessorKey: 'employeeName',
        header: t('admin.hr.accounts.colEmployee', 'Employee'),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const acc = row.original;
          return (
            <Link href={`/admin/hr/employees/${acc.employeeId}`} className="group flex items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-semibold text-xs border border-border/60 bg-muted/50 text-muted-foreground">
                {initials(acc.employeeName)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm group-hover:text-primary transition-colors">{acc.employeeName}</div>
                <div className="text-muted-foreground font-mono text-xs">{acc.mobile || `#${acc.employeeId}`}</div>
              </div>
            </Link>
          );
        },
      },
      {
        accessorKey: 'designation',
        header: t('admin.hr.accounts.colDesignation', 'Designation'),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.designation ? (
            <Badge variant="secondary" className="text-xs font-medium border bg-muted/60 text-muted-foreground border-border/50">{titleCase(row.original.designation)}</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'salary',
        header: t('admin.hr.accounts.colBase', 'Monthly Base'),
        enableSorting: false,
        cell: ({ row }) => <span className="font-mono font-bold text-sm"><CurrencyDisplay amount={row.original.salary} /></span>,
      },
      {
        accessorKey: 'advance',
        header: t('admin.hr.accounts.colAdvance', 'Outstanding Advance'),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.advance > 0 ? (
            <span className="flex items-center gap-1.5 font-semibold text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden />
              <CurrencyDisplay amount={row.original.advance} />
            </span>
          ) : (
            <span className="text-muted-foreground text-xs"><CurrencyDisplay amount={0} /></span>
          ),
      },
      {
        accessorKey: 'paid',
        header: t('admin.hr.accounts.colPaid', 'Paid This Month'),
        enableSorting: false,
        cell: ({ row }) => <span className="font-mono text-xs"><CurrencyDisplay amount={row.original.paid} /></span>,
      },
      {
        accessorKey: 'balance',
        header: t('admin.hr.accounts.colBalance', 'Net Balance Due'),
        enableSorting: false,
        cell: ({ row }) => (
          <span className={cn('font-mono font-bold text-sm', row.original.balance > 0 ? 'text-rose-500' : 'text-emerald-500')}>
            <CurrencyDisplay amount={row.original.balance} />
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.hr.details.colAction', 'Action')}</span>,
        enableHiding: false,
        cell: () => (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" className="gap-1 text-xs hover:bg-primary/10 hover:text-primary" render={<Link href="/admin/hr/salaries" />}>
              {t('admin.hr.accounts.pay', 'Pay')} <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  if (list.isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (list.isError) {
    return (
      <div className="p-6">
        <EmptyState variant="error" title={t('admin.hr.accounts.loadFailed', 'Failed to load employee accounts')} description={list.error?.message ?? t('admin.hr.accounts.loadFailedHint', 'Could not load staff financial ledger accounts.')} actionLabel={t('common.retry', 'Retry')} onAction={() => list.refetch()} />
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
            {t('admin.hr.accounts.title', 'Employee Accounts Ledger')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            {t('admin.hr.accounts.subtitle', 'Monthly ledger tracking:')} <strong>{t('admin.hr.accounts.formula', 'Balance = Salary − Approved Advances − Paid Salary')}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div >
            <Button variant="outline" render={<Link href="/admin/hr/advance-salary" />}>
              <HandCoins className="mr-2 h-4 w-4" /> {t('admin.hr.accounts.advanceSalary', 'Advance Salary')}
            </Button>
          </div>
          <div >
            <Button className="bg-primary hover:bg-primary/90 font-semibold" render={<Link href="/admin/hr/salaries" />}>
              <CreditCard className="mr-2 h-4 w-4" /> {t('admin.hr.accounts.salaryPayments', 'Salary Payments')}
            </Button>
          </div>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{total}</span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.accounts.kpiLedgers', 'ledgers')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">
            {adv ? <CurrencyDisplay amount={adv.approvedTotal} className="inline font-semibold" /> : '—'}
          </span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.accounts.kpiApproved', 'approved advances outstanding')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{adv?.approvedCount ?? '—'}</span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.accounts.kpiOpen', 'open advances')}</span>
        </p>
        <p className="text-muted-foreground">{t('admin.hr.accounts.payCycle', 'Pay cycle')} <span className="font-medium text-foreground">{monthLabel(t, month)} {Number.isFinite(year) ? year : ''}</span></p>
      </div>

      <DataTable
        urlState
        columns={columns}
        data={accounts}
        getRowId={(row) => row.employeeId}
        searchPlaceholder={t('admin.hr.accounts.searchPlaceholder', 'Search by staff name, mobile, or designation...')}
        emptyTitle={t('admin.hr.accounts.emptyTitle', 'No employee accounts found')}
        emptyDescription={table.search ? t('admin.hr.accounts.emptyFiltered', 'No account records matching your search.') : t('admin.hr.accounts.emptyNone', 'Add employees to start tracking their payroll ledger.')}
        server={table.server(total)}
        toolbarActions={
          <>
            <Select
              items={Object.fromEntries(months.map((m) => [m, monthLabel(t, m)]))}
              value={month}
              onValueChange={(v) => {
                if (!v) return;
                setMonth(String(v));
                table.resetPage();
              }}
            >
              <SelectTrigger className="w-[160px] h-9 text-xs border-border/60" aria-label={t('admin.hr.accounts.payMonth', 'Pay month')}><SelectValue /></SelectTrigger>
              <SelectContent>
                {months.map((m) => <SelectItem key={m} value={m}>{monthLabel(t, m)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={yearInput}
              onChange={(e) => {
                setYearInput(e.target.value);
                table.resetPage();
              }}
              className="h-9 w-[90px] text-xs"
              aria-label={t('admin.hr.accounts.year', 'Year')}
            />
          </>
        }
      />
    
      </PageContent>
    </div>
  );
}

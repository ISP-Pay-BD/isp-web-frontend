'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useSalaries, useSalarySummary } from '../hooks/use-salaries';
import type { SalaryPaymentItem } from '../types';
import { useHrMeta } from '../../shared/use-hr-meta';
import { datePart, initials } from '../../shared/format';
import { hrStatusLabel, monthLabel } from '../../shared/labels';
import { useTranslations } from '@/i18n/locale-context';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge } from '@/components/shared';
import type { Tone } from '@/components/shared/status-tones';
import { DataTable } from '@/features/shared/data-table';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { SalaryPaymentModal } from '../components/SalaryPaymentModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Banknote, PlusCircle } from 'lucide-react';

const paymentTone: Record<string, Tone> = { successful: 'success', pending: 'warning', failed: 'danger' };

export function SalariesPage() {
  const t = useTranslations();
  const table = useServerTable(DEFAULT_PAGE_SIZE);
  const [monthFilter, setMonthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const list = useSalaries({ page: table.page, perPage: table.pageSize, search: table.search, month: monthFilter, status: statusFilter });
  const summary = useSalarySummary({ search: table.search, month: monthFilter });
  const meta = useHrMeta();

  const payments = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;
  const months = meta.data?.months ?? [];
  const statuses = meta.data?.paymentStatuses ?? [];
  const activeStaff = (meta.data?.employees ?? []).filter((e) => e.status === 'active').length;
  const s = summary.data;
  const avgPayout = s && s.successfulCount > 0 ? Math.round(s.successfulTotal / s.successfulCount) : 0;

  const columns = useMemo<LegacyColumnDef<SalaryPaymentItem, unknown>[]>(
    () => [
      {
        accessorKey: 'invoice',
        header: t('admin.hr.salaries.colVoucher', 'Voucher'),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold bg-muted/40 px-2 py-1 rounded-md">{row.original.invoice || `#${row.original.id}`}</span>
        ),
      },
      {
        accessorKey: 'employeeName',
        header: t('admin.hr.salaries.colEmployee', 'Employee'),
        enableSorting: false,
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold text-xs">
              {initials(row.original.employeeName)}
            </div>
            <span className="font-semibold text-sm">{row.original.employeeName || `#${row.original.employeeId}`}</span>
          </div>
        ),
      },
      {
        accessorKey: 'month',
        header: t('admin.hr.salaries.colMonth', 'Month'),
        enableSorting: false,
        cell: ({ row }) => <Badge variant="secondary" className="font-mono text-xs bg-muted/40">{row.original.month ? monthLabel(t, row.original.month) : '—'}</Badge>,
      },
      {
        accessorKey: 'amount',
        header: t('admin.hr.salaries.colAmount', 'Amount'),
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <span className="font-mono font-bold text-sm"><CurrencyDisplay amount={row.original.amount} /></span>
            {row.original.advanceDeducted > 0 ? (
              <div className="text-xs text-muted-foreground">
                + <CurrencyDisplay amount={row.original.advanceDeducted} className="inline" /> {t('admin.hr.salaries.advanceRecovered', 'advance recovered')}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'paidAt',
        header: t('admin.hr.salaries.colPaidDate', 'Paid Date'),
        enableSorting: false,
        cell: ({ row }) => <span className="text-muted-foreground text-xs font-mono">{datePart(row.original.paidAt) || '—'}</span>,
      },
      {
        accessorKey: 'paidVia',
        header: t('admin.hr.salaries.colPaidVia', 'Paid Via'),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.paidVia ? (
            <Badge variant="secondary" className="text-xs font-medium border border-border/50 bg-muted/40">
              {row.original.paidVia}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'status',
        header: t('common.status', 'Status'),
        enableSorting: false,
        cell: ({ row }) => {
          const status = row.original.status;
          const label =
            status === 'successful'
              ? t('status.paid', 'Paid')
              : status === 'failed'
                ? t('status.failed', 'Failed')
                : t('status.pending', 'Pending');
          return <StatusBadge status={status} tone={paymentTone[status] ?? 'warning'} label={label} />;
        },
      },
    ],
    [t],
  );

  if (list.isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (list.isError) {
    return (
      <div className="p-6">
        <EmptyState variant="error" title={t('admin.hr.salaries.loadFailed', 'Failed to load salary disbursements')} description={list.error?.message ?? t('admin.hr.salaries.loadFailedHint', 'Could not load the payroll payment registry.')} actionLabel={t('common.retry', 'Retry')} onAction={() => list.refetch()} />
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
            {t('admin.hr.salaries.title', 'Salary Payments')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            {t('admin.hr.salaries.subtitle', 'Disburse and review monthly employee payroll and payment vouchers.')}
          </p>
        </div>
        <div >
          <Button onClick={() => setModalOpen(true)} disabled={!meta.data} className="bg-primary hover:bg-primary/90 font-semibold shadow-sm gap-1.5">
            <PlusCircle className="h-4 w-4" /> {t('admin.hr.salaries.newPayment', 'New Salary Payment')}
          </Button>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">
            {s ? <CurrencyDisplay amount={s.successfulTotal} className="inline font-semibold" /> : '—'}
          </span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.salaries.kpiDisbursed', 'disbursed')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{s?.totalCount ?? '—'}</span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.salaries.kpiVouchers', 'vouchers')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">
            {s ? <CurrencyDisplay amount={s.pendingTotal} className="inline font-semibold" /> : '—'}
          </span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.salaries.kpiPending', 'pending')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">
            {s ? <CurrencyDisplay amount={avgPayout} className="inline font-semibold" /> : '—'}
          </span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.salaries.kpiAvg', 'avg payout')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{meta.data ? activeStaff : '—'}</span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.salaries.kpiStaff', 'staff on payroll')}</span>
        </p>
      </div>

      <DataTable
        urlState
        columns={columns}
        data={payments}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.hr.salaries.searchPlaceholder', 'Search by employee, invoice or method...')}
        emptyTitle={t('admin.hr.salaries.emptyTitle', 'No salary disbursements found')}
        emptyDescription={
          table.search || monthFilter !== 'all' || statusFilter !== 'all'
            ? t('admin.hr.salaries.emptyFiltered', 'No salary payment matches your search or filters.')
            : t('admin.hr.salaries.emptyNone', 'Recorded salary payments will appear here.')
        }
        server={table.server(total)}
        toolbarActions={
          <>
            <Select items={Object.fromEntries([['all', t('admin.hr.salaries.allMonths', 'All Months')], ...months.map((m) => [m, monthLabel(t, m)])])} value={monthFilter} onValueChange={(v) => { setMonthFilter(v ?? 'all'); table.resetPage(); }}>
              <SelectTrigger className="w-[170px] h-9 text-xs border-border/60" aria-label={t('admin.hr.salaries.filterMonth', 'Filter by salary month')}>
                <SelectValue placeholder={t('admin.hr.salaries.salaryMonth', 'Salary Month')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.hr.salaries.allMonths', 'All Months')}</SelectItem>
                {months.map((m) => <SelectItem key={m} value={m}>{monthLabel(t, m)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select items={Object.fromEntries([['all', t('admin.hr.salaries.allStatus', 'All Status')], ...statuses.map((st) => [st, hrStatusLabel(t, st)])])} value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? 'all'); table.resetPage(); }}>
              <SelectTrigger className="w-[150px] h-9 text-xs border-border/60" aria-label={t('admin.hr.salaries.filterStatus', 'Filter by status')}>
                <SelectValue placeholder={t('admin.hr.salaries.allStatus', 'All Status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.hr.salaries.allStatus', 'All Status')}</SelectItem>
                {statuses.map((st) => <SelectItem key={st} value={st}>{hrStatusLabel(t, st)}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        }
      />

      </PageContent>
      {modalOpen && meta.data && <SalaryPaymentModal open={modalOpen} onOpenChange={setModalOpen} meta={meta.data} />}
    </div>
  );
}

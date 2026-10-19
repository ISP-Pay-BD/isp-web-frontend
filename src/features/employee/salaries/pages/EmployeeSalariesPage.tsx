'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChartTooltip } from '@/components/shared/charts/ChartTooltip';
import { DataTable } from '@/features/shared/data-table';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ChartCard } from '@/components/shared/ChartCard';
import { FilterBar } from '@/components/shared/FilterBar';
import { formatBdt, formatBdtCompact, formatBdtWithSymbol } from '@/lib/format';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { useLocale } from '@/i18n/locale-context';
import {
  EmployeePageShell,
  EmployeeLoadingSkeleton,
  EmployeeEmptyState,
  EmployeeErrorState,
} from '@/features/employee/shared';
import { useEmployeeSummary } from '@/features/employee/shared/hooks/use-employee-summary';
import { formatDay, formatMonthName } from '@/features/employee/shared/lib/datetime';
import { statusLabel } from '@/features/employee/shared/lib/labels';
import { useEmployeeSalaries } from '../hooks/use-employee-salaries';
import type { EmployeeSalary } from '@/features/employee/shared';

const STATUS_LABEL: Record<EmployeeSalary['status'], string> = { successful: 'paid', pending: 'pending', failed: 'failed' };
const rawPeriod = (s: EmployeeSalary) => [s.month, s.year].filter(Boolean).join(' ') || '—';
/** "March 2026" as the API spells it -> the month in the active language. */
const localizePeriod = (raw: string) => {
  const [month, ...rest] = raw.split(' ');
  return [formatMonthName(month), ...rest].join(' ');
};
const periodLabel = (s: EmployeeSalary) => localizePeriod(rawPeriod(s));

export function EmployeeSalariesPage() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const { data, isLoading, isError, error, refetch } = useEmployeeSalaries(page, pageSize);
  const summary = useEmployeeSummary();
  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.meta.total ?? 0;

  const columns = useMemo<LegacyColumnDef<EmployeeSalary, unknown>[]>(
    () => [
      {
        id: 'period',
        header: t('employee.salaries.colMonth', 'Month'),
        cell: ({ row }) => <span className="font-medium">{periodLabel(row.original)}</span>,
      },
      {
        accessorKey: 'netAmount',
        header: t('employee.salaries.colNet', 'Net Amount'),
        meta: { mobile: 'title' },
        cell: ({ row }) => <CurrencyDisplay amount={row.original.netAmount} className="font-semibold" />,
      },
      {
        id: 'breakdown',
        header: t('employee.salaries.colBreakdown', 'Breakdown'),
        cell: ({ row }) => {
          const s = row.original;
          return s.advanceDeducted > 0 ? (
            <span className="text-muted-foreground text-xs">
              {t('employee.salaries.breakdown', 'Gross {gross} · Advance recovered {advance}', {
                gross: formatBdt(s.grossSalary),
                advance: formatBdt(s.advanceDeducted),
              })}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          );
        },
      },
      {
        id: 'paidVia',
        header: t('employee.salaries.colMethod', 'Method'),
        cell: ({ row }) => <span className="text-xs">{row.original.paidVia || '—'}</span>,
      },
      {
        id: 'paidAt',
        header: t('employee.salaries.colPaidOn', 'Paid On'),
        cell: ({ row }) => <span className="tabular-nums">{formatDay(row.original.paidAt) || '—'}</span>,
      },
      {
        id: 'status',
        header: t('employee.common.colStatus', 'Status'),
        meta: { mobile: 'status' },
        cell: ({ row }) => {
          const status = STATUS_LABEL[row.original.status];
          return <StatusBadge status={status} label={statusLabel(t, status)} />;
        },
      },
    ],
    [t],
  );

  // Trend of the payments on this page (oldest → newest).
  const chartData = useMemo(
    () =>
      [...items]
        .filter((s) => s.status === 'successful')
        .reverse()
        .map((s) => ({ month: rawPeriod(s), amount: s.netAmount })),
    [items],
  );

  const lastPayment = items[0];

  if (isLoading) {
    return (
      <EmployeePageShell
        title={t('employee.salaries.title', 'My Salaries')}
        subtitle={t('employee.salaries.loadingSubtitle', 'Loading salary history...')}
      >
        <EmployeeLoadingSkeleton />
      </EmployeePageShell>
    );
  }

  if (isError) {
    return (
      <EmployeePageShell
        title={t('employee.salaries.title', 'My Salaries')}
        subtitle={t('employee.salaries.errorSubtitle', 'Salary slips and payment history')}
      >
        <EmployeeErrorState message={error?.message} onRetry={() => refetch()} />
      </EmployeePageShell>
    );
  }

  return (
    <EmployeePageShell
      title={t('employee.salaries.title', 'My Salaries')}
      subtitle={t('employee.salaries.subtitle', 'View your salary slips and payment history')}
      breadcrumbs={[
        { label: t('employee.common.breadcrumb', 'Employee'), href: '/employee/salaries' },
        { label: t('employee.salaries.breadcrumb', 'Salaries') },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums">
              {summary.data ? <CurrencyDisplay amount={summary.data.salaryReceived} /> : '—'}
            </span>{' '}
            <span className="text-muted-foreground">{t('employee.salaries.totalReceived', 'total received')}</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">
              {summary.data ? <CurrencyDisplay amount={summary.data.salaryPending} /> : '—'}
            </span>{' '}
            <span className="text-muted-foreground">{t('employee.salaries.pending', 'pending')}</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{total}</span>{' '}
            <span className="text-muted-foreground">{t('employee.salaries.payments', 'payments')}</span>
          </p>
          <p className="text-muted-foreground">
            {t('employee.salaries.last', 'Last')}{' '}
            {lastPayment ? (
              <>
                <span className="font-medium text-foreground">
                  <CurrencyDisplay amount={lastPayment.netAmount} />
                </span>{' '}
                · {periodLabel(lastPayment)}
              </>
            ) : (
              '—'
            )}
          </p>
        </div>

        {chartData.length > 1 ? (
          <ChartCard
            title={t('employee.salaries.trendTitle', 'Salary trend')}
            description={t('employee.salaries.trendDescription', 'Net salary per payment')}
          >
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={localizePeriod}
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => formatBdtCompact(v)}
                  />
                  <Tooltip content={<ChartTooltip formatter={(val: number) => formatBdtWithSymbol(val)} labelFormatter={localizePeriod} />} />
                  <Bar
                    dataKey="amount"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={280}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        ) : null}

        <FilterBar filters={<span className="text-muted-foreground text-sm">{t('employee.salaries.history', 'Payment history')}</span>} />

        {total === 0 ? (
          <EmployeeEmptyState
            title={t('employee.salaries.empty', 'No salary records')}
            description={t('employee.salaries.emptyHint', 'Your salary payments will appear here once processed by HR.')}
          />
        ) : (
          <DataTable
            urlState
            columns={columns}
            data={items}
            getRowId={(row) => row.id}
            emptyTitle={t('employee.salaries.empty', 'No salary records')}
            emptyDescription={t('employee.salaries.emptyTableHint', 'Your salary payments will appear here once processed.')}
            server={{ page, pageSize, total, onPageChange: setPage, onPageSizeChange: (size) => { setPageSize(size); setPage(1); } }}
          />
        )}
      </div>
    </EmployeePageShell>
  );
}

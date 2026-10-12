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
import { formatBdt } from '@/lib/format';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import {
  EmployeePageShell,
  EmployeeLoadingSkeleton,
  EmployeeEmptyState,
  EmployeeErrorState,
} from '@/features/employee/shared';
import { useEmployeeSummary } from '@/features/employee/shared/hooks/use-employee-summary';
import { formatDay } from '@/features/employee/shared/lib/datetime';
import { useEmployeeSalaries } from '../hooks/use-employee-salaries';
import type { EmployeeSalary } from '@/features/employee/shared';

const STATUS_LABEL: Record<EmployeeSalary['status'], string> = { successful: 'paid', pending: 'pending', failed: 'failed' };
const periodLabel = (s: EmployeeSalary) => [s.month, s.year].filter(Boolean).join(' ') || '—';

export function EmployeeSalariesPage() {
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
        header: 'Month',
        cell: ({ row }) => <span className="font-medium">{periodLabel(row.original)}</span>,
      },
      {
        accessorKey: 'netAmount',
        header: 'Net Amount',
        cell: ({ row }) => <CurrencyDisplay amount={row.original.netAmount} className="font-semibold" />,
      },
      {
        id: 'breakdown',
        header: 'Breakdown',
        cell: ({ row }) => {
          const s = row.original;
          return s.advanceDeducted > 0 ? (
            <span className="text-muted-foreground text-xs">
              Gross {formatBdt(s.grossSalary)} · Advance recovered {formatBdt(s.advanceDeducted)}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          );
        },
      },
      {
        id: 'paidVia',
        header: 'Method',
        cell: ({ row }) => <span className="text-xs">{row.original.paidVia || '—'}</span>,
      },
      {
        id: 'paidAt',
        header: 'Paid On',
        cell: ({ row }) => <span className="tabular-nums">{formatDay(row.original.paidAt) || '—'}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={STATUS_LABEL[row.original.status]} />,
      },
    ],
    [],
  );

  // Trend of the payments on this page (oldest → newest).
  const chartData = useMemo(
    () =>
      [...items]
        .filter((s) => s.status === 'successful')
        .reverse()
        .map((s) => ({ month: periodLabel(s), amount: s.netAmount })),
    [items],
  );

  const lastPayment = items[0];

  if (isLoading) {
    return (
      <EmployeePageShell title="My Salaries" subtitle="Loading salary history...">
        <EmployeeLoadingSkeleton />
      </EmployeePageShell>
    );
  }

  if (isError) {
    return (
      <EmployeePageShell title="My Salaries" subtitle="Salary slips and payment history">
        <EmployeeErrorState message={error?.message} onRetry={() => refetch()} />
      </EmployeePageShell>
    );
  }

  return (
    <EmployeePageShell
      title="My Salaries"
      subtitle="View your salary slips and payment history"
      breadcrumbs={[
        { label: 'Employee', href: '/employee/salaries' },
        { label: 'Salaries' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums">
              {summary.data ? <CurrencyDisplay amount={summary.data.salaryReceived} /> : '—'}
            </span>{' '}
            <span className="text-muted-foreground">total received</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">
              {summary.data ? <CurrencyDisplay amount={summary.data.salaryPending} /> : '—'}
            </span>{' '}
            <span className="text-muted-foreground">pending</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{total}</span>{' '}
            <span className="text-muted-foreground">payments</span>
          </p>
          <p className="text-muted-foreground">
            Last{' '}
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
          <ChartCard title="Salary trend" description="Net salary per payment">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `৳${v / 1000}k`}
                  />
                  <Tooltip content={<ChartTooltip formatter={(val: number) => `৳${formatBdt(val)}`} />} />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    animationDuration={280}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        ) : null}

        <FilterBar filters={<span className="text-muted-foreground text-sm">Payment history</span>} />

        {total === 0 ? (
          <EmployeeEmptyState
            title="No salary records"
            description="Your salary payments will appear here once processed by HR."
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            getRowId={(row) => row.id}
            emptyTitle="No salary records"
            emptyDescription="Your salary payments will appear here once processed."
            server={{ page, pageSize, total, onPageChange: setPage, onPageSizeChange: (size) => { setPageSize(size); setPage(1); } }}
          />
        )}
      </div>
    </EmployeePageShell>
  );
}

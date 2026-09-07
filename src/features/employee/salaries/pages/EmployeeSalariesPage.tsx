'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChartTooltip } from '@/components/shared/charts/ChartTooltip';
import { DataTable } from '@/features/shared/data-table';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { ChartCard } from '@/components/shared/ChartCard';
import { FilterBar } from '@/components/shared/FilterBar';
import { formatBdt } from '@/lib/format';
import {
  EmployeePageShell,
  EmployeeLoadingSkeleton,
  EmployeeEmptyState,
  EmployeeErrorState,
} from '@/features/employee/shared';
import { useEmployeeSalaries } from '../hooks/use-employee-salaries';
import type { EmployeeSalary } from '@/features/employee/shared';

function formatSalaryMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export function EmployeeSalariesPage() {
  const { data, isLoading, isError, refetch } = useEmployeeSalaries();
  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const columns = useMemo<LegacyColumnDef<EmployeeSalary, unknown>[]>(
    () => [
      {
        accessorKey: 'month',
        header: 'Month',
        cell: ({ row }) => (
          <span className="font-medium">{formatSalaryMonth(row.original.month)}</span>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Net Amount',
        cell: ({ row }) => <CurrencyDisplay amount={row.original.amountBdt} className="font-semibold" />,
      },
      {
        id: 'breakdown',
        header: 'Breakdown',
        cell: ({ row }) => {
          const b = row.original.breakdown;
          return (
            <span className="text-muted-foreground text-xs">
              Basic {formatBdt(b.basic)} · Allowance {formatBdt(b.allowance)} · Deduction{' '}
              {formatBdt(b.deduction)}
            </span>
          );
        },
      },
      {
        accessorKey: 'paidAt',
        header: 'Paid On',
        cell: ({ row }) => <DateDisplay value={row.original.paidAt} />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  const chartData = useMemo(
    () =>
      [...items]
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((s) => ({
          month: formatSalaryMonth(s.month),
          amount: s.amountBdt,
        })),
    [items],
  );

  const totalPaid = items.reduce((sum, s) => sum + s.amountBdt, 0);
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
        <EmployeeErrorState onRetry={() => refetch()} />
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
              <CurrencyDisplay amount={totalPaid} />
            </span>{' '}
            <span className="text-muted-foreground">total received</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{items.length}</span>{' '}
            <span className="text-muted-foreground">payments</span>
          </p>
          <p className="text-muted-foreground">
            Last{' '}
            {lastPayment ? (
              <>
                <span className="font-medium text-foreground">
                  <CurrencyDisplay amount={lastPayment.amountBdt} />
                </span>{' '}
                · {formatSalaryMonth(lastPayment.month)}
              </>
            ) : (
              '—'
            )}
          </p>
        </div>

        {chartData.length > 0 ? (
          <ChartCard title="Salary trend" description="Net salary by month">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientSalaryBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                    </linearGradient>
                    <filter id="salaryBarShadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#10b981" floodOpacity="0.3" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
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
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(val: number) => `৳${formatBdt(val)}`}
                      />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    fill="url(#gradientSalaryBar)"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        ) : null}

        <FilterBar filters={<span className="text-muted-foreground text-sm">Payment history</span>} />

        {items.length === 0 ? (
          <EmployeeEmptyState
            title="No salary records"
            description="Your salary payments will appear here once processed by HR."
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            searchKey="month"
            searchPlaceholder="Filter by month..."
            facetFilters={[{ columnId: 'status', title: 'Status' }]}
            emptyTitle="No salary records"
            emptyDescription="Your salary payments will appear here once processed."
          />
        )}
      </div>
    </EmployeePageShell>
  );
}

'use client';

import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  RefreshCw,
  FileSpreadsheet,
  Scale,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAccountingSummary, type AccountingSummary } from '../hooks/use-accounting-reports';
import { PageSkeleton, EmptyState } from '@/components/shared';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DateRangeInputs, KpiCard } from '../../shared/components';
import { downloadCsv } from '../../shared/table-utils';
import { money, percentOf } from '../../shared/format';

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function presetRanges() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return [
    { key: 'this-month', label: 'This month', from: fmt(new Date(y, m, 1)), to: fmt(now) },
    {
      key: 'last-month',
      label: 'Last month',
      from: fmt(new Date(y, m - 1, 1)),
      to: fmt(new Date(y, m, 0)),
    },
    { key: 'this-year', label: 'This year', from: fmt(new Date(y, 0, 1)), to: fmt(now) },
  ];
}

interface BreakdownGroup {
  group: 'Income' | 'Expenses';
  total: number;
  lines: Array<{ label: string; amount: number }>;
}

function breakdown(s: AccountingSummary): BreakdownGroup[] {
  return [
    {
      group: 'Income',
      total: s.income.total,
      lines: [
        { label: 'Customer payments received', amount: s.income.customersPaymentReceived },
        { label: 'Other income', amount: s.income.otherIncome },
        { label: 'Bandwidth sales', amount: s.income.bandwidthSell },
        { label: 'OTC (one-time connection charges)', amount: s.income.otc },
      ],
    },
    {
      group: 'Expenses',
      total: s.expense.total,
      lines: [
        { label: 'Employee payments', amount: s.expense.employeePayment },
        { label: 'Other expenses', amount: s.expense.otherExpenses },
        { label: 'Bandwidth purchases', amount: s.expense.bandwidthBuy },
      ],
    },
  ];
}

export function AccountingReportsPage() {
  const presets = useMemo(() => presetRanges(), []);
  const [range, setRange] = useState({ from: presets[0].from, to: presets[0].to });
  const { data, isLoading, isError, error, refetch, isFetching, isPlaceholderData } =
    useAccountingSummary(range.from, range.to);

  const groups = useMemo(() => (data ? breakdown(data) : []), [data]);
  const margin = data ? percentOf(data.netAmount, data.income.total) : null;

  const handleExportCSV = () => {
    if (!data) return;
    downloadCsv(
      `accounts_summary_${data.fromDate || range.from}_${data.toDate || range.to}.csv`,
      ['Group', 'Line item', 'Amount (BDT)', '% of group'],
      [
        ...groups.flatMap((g) => [
          ...g.lines.map((l) => [g.group, l.label, l.amount, percentOf(l.amount, g.total) ?? '']),
          [g.group, `Total ${g.group.toLowerCase()}`, g.total, g.total ? '100.0%' : ''],
        ]),
        ['Net', 'Net amount (income − expenses)', data.netAmount, ''],
      ],
    );
    toast.success('Accounts summary exported');
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title="Accounts Report"
        subtitle={
          data?.fromDate
            ? `Income and expense totals from ${data.fromDate} to ${data.toDate}.`
            : 'Income and expense totals for the selected period.'
        }
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Accounting' },
          { label: 'Reports' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent h-9 gap-1.5 text-xs"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={!data || isError}
              className="border-border/80 hover:bg-accent h-9 gap-1.5 text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Period toolbar */}
      <div className="border-border/60 bg-card/60 flex flex-col gap-3 rounded-xl border p-3.5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-muted/40 border-border/60 flex w-fit items-center gap-1 rounded-xl border p-1">
          {presets.map((p) => (
            <Button
              key={p.key}
              type="button"
              size="sm"
              variant={range.from === p.from && range.to === p.to ? 'default' : 'ghost'}
              onClick={() => setRange({ from: p.from, to: p.to })}
              className="h-7 px-2.5 text-xs"
            >
              {p.label}
            </Button>
          ))}
        </div>
        <DateRangeInputs from={range.from} to={range.to} onChange={setRange} />
      </div>

      {isError || !data ? (
        <EmptyState
          title="Failed to load accounts summary"
          description={error?.message ?? 'Could not load the period summary.'}
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <div className={cn('space-y-6 transition-opacity', isPlaceholderData && 'opacity-60')}>
          {/* KPI Stats Ribbon */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Net Amount"
              value={money(data.netAmount)}
              hint="Income − expenses"
              icon={Scale}
              tone={data.netAmount >= 0 ? 'emerald' : 'rose'}
            />
            <KpiCard
              label="Total Income"
              value={money(data.income.total)}
              hint="All income lines"
              icon={TrendingUp}
              tone="emerald"
            />
            <KpiCard
              label="Total Expense"
              value={money(data.expense.total)}
              hint="All expense lines"
              icon={TrendingDown}
              tone="rose"
            />
            <KpiCard
              label="Margin"
              value={margin ?? '—'}
              hint="Net ÷ income"
              icon={PieChart}
              tone="blue"
            />
          </div>

          {/* Breakdown */}
          <div className="border-border/60 bg-card overflow-hidden rounded-xl border shadow-xs">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-muted-foreground border-border/60 border-b font-medium">
                    <TableHead className="text-xs font-semibold">Line item</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Amount (BDT)</TableHead>
                    <TableHead className="text-right text-xs font-semibold">% of group</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-border/40 divide-y">
                  {groups.map((g) => {
                    const tone = g.group === 'Income' ? 'text-emerald-400' : 'text-rose-400';
                    return [
                      <TableRow key={`${g.group}-head`} className="bg-muted/20 hover:bg-muted/20">
                        <TableCell
                          colSpan={3}
                          className={cn('text-xs font-bold tracking-wider uppercase', tone)}
                        >
                          {g.group}
                        </TableCell>
                      </TableRow>,
                      ...g.lines.map((l) => (
                        <TableRow key={`${g.group}-${l.label}`} className="hover:bg-muted/30">
                          <TableCell className="text-foreground pl-6 text-xs">{l.label}</TableCell>
                          <TableCell className="text-right font-mono text-xs tabular-nums">
                            {money(l.amount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right font-mono text-xs tabular-nums">
                            {percentOf(l.amount, g.total) ?? '—'}
                          </TableCell>
                        </TableRow>
                      )),
                      <TableRow key={`${g.group}-total`} className="hover:bg-transparent">
                        <TableCell className="text-foreground text-xs font-bold">
                          Total {g.group.toLowerCase()}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-mono text-sm font-bold tabular-nums',
                            tone,
                          )}
                        >
                          {money(g.total)}
                        </TableCell>
                        <TableCell />
                      </TableRow>,
                    ];
                  })}
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell className="text-foreground text-xs font-bold">Net amount</TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-mono text-sm font-black tabular-nums',
                        data.netAmount >= 0 ? 'text-emerald-400' : 'text-rose-400',
                      )}
                    >
                      {money(data.netAmount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right font-mono text-xs tabular-nums">
                      {margin ? `${margin} margin` : '—'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

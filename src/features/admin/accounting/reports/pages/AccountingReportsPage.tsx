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
import { useTranslations } from '@/i18n/locale-context';

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function presetRanges() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return [
    { key: 'thisMonth', from: fmt(new Date(y, m, 1)), to: fmt(now) },
    {
      key: 'lastMonth',
      from: fmt(new Date(y, m - 1, 1)),
      to: fmt(new Date(y, m, 0)),
    },
    { key: 'thisYear', from: fmt(new Date(y, 0, 1)), to: fmt(now) },
  ];
}

interface BreakdownGroup {
  group: 'Income' | 'Expenses';
  title: string;
  totalLabel: string;
  total: number;
  lines: Array<{ label: string; amount: number }>;
}

type Tr = (key: string, fallback: string) => string;

/** `tr` supplies the wording: the screen passes its translator, the CSV export an identity one (stays English). */
function breakdown(s: AccountingSummary, tr: Tr): BreakdownGroup[] {
  return [
    {
      group: 'Income',
      title: tr('admin.accounting.reports.groupIncome', 'Income'),
      totalLabel: tr('admin.accounting.reports.totalIncomeRow', 'Total income'),
      total: s.income.total,
      lines: [
        { label: tr('admin.accounting.reports.lineCustomerPayments', 'Customer payments received'), amount: s.income.customersPaymentReceived },
        { label: tr('admin.accounting.reports.lineOtherIncome', 'Other income'), amount: s.income.otherIncome },
        { label: tr('admin.accounting.reports.lineBandwidthSales', 'Bandwidth sales'), amount: s.income.bandwidthSell },
        { label: tr('admin.accounting.reports.lineOtc', 'OTC (one-time connection charges)'), amount: s.income.otc },
      ],
    },
    {
      group: 'Expenses',
      title: tr('admin.accounting.reports.groupExpenses', 'Expenses'),
      totalLabel: tr('admin.accounting.reports.totalExpensesRow', 'Total expenses'),
      total: s.expense.total,
      lines: [
        { label: tr('admin.accounting.reports.lineEmployeePayments', 'Employee payments'), amount: s.expense.employeePayment },
        { label: tr('admin.accounting.reports.lineOtherExpenses', 'Other expenses'), amount: s.expense.otherExpenses },
        { label: tr('admin.accounting.reports.lineBandwidthPurchases', 'Bandwidth purchases'), amount: s.expense.bandwidthBuy },
      ],
    },
  ];
}

export function AccountingReportsPage() {
  const t = useTranslations();
  const presets = useMemo(() => presetRanges(), []);
  const presetLabel = (key: string) =>
    key === 'thisMonth'
      ? t('admin.accounting.reports.thisMonth', 'This month')
      : key === 'lastMonth'
        ? t('admin.accounting.reports.lastMonth', 'Last month')
        : t('admin.accounting.reports.thisYear', 'This year');
  const [range, setRange] = useState({ from: presets[0].from, to: presets[0].to });
  const { data, isLoading, isError, error, refetch, isFetching, isPlaceholderData } =
    useAccountingSummary(range.from, range.to);

  const groups = useMemo(() => (data ? breakdown(data, t) : []), [data, t]);
  const margin = data ? percentOf(data.netAmount, data.income.total) : null;

  const handleExportCSV = () => {
    if (!data) return;
    downloadCsv(
      `accounts_summary_${data.fromDate || range.from}_${data.toDate || range.to}.csv`,
      ['Group', 'Line item', 'Amount (BDT)', '% of group'],
      [
        ...breakdown(data, (_key, fallback) => fallback).flatMap((g) => [
          ...g.lines.map((l) => [g.group, l.label, l.amount, percentOf(l.amount, g.total) ?? '']),
          [g.group, g.totalLabel, g.total, g.total ? '100.0%' : ''],
        ]),
        ['Net', 'Net amount (income − expenses)', data.netAmount, ''],
      ],
    );
    toast.success(t('admin.accounting.reports.toast.exported', 'Accounts summary exported'));
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title={t('nav.acc-reports', 'Accounts Report')}
        subtitle={
          data?.fromDate
            ? t('admin.accounting.reports.subtitleRange', 'Income and expense totals from {from} to {to}.', { from: data.fromDate, to: data.toDate })
            : t('admin.accounting.reports.subtitle', 'Income and expense totals for the selected period.')
        }
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('nav.accounting', 'Accounting') },
          { label: t('common.crumb.reports', 'Reports') },
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
              {t('admin.accounting.reports.refresh', 'Refresh')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={!data || isError}
              className="border-border/80 hover:bg-accent h-9 gap-1.5 text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              {t('admin.accounting.reports.exportCsv', 'Export CSV')}
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
              {presetLabel(p.key)}
            </Button>
          ))}
        </div>
        <DateRangeInputs from={range.from} to={range.to} onChange={setRange} />
      </div>

      {isError || !data ? (
        <EmptyState variant="error"
          title={t('admin.accounting.reports.loadFailed', 'Failed to load accounts summary')}
          description={error?.message ?? t('admin.accounting.reports.loadFailedHint', 'Could not load the period summary.')}
          actionLabel={t('common.retry', 'Retry')}
          onAction={() => refetch()}
        />
      ) : (
        <div className={cn('space-y-6 transition-opacity', isPlaceholderData && 'opacity-60')}>
          {/* KPI Stats Ribbon */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label={t('admin.accounting.reports.kpiNet', 'Net Amount')}
              value={money(data.netAmount)}
              hint={t('admin.accounting.reports.kpiNetHint', 'Income − expenses')}
              icon={Scale}
              tone={data.netAmount >= 0 ? 'emerald' : 'rose'}
            />
            <KpiCard
              label={t('admin.accounting.reports.kpiIncome', 'Total Income')}
              value={money(data.income.total)}
              hint={t('admin.accounting.reports.kpiIncomeHint', 'All income lines')}
              icon={TrendingUp}
              tone="emerald"
            />
            <KpiCard
              label={t('admin.accounting.reports.kpiExpense', 'Total Expense')}
              value={money(data.expense.total)}
              hint={t('admin.accounting.reports.kpiExpenseHint', 'All expense lines')}
              icon={TrendingDown}
              tone="rose"
            />
            <KpiCard
              label={t('admin.accounting.reports.kpiMargin', 'Margin')}
              value={margin ?? '—'}
              hint={t('admin.accounting.reports.kpiMarginHint', 'Net ÷ income')}
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
                    <TableHead className="text-xs font-semibold">{t('admin.accounting.reports.colLine', 'Line item')}</TableHead>
                    <TableHead className="text-right text-xs font-semibold">{t('admin.accounting.reports.colAmount', 'Amount (BDT)')}</TableHead>
                    <TableHead className="text-right text-xs font-semibold">{t('admin.accounting.reports.colPercent', '% of group')}</TableHead>
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
                          {g.title}
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
                          {g.totalLabel}
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
                    <TableCell className="text-foreground text-xs font-bold">{t('admin.accounting.reports.netAmount', 'Net amount')}</TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-mono text-sm font-black tabular-nums',
                        data.netAmount >= 0 ? 'text-emerald-400' : 'text-rose-400',
                      )}
                    >
                      {money(data.netAmount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right font-mono text-xs tabular-nums">
                      {margin ? t('admin.accounting.reports.marginSuffix', '{margin} margin', { margin }) : '—'}
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

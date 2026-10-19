'use client';

import { useState } from 'react';
import {
  Scale,
  Landmark,
  CreditCard,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBalanceSheet, type BalanceSheetRow } from '../hooks/use-balance-sheet';
import { PageSkeleton, EmptyState } from '@/components/shared';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { KpiCard } from '../../shared/components';
import { downloadCsv, todayYmd } from '../../shared/table-utils';
import { money, percentOf } from '../../shared/format';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

function SectionBlock({
  title,
  total,
  items,
  icon: Icon,
  color,
  bg,
  border,
}: {
  title: string;
  total: number;
  items: BalanceSheetRow[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}) {
  const t = useTranslations();
  // Share of the section by magnitude, so contra / negative balances never break the maths.
  const magnitude = items.reduce((s, i) => s + Math.abs(i.balance), 0);

  return (
    <Card className="border-border/70 bg-card/60 flex h-full flex-col overflow-hidden border shadow-sm backdrop-blur-md">
      <CardContent className="p-0">
        {/* Header */}
        <div className="border-border/60 bg-muted/30 flex items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-xl border p-2.5', color, bg, border)}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-foreground text-sm font-bold">{title}</h3>
              <p className="text-muted-foreground text-xs">
                {items.length === 1
                  ? t('admin.accounting.balanceSheet.accountOne', '{n} account with a balance', { n: formatCount(items.length) })
                  : t('admin.accounting.balanceSheet.accountMany', '{n} accounts with a balance', { n: formatCount(items.length) })}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn('px-2.5 py-1 font-mono text-xs font-bold', color, bg, border)}
          >
            {money(total)}
          </Badge>
        </div>

        {/* Items list */}
        <div className="p-3.5">
          {items.length === 0 ? (
            <p className="text-muted-foreground px-3 py-4 text-xs">{t('admin.accounting.balanceSheet.noBalances', 'No balances')}</p>
          ) : (
            <ul className="space-y-1">
              {items.map((item) => {
                const pct = percentOf(Math.abs(item.balance), magnitude);
                return (
                  <li
                    key={`${item.code}-${item.name}`}
                    className="hover:bg-muted/40 group hover:border-border/40 flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <ArrowRight className="text-muted-foreground/40 group-hover:text-primary h-3.5 w-3.5 shrink-0 transition-colors" />
                      <div className="min-w-0">
                        <span className="text-foreground group-hover:text-primary text-xs font-medium transition-colors">
                          <span className="text-muted-foreground mr-1.5 font-mono">
                            {item.code}
                          </span>
                          {item.name}
                        </span>
                        {pct && (
                          <span className="text-muted-foreground block font-mono text-xs">
                            {t('admin.accounting.balanceSheet.ofSection', '{pct} of section', { pct })}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'font-mono text-xs font-bold tabular-nums transition-colors',
                        item.balance < 0
                          ? 'text-rose-400'
                          : 'text-foreground group-hover:text-primary',
                      )}
                    >
                      {money(item.balance)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function BalanceSheetPage() {
  const t = useTranslations();
  const [asOf, setAsOf] = useState(todayYmd());
  const { balanceSheet, isLoading, isError, error, refetch, isFetching, isPlaceholderData } =
    useBalanceSheet(asOf);

  const handleExportCSV = () => {
    if (!balanceSheet) return;
    const b = balanceSheet;
    const section = (name: string, list: BalanceSheetRow[]) =>
      list.map((r) => [name, r.code, r.name, r.balance]);
    downloadCsv(
      `balance_sheet_${b.asOf || asOf || todayYmd()}.csv`,
      ['Section', 'Code', 'Account', 'Balance (BDT)'],
      [
        ...section('Assets', b.assets),
        ...section('Liabilities', b.liabilities),
        ...section('Equity', b.equity),
        ['Totals', '', 'Total assets', b.totals.assets],
        ['Totals', '', 'Total liabilities', b.totals.liabilities],
        ['Totals', '', 'Total equity', b.totals.equity],
        ['Totals', '', 'Total liabilities & equity', b.totalLiabilitiesAndEquity],
        ['Totals', '', 'Difference (assets − liabilities − equity)', b.difference],
      ],
    );
    toast.success(t('admin.accounting.balanceSheet.exported', 'Balance sheet as of {date} exported', { date: b.asOf || asOf }));
  };

  if (isLoading) return <PageSkeleton variant="dashboard" rows={6} />;

  const b = balanceSheet;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title={t('admin.accounting.balanceSheet.title', 'Balance Sheet (Financial Position)')}
        subtitle={
          b?.asOf
            ? t('admin.accounting.balanceSheet.subtitleAsOf', 'Assets, liabilities and equity as of {date}, computed from posted journal entries.', { date: b.asOf })
            : t('admin.accounting.balanceSheet.subtitle', 'Assets, liabilities and equity computed from posted journal entries.')
        }
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('nav.accounting', 'Accounting') },
          { label: t('nav.acc-balance', 'Balance Sheet') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label={t('admin.accounting.balanceSheet.asOfDate', 'As of date')}
              value={asOf}
              max={todayYmd()}
              onChange={(e) => setAsOf(e.target.value)}
              className="h-8 w-[150px] font-mono text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent gap-1.5 text-xs"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              {t('admin.accounting.balanceSheet.refresh', 'Refresh')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={!b || isError}
              className="border-border/80 hover:bg-accent gap-1.5 text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              {t('admin.accounting.balanceSheet.export', 'Export Balance Sheet')}
            </Button>
          </div>
        }
      />

      {isError || !b ? (
        <EmptyState variant="error"
          title={t('admin.accounting.balanceSheet.loadFailed', 'Failed to load balance sheet')}
          description={error?.message ?? t('admin.accounting.balanceSheet.loadFailedHint', 'Could not generate the financial snapshot.')}
          actionLabel={t('common.retry', 'Retry')}
          onAction={() => refetch()}
        />
      ) : (
        <div className={cn('space-y-6 transition-opacity', isPlaceholderData && 'opacity-60')}>
          {/* KPI Stats Ribbon */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label={t('admin.accounting.balanceSheet.totalAssets', 'Total Assets')}
              value={money(b.totals.assets)}
              hint={t('admin.accounting.balanceSheet.assetAccounts', '{n} asset accounts', { n: formatCount(b.assets.length) })}
              icon={Landmark}
              tone="blue"
            />
            <KpiCard
              label={t('admin.accounting.balanceSheet.totalLiabilities', 'Total Liabilities')}
              value={money(b.totals.liabilities)}
              hint={t('admin.accounting.balanceSheet.liabilityAccounts', '{n} liability accounts', { n: formatCount(b.liabilities.length) })}
              icon={CreditCard}
              tone="amber"
            />
            <KpiCard
              label={t('admin.accounting.balanceSheet.totalEquity', 'Total Equity')}
              value={money(b.totals.equity)}
              hint={t('admin.accounting.balanceSheet.equityHint', 'Incl. current-period net income & retained earnings')}
              icon={TrendingUp}
              tone="emerald"
            />
            <KpiCard
              label={t('admin.accounting.balanceSheet.equation', 'Accounting Equation')}
              value={
                b.isBalanced ? (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> {t('admin.accounting.balanceSheet.balanced', 'Balanced')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-amber-400">
                    <AlertTriangle className="h-4 w-4" />{' '}
                    {t('admin.accounting.balanceSheet.outOfBalance', 'Out of balance by {amount}', { amount: money(Math.abs(b.difference)) })}
                  </span>
                )
              }
              hint={t('admin.accounting.balanceSheet.equationHint', 'Assets = Liabilities + Equity')}
              icon={b.isBalanced ? ShieldCheck : AlertTriangle}
              tone={b.isBalanced ? 'purple' : 'amber'}
            />
          </div>

          {/* Sections */}
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionBlock
              title={t('admin.accounting.balanceSheet.assets', 'Assets')}
              total={b.totals.assets}
              items={b.assets}
              icon={Landmark}
              color="text-blue-400"
              bg="bg-blue-500/10"
              border="border-blue-500/20"
            />
            <SectionBlock
              title={t('admin.accounting.balanceSheet.liabilities', 'Liabilities')}
              total={b.totals.liabilities}
              items={b.liabilities}
              icon={CreditCard}
              color="text-amber-400"
              bg="bg-amber-500/10"
              border="border-amber-500/20"
            />
            <SectionBlock
              title={t('admin.accounting.balanceSheet.equity', 'Equity')}
              total={b.totals.equity}
              items={b.equity}
              icon={TrendingUp}
              color="text-emerald-400"
              bg="bg-emerald-500/10"
              border="border-emerald-500/20"
            />
          </div>

          {/* Equation Summary Banner */}
          <Card
            className={cn(
              'overflow-hidden border shadow-sm',
              b.isBalanced
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-amber-500/30 bg-amber-500/5',
            )}
          >
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={cn(
                      'rounded-2xl border p-3',
                      b.isBalanced
                        ? 'border-emerald-500/20 bg-emerald-500/10'
                        : 'border-amber-500/20 bg-amber-500/10',
                    )}
                  >
                    <Scale
                      className={cn(
                        'h-6 w-6',
                        b.isBalanced ? 'text-emerald-400' : 'text-amber-400',
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="text-foreground text-base font-bold sm:text-lg">
                      {t('admin.accounting.balanceSheet.totalLE', 'Total Liabilities & Equity')}
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {t('admin.accounting.balanceSheet.equationLine', 'Assets ({assets}) {op} Liabilities ({liabilities}) + Equity ({equity})', {
                        assets: money(b.totals.assets),
                        op: b.isBalanced ? '=' : '≠',
                        liabilities: money(b.totals.liabilities),
                        equity: money(b.totals.equity),
                      })}
                      {!b.isBalanced &&
                        ` · ${t('admin.accounting.balanceSheet.difference', 'difference {amount}', { amount: money(b.difference) })}`}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  tone={b.isBalanced ? 'success' : 'warning'} className="self-start px-4 py-2 font-mono text-base font-bold shadow-xs sm:self-auto sm:text-lg"
                >
                  {money(b.totalLiabilitiesAndEquity)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHero, PageContent } from '@/components/motion/PageHero';
import {
  useSwitchPayg,
  useWallet,
  useWalletAddons,
  useWalletTopup,
  useWalletTransactions,
  type WalletTransaction,
  type WalletTxFilters,
} from '../hooks/use-wallet';
import { GatewayPicker } from '@/features/admin/payment/components/GatewayPicker';
import { PageSkeleton, EmptyState, CurrencyDisplay, ConfirmDialog } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, TrendingUp, Clock, ShieldCheck, Plus, RotateCw, Loader2, Puzzle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ApiError } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatDate, formatDateTime, formatBdtWithSymbol } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

export function WalletPage() {
  const t = useTranslations();
  const { data: wallet, isLoading, isError, error, isFetching, refetch } = useWallet();
  const [txFilters, setTxFilters] = useState<WalletTxFilters>({ page: 1, pageSize: 20, type: 'all', search: '' });
  const tx = useWalletTransactions(txFilters);
  const topup = useWalletTopup();
  const saveAddons = useWalletAddons();
  const switchPayg = useSwitchPayg();

  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(0);
  const [gateway, setGateway] = useState('');
  const [addons, setAddons] = useState<string[] | null>(null);
  const [confirmPayg, setConfirmPayg] = useState(false);

  // Preset amounts derived from the server's minimum and the real monthly estimate.
  const presets = useMemo(() => {
    if (!wallet) return [];
    const base = Math.max(wallet.minTopupBdt, Math.ceil(wallet.estimate.totalBdt / 100) * 100);
    const values = [wallet.minTopupBdt, base, base * 3, base * 6].filter((v) => v > 0 && (!wallet.maxTopupBdt || v <= wallet.maxTopupBdt));
    return Array.from(new Set(values)).sort((a, b) => a - b);
  }, [wallet]);

  const txRows = useMemo(() => tx.data?.items ?? [], [tx.data]);
  const txColumns = useMemo<LegacyColumnDef<WalletTransaction, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: t('admin.wallet.colDate', 'Date & time'),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: t('admin.wallet.colType', 'Type'),
        meta: { mobile: 'status' },
        cell: ({ row }) => {
          const isCredit = row.original.type === 'credit';
          return (
            <Badge variant="outline" tone={isCredit ? 'success' : 'neutral'} className="text-xs font-medium capitalize px-2 py-0.5">
              {isCredit ? <ArrowDownLeft className="mr-1 h-3 w-3 inline" /> : <ArrowUpRight className="mr-1 h-3 w-3 inline" />}
              {isCredit
                ? t('admin.wallet.typeCredit', 'credit')
                : row.original.type === 'debit'
                  ? t('admin.wallet.typeDebit', 'debit')
                  : row.original.type || '—'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'description',
        header: t('admin.wallet.colDescription', 'Description'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => <span className="text-foreground/90 font-medium">{row.original.description || '—'}</span>,
      },
      {
        accessorKey: 'reference',
        header: t('admin.wallet.colReference', 'Reference'),
        cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.original.reference || '—'}</span>,
      },
      {
        accessorKey: 'amountBdt',
        header: t('admin.wallet.colAmount', 'Amount'),
        cell: ({ row }) => {
          const isCredit = row.original.type === 'credit';
          return (
            <span className={`font-mono font-semibold ${isCredit ? 'text-emerald-500' : 'text-red-400'}`}>
              {isCredit ? '+' : '-'} <CurrencyDisplay amount={Math.abs(row.original.amountBdt)} />
            </span>
          );
        },
      },
      {
        accessorKey: 'balanceAfterBdt',
        header: t('admin.wallet.colBalanceAfter', 'Balance after'),
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            <CurrencyDisplay amount={row.original.balanceAfterBdt} />
          </span>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;

  if (isError || !wallet) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return (
      <EmptyState
        title={forbidden ? t('admin.wallet.noWallet', 'No platform wallet for this account') : t('admin.wallet.loadFailed', 'Failed to load wallet')}
        description={forbidden ? errorMessage(error) : errorMessage(error, t('admin.wallet.loadFailedHint', 'Could not load the platform wallet.'))}
        actionLabel={forbidden ? undefined : t('common.retry', 'Retry')}
        onAction={forbidden ? undefined : () => refetch()}
      />
    );
  }

  const runwayMonths = wallet.estimate.totalBdt > 0 ? wallet.balanceBdt / wallet.estimate.totalBdt : null;
  const chosen = addons ?? wallet.chosenAddons;
  const addonsDirty = addons !== null && [...addons].sort().join(',') !== [...wallet.chosenAddons].sort().join(',');
  const amountValid = topupAmount >= wallet.minTopupBdt && (!wallet.maxTopupBdt || topupAmount <= wallet.maxTopupBdt);

  const openTopup = () => {
    setTopupAmount(presets[1] ?? presets[0] ?? wallet.minTopupBdt);
    setGateway(wallet.providers[0] ?? '');
    setIsTopupOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHero className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Wallet className="h-6 w-6 text-primary" />
            {t('admin.wallet.title', 'Platform Wallet & Billing')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {wallet.isPayg
              ? t('admin.wallet.paygSummary', 'Pay-As-You-Go: {base} base + {rate}/customer every {days} days.', {
                  base: formatBdtWithSymbol(wallet.estimate.baseFeeBdt),
                  rate: formatBdtWithSymbol(wallet.estimate.perUserRateBdt),
                  days: wallet.estimate.cycleDays,
                })
              : t('admin.wallet.prepaidSummary', 'Prepaid balance for your platform subscription.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="border-border/70 text-xs">
            <RotateCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {t('admin.wallet.refresh', 'Refresh')}
          </Button>
          <Button onClick={openTopup} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-sm shadow-primary/20">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {t('admin.wallet.topUp', 'Top Up Wallet')}
          </Button>
        </div>
      </PageHero>

      <PageContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card/60 to-card/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('admin.wallet.balance', 'Wallet balance')}</span>
              <div className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/30"><Wallet className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-foreground"><CurrencyDisplay amount={wallet.balanceBdt} /></div>
            <p className="mt-1 text-xs text-primary flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              {runwayMonths === null
                ? t('admin.wallet.noEstimate', 'No monthly charge estimated')
                : t('admin.wallet.runway', '~{n} cycles of runway', { n: runwayMonths.toFixed(1) })}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('admin.wallet.cycleCharge', 'Estimated cycle charge')}</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20"><CreditCard className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-foreground"><CurrencyDisplay amount={wallet.estimate.totalBdt} /></div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('admin.wallet.customers', '{n} customers', { n: wallet.estimate.totalUsers })}
              {wallet.estimate.addonTotalBdt > 0
                ? ` · ${t('admin.wallet.addonsAmount', 'add-ons {amount}', { amount: formatBdtWithSymbol(wallet.estimate.addonTotalBdt) })}`
                : ''}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('admin.wallet.validUntil', 'Subscription valid until')}</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 text-xl font-bold tracking-tight text-foreground font-mono">{wallet.willExpire ? formatDate(wallet.willExpire) : '—'}</div>
            <p className="mt-1 text-xs text-amber-500/90 font-medium">
              {wallet.graceUntil
                ? t('admin.wallet.grace', 'Grace period until {date}', { date: formatDate(wallet.graceUntil) })
                : wallet.isPayg
                  ? t('admin.wallet.chargedFromWallet', 'Charged from the wallet each cycle')
                  : t('admin.wallet.renewHint', 'Renew from Self Recharge')}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('admin.wallet.plan', 'Billing plan')}</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ShieldCheck className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 text-xl font-bold tracking-tight text-emerald-500">{wallet.isPayg ? t('admin.wallet.payg', 'Pay-As-You-Go') : t('admin.wallet.fixedPlan', 'Fixed plan')}</div>
            {wallet.isPayg ? (
              <p className="mt-1 text-xs text-muted-foreground">{t('admin.wallet.billedFromWallet', 'Billed from this wallet')}</p>
            ) : (
              <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => setConfirmPayg(true)} disabled={switchPayg.isPending}>
                {switchPayg.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                {t('admin.wallet.switchPayg', 'Switch to Pay-As-You-Go')}
              </Button>
            )}
          </div>
        </div>

        {wallet.addonCatalog.length ? (
          <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-sm text-foreground flex items-center gap-2"><Puzzle className="h-4 w-4 text-primary" /> {t('nav.addons', 'Add-ons')}</h2>
                <p className="text-xs text-muted-foreground">{t('admin.wallet.addonsHint', 'Billed with your next cycle charge')}</p>
              </div>
              <Button size="sm" disabled={!addonsDirty || saveAddons.isPending} onClick={() => saveAddons.mutate(chosen, { onSuccess: () => setAddons(null) })}>
                {saveAddons.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                {t('admin.wallet.saveAddons', 'Save add-ons')}
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {wallet.addonCatalog.map((a) => (
                <label key={a.key} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3 text-sm cursor-pointer hover:bg-muted/30">
                  <span className="flex items-center gap-2">
                    <Checkbox
                      checked={chosen.includes(a.key)}
                      onCheckedChange={(v) => setAddons((cur) => {
                        const base = cur ?? wallet.chosenAddons;
                        return v ? Array.from(new Set([...base, a.key])) : base.filter((k) => k !== a.key);
                      })}
                    />
                    {a.label}
                  </span>
                  <CurrencyDisplay amount={a.priceBdt} className="text-xs text-muted-foreground" />
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <section className="space-y-3">
          <div>
            <h2 className="font-semibold text-sm text-foreground">{t('admin.wallet.ledger', 'Wallet ledger')}</h2>
            <p className="text-xs text-muted-foreground">{t('admin.wallet.ledgerHint', 'Top-ups and cycle charges')}</p>
          </div>
          {tx.isError ? (
            <EmptyState
              variant="error"
              title={t('admin.wallet.txFailed', 'Failed to load wallet transactions')}
              description={errorMessage(tx.error)}
              actionLabel={t('common.retry', 'Retry')}
              onAction={() => tx.refetch()}
            />
          ) : (
            <div className={tx.isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              <DataTable
                urlState
                columns={txColumns}
                data={txRows}
                isLoading={tx.isLoading}
                getRowId={(row) => row.id}
                searchPlaceholder={t('admin.wallet.searchPlaceholder', 'Search description or reference...')}
                emptyTitle={
                  txFilters.search || txFilters.type !== 'all'
                    ? t('admin.wallet.emptyFiltered', 'No transactions match your filters')
                    : t('admin.wallet.emptyNone', 'No wallet transactions yet.')
                }
                server={{
                  page: txFilters.page,
                  pageSize: txFilters.pageSize,
                  total: tx.data?.meta.total ?? 0,
                  onPageChange: (page) => setTxFilters((f) => ({ ...f, page })),
                  onPageSizeChange: (pageSize) => setTxFilters((f) => ({ ...f, page: 1, pageSize })),
                  search: txFilters.search,
                  onSearchChange: (search) => setTxFilters((f) => (f.search === search ? f : { ...f, page: 1, search })),
                }}
                toolbarActions={
                  <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/60">
                    {(['all', 'credit', 'debit'] as const).map((kind) => (
                      <Button
                        key={kind}
                        size="sm"
                        variant={txFilters.type === kind ? 'default' : 'ghost'}
                        onClick={() => setTxFilters((f) => ({ ...f, page: 1, type: kind }))}
                        className="h-7 text-xs px-2.5"
                      >
                        {kind === 'all'
                          ? t('admin.wallet.filterAll', 'All')
                          : kind === 'credit'
                            ? t('admin.wallet.filterCredits', 'Credits')
                            : t('admin.wallet.filterDebits', 'Debits')}
                      </Button>
                    ))}
                  </div>
                }
              />
            </div>
          )}
        </section>
      </PageContent>

      <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/80">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground"><Wallet className="h-5 w-5 text-primary" /> {t('admin.wallet.dialogTitle', 'Top up wallet')}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t('admin.wallet.dialogDesc', "You will pay on the gateway's page; the balance is added once the gateway confirms the payment.")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {presets.length ? (
              <div className="grid grid-cols-4 gap-2">
                {presets.map((amount) => (
                  <Button key={amount} type="button" variant={topupAmount === amount ? 'default' : 'outline'} size="sm" onClick={() => setTopupAmount(amount)} className="h-9 text-xs font-mono font-semibold">
                    {formatBdtWithSymbol(amount)}
                  </Button>
                ))}
              </div>
            ) : null}
            <div>
              <label htmlFor="wallet-topup-amount" className="text-xs font-medium text-foreground block mb-1">{t('admin.wallet.amountLabel', 'Amount (৳)')}</label>
              <Input
                id="wallet-topup-amount"
                type="number"
                value={topupAmount || ''}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                min={wallet.minTopupBdt}
                max={wallet.maxTopupBdt || undefined}
                className="bg-background/80 border-border/70 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t('admin.wallet.range', 'Between {min} and {max}', {
                  min: formatBdtWithSymbol(wallet.minTopupBdt),
                  max: formatBdtWithSymbol(wallet.maxTopupBdt),
                })}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-2">{t('admin.wallet.gateway', 'Payment gateway')}</label>
              <GatewayPicker providers={wallet.providers} value={gateway} onChange={setGateway} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setIsTopupOpen(false)} className="text-xs">{t('common.cancel', 'Cancel')}</Button>
            <Button
              size="sm"
              disabled={!amountValid || !gateway || topup.isPending}
              onClick={() => topup.mutate({ amountBdt: topupAmount, method: gateway })}
              className="text-xs bg-primary hover:bg-primary/90"
            >
              {topup.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              {t('admin.wallet.pay', 'Pay {amount}', { amount: formatBdtWithSymbol(topupAmount || 0) })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmPayg}
        onOpenChange={setConfirmPayg}
        title={t('admin.wallet.confirmTitle', 'Switch to Pay-As-You-Go?')}
        description={t(
          'admin.wallet.confirmDesc',
          'Your platform bill becomes {base} + {rate} per customer each cycle, charged from this wallet.',
          { base: formatBdtWithSymbol(wallet.estimate.baseFeeBdt), rate: formatBdtWithSymbol(wallet.estimate.perUserRateBdt) },
        )}
        confirmLabel={t('admin.wallet.confirmSwitch', 'Switch')}
        onConfirm={() => switchPayg.mutate()}
      />
    </div>
  );
}

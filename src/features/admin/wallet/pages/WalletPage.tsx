'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHero, PageContent } from '@/components/motion/PageHero';
import {
  useSwitchPayg,
  useWallet,
  useWalletAddons,
  useWalletTopup,
  useWalletTransactions,
  type WalletTxFilters,
} from '../hooks/use-wallet';
import { GatewayPicker } from '@/features/admin/payment/components/GatewayPicker';
import { PageSkeleton, EmptyState, CurrencyDisplay, ConfirmDialog, TablePagination } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, TrendingUp, Clock, ShieldCheck, Plus, RotateCw, Search, Loader2, Puzzle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ApiError } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatDate, formatDateTime } from '@/lib/format';

export function WalletPage() {
  const { data: wallet, isLoading, isError, error, isFetching, refetch } = useWallet();
  const [txFilters, setTxFilters] = useState<WalletTxFilters>({ page: 1, pageSize: 20, type: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const tx = useWalletTransactions(txFilters);
  const topup = useWalletTopup();
  const saveAddons = useWalletAddons();
  const switchPayg = useSwitchPayg();

  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(0);
  const [gateway, setGateway] = useState('');
  const [addons, setAddons] = useState<string[] | null>(null);
  const [confirmPayg, setConfirmPayg] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTxFilters((f) => (f.search === searchInput.trim() ? f : { ...f, page: 1, search: searchInput.trim() })), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Preset amounts derived from the server's minimum and the real monthly estimate.
  const presets = useMemo(() => {
    if (!wallet) return [];
    const base = Math.max(wallet.minTopupBdt, Math.ceil(wallet.estimate.totalBdt / 100) * 100);
    const values = [wallet.minTopupBdt, base, base * 3, base * 6].filter((v) => v > 0 && (!wallet.maxTopupBdt || v <= wallet.maxTopupBdt));
    return Array.from(new Set(values)).sort((a, b) => a - b);
  }, [wallet]);

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;

  if (isError || !wallet) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return (
      <EmptyState
        title={forbidden ? 'No platform wallet for this account' : 'Failed to load wallet'}
        description={forbidden ? errorMessage(error) : errorMessage(error, 'Could not load the platform wallet.')}
        actionLabel={forbidden ? undefined : 'Retry'}
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
            Platform Wallet & Billing
          </h1>
          <p className="text-muted-foreground text-sm">
            {wallet.isPayg
              ? `Pay-As-You-Go: ৳${wallet.estimate.baseFeeBdt.toLocaleString()} base + ৳${wallet.estimate.perUserRateBdt}/customer every ${wallet.estimate.cycleDays} days.`
              : 'Prepaid balance for your platform subscription.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="border-border/70 text-xs">
            <RotateCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={openTopup} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-sm shadow-primary/20">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Top Up Wallet
          </Button>
        </div>
      </PageHero>

      <PageContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card/60 to-card/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Wallet balance</span>
              <div className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/30"><Wallet className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-foreground"><CurrencyDisplay amount={wallet.balanceBdt} /></div>
            <p className="mt-1 text-xs text-primary flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              {runwayMonths === null ? 'No monthly charge estimated' : `~${runwayMonths.toFixed(1)} cycles of runway`}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Estimated cycle charge</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20"><CreditCard className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-foreground"><CurrencyDisplay amount={wallet.estimate.totalBdt} /></div>
            <p className="mt-1 text-xs text-muted-foreground">
              {wallet.estimate.totalUsers} customers
              {wallet.estimate.addonTotalBdt > 0 ? ` · add-ons ৳${wallet.estimate.addonTotalBdt.toLocaleString()}` : ''}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Subscription valid until</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 text-xl font-bold tracking-tight text-foreground font-mono">{wallet.willExpire ? formatDate(wallet.willExpire) : '—'}</div>
            <p className="mt-1 text-xs text-amber-500/90 font-medium">
              {wallet.graceUntil ? `Grace period until ${formatDate(wallet.graceUntil)}` : wallet.isPayg ? 'Charged from the wallet each cycle' : 'Renew from Self Recharge'}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Billing plan</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ShieldCheck className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 text-xl font-bold tracking-tight text-emerald-500">{wallet.isPayg ? 'Pay-As-You-Go' : 'Fixed plan'}</div>
            {wallet.isPayg ? (
              <p className="mt-1 text-xs text-muted-foreground">Billed from this wallet</p>
            ) : (
              <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => setConfirmPayg(true)} disabled={switchPayg.isPending}>
                {switchPayg.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                Switch to Pay-As-You-Go
              </Button>
            )}
          </div>
        </div>

        {wallet.addonCatalog.length ? (
          <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-sm text-foreground flex items-center gap-2"><Puzzle className="h-4 w-4 text-primary" /> Add-ons</h2>
                <p className="text-xs text-muted-foreground">Billed with your next cycle charge</p>
              </div>
              <Button size="sm" disabled={!addonsDirty || saveAddons.isPending} onClick={() => saveAddons.mutate(chosen, { onSuccess: () => setAddons(null) })}>
                {saveAddons.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                Save add-ons
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

        <div className="rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
            <div>
              <h2 className="font-semibold text-sm text-foreground">Wallet ledger</h2>
              <p className="text-xs text-muted-foreground">Top-ups and cycle charges</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search description or reference..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background/80 border-border/70 w-48 sm:w-56"
                />
              </div>
              <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/60">
                {(['all', 'credit', 'debit'] as const).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={txFilters.type === t ? 'default' : 'ghost'}
                    onClick={() => setTxFilters((f) => ({ ...f, page: 1, type: t }))}
                    className="h-7 text-xs px-2.5"
                  >
                    {t === 'all' ? 'All' : t === 'credit' ? 'Credits' : 'Debits'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Date & time</TableHead>
                  <TableHead className="text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-xs font-semibold">Description</TableHead>
                  <TableHead className="text-xs font-semibold">Reference</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Balance after</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tx.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8"><Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" /></TableCell>
                  </TableRow>
                ) : tx.isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-destructive">
                      {errorMessage(tx.error)}{' '}
                      <button type="button" className="underline" onClick={() => tx.refetch()}>Retry</button>
                    </TableCell>
                  </TableRow>
                ) : !tx.data?.items.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">No wallet transactions yet.</TableCell>
                  </TableRow>
                ) : (
                  tx.data.items.map((t) => {
                    const isCredit = t.type === 'credit';
                    return (
                      <TableRow key={t.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(t.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[11px] font-medium capitalize px-2 py-0.5 ${isCredit ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : 'border-border/60 bg-muted/30 text-muted-foreground'}`}>
                            {isCredit ? <ArrowDownLeft className="mr-1 h-3 w-3 inline" /> : <ArrowUpRight className="mr-1 h-3 w-3 inline" />}
                            {t.type || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-foreground/90 font-medium">{t.description || '—'}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{t.reference || '—'}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold">
                          <span className={isCredit ? 'text-emerald-500' : 'text-red-400'}>
                            {isCredit ? '+' : '-'} <CurrencyDisplay amount={Math.abs(t.amountBdt)} />
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground"><CurrencyDisplay amount={t.balanceAfterBdt} /></TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {tx.data ? (
            <TablePagination
              currentPage={txFilters.page}
              pageSize={txFilters.pageSize}
              totalItems={tx.data.meta.total}
              onPageChange={(page) => setTxFilters((f) => ({ ...f, page }))}
              onPageSizeChange={(pageSize) => setTxFilters((f) => ({ ...f, page: 1, pageSize }))}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          ) : null}
        </div>
      </PageContent>

      <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/80">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground"><Wallet className="h-5 w-5 text-primary" /> Top up wallet</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              You will pay on the gateway&apos;s page; the balance is added once the gateway confirms the payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {presets.length ? (
              <div className="grid grid-cols-4 gap-2">
                {presets.map((amount) => (
                  <Button key={amount} type="button" variant={topupAmount === amount ? 'default' : 'outline'} size="sm" onClick={() => setTopupAmount(amount)} className="h-9 text-xs font-mono font-semibold">
                    ৳{amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            ) : null}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Amount (৳)</label>
              <Input
                type="number"
                value={topupAmount || ''}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                min={wallet.minTopupBdt}
                max={wallet.maxTopupBdt || undefined}
                className="bg-background/80 border-border/70 font-mono text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Between ৳{wallet.minTopupBdt.toLocaleString()} and ৳{wallet.maxTopupBdt.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-2">Payment gateway</label>
              <GatewayPicker providers={wallet.providers} value={gateway} onChange={setGateway} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setIsTopupOpen(false)} className="text-xs">Cancel</Button>
            <Button
              size="sm"
              disabled={!amountValid || !gateway || topup.isPending}
              onClick={() => topup.mutate({ amountBdt: topupAmount, method: gateway })}
              className="text-xs bg-primary hover:bg-primary/90"
            >
              {topup.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Pay ৳{(topupAmount || 0).toLocaleString()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmPayg}
        onOpenChange={setConfirmPayg}
        title="Switch to Pay-As-You-Go?"
        description={`Your platform bill becomes ৳${wallet.estimate.baseFeeBdt.toLocaleString()} + ৳${wallet.estimate.perUserRateBdt} per customer each cycle, charged from this wallet.`}
        confirmLabel="Switch"
        onConfirm={() => switchPayg.mutate()}
      />
    </div>
  );
}

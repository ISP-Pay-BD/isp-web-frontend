'use client';

import { useState } from 'react';
import { Gift, Users, Copy, History, ChevronLeft, ChevronRight, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  useCustomerSubscription,
  useRenewSubscription,
  openPaymentPage,
} from '@/features/customer/shared';
import {
  useRewardWallet,
  useReferralOverview,
  useRewardTransactions,
  useRedeemPreview,
} from '../hooks/use-customer-rewards';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
import { toast } from 'sonner';

const LEDGER_PAGE_SIZE = 10;

async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  } catch {
    toast.error(`Could not copy the ${label.toLowerCase()}`);
  }
}

export function CustomerRewardsPage() {
  const wallet = useRewardWallet();
  const referral = useReferralOverview();
  const subscription = useCustomerSubscription();
  const renew = useRenewSubscription();
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledger = useRewardTransactions({ page: ledgerPage, perPage: LEDGER_PAGE_SIZE });
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const packageId = subscription.data?.packageId ?? '';
  const preview = useRedeemPreview(packageId, redeemDialogOpen);

  if (wallet.isLoading || referral.isLoading) {
    return (
      <CustomerPageShell title="Referrals & Rewards" subtitle="Loading your reward wallet...">
        <CustomerLoadingSkeleton variant="rewards" />
      </CustomerPageShell>
    );
  }

  if (wallet.isError || referral.isError || !wallet.data || !referral.data) {
    return (
      <CustomerPageShell title="Referrals & Rewards" subtitle="Loyalty & Referral Points">
        <CustomerErrorState
          message={(wallet.error ?? referral.error)?.message || undefined}
          onRetry={() => {
            wallet.refetch();
            referral.refetch();
          }}
        />
      </CustomerPageShell>
    );
  }

  const w = wallet.data;
  const ref = referral.data;
  const ledgerPages = ledger.data?.meta.totalPages ?? 1;

  const handleRedeemRenew = () => {
    const points = preview.data?.pointsApplied ?? 0;
    if (!packageId || points <= 0) return;
    renew.mutate(
      { packageId, redeemPoints: points },
      {
        onSuccess: (checkout) => {
          setRedeemDialogOpen(false);
          if (checkout.paymentUrl) {
            toast.info('Renewal invoice created with your points — taking you to the payment page…');
            openPaymentPage(checkout.paymentUrl);
          } else {
            toast.success(checkout.message || 'Renewal invoice created with your points applied.');
          }
        },
      },
    );
  };

  return (
    <CustomerPageShell
      title="Referrals & Rewards"
      subtitle="Earn points by referring new customers and use them on your renewals."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Rewards' },
      ]}
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-6 rounded-xl border border-border/60 bg-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-primary" /> Reward points
              </span>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight tabular-nums">{w.balance.toLocaleString()}</span>
                <span className="text-sm font-medium text-muted-foreground">points available</span>
              </div>

              {w.pointValueBdt > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Worth up to{' '}
                  <strong className="text-foreground">{formatBdtWithSymbol(w.balance * w.pointValueBdt)}</strong> off a
                  renewal.
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Earned {w.lifetimeEarned.toLocaleString()} · Used {w.lifetimeUsed.toLocaleString()}
                {w.held > 0 ? ` · ${w.held.toLocaleString()} held for a pending invoice` : ''}
                {w.expiringPoints > 0 ? ` · ${w.expiringPoints.toLocaleString()} expiring within 30 days` : ''}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {w.pointValueBdt > 0 ? `1 point = ${formatBdtWithSymbol(w.pointValueBdt)}` : 'Point value not configured'}
              </span>
              <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
                <DialogTrigger
                  render={<Button disabled={w.balance <= 0 || !packageId} className="font-semibold text-xs h-9" />}
                >
                  Use on Renewal
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Use Points on Your Renewal</DialogTitle>
                    <DialogDescription>
                      Points are applied as a discount on your next renewal invoice
                      {subscription.data?.currentPackage?.name ? ` for ${subscription.data.currentPackage.name}` : ''}.
                    </DialogDescription>
                  </DialogHeader>

                  {preview.isLoading ? (
                    <div className="space-y-2 pt-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-2/3" />
                    </div>
                  ) : preview.isError || !preview.data ? (
                    <div className="pt-2 text-sm text-muted-foreground flex items-center justify-between gap-2">
                      <span>{errorMessage(preview.error, 'Could not calculate the discount.')}</span>
                      <Button size="sm" variant="outline" onClick={() => preview.refetch()}>
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="rounded-xl border bg-muted/40 p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Package price</span>
                          <span className="font-semibold">{formatBdtWithSymbol(preview.data.packagePrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Points you can use</span>
                          <span className="font-semibold">{preview.data.pointsApplied.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discount</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            −{formatBdtWithSymbol(preview.data.discountBdt)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span>You pay</span>
                          <span>{formatBdtWithSymbol(preview.data.finalPayable)}</span>
                        </div>
                      </div>
                      {preview.data.maxRedeemPercent > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Up to {preview.data.maxRedeemPercent}% of a package price can be paid with points.
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setRedeemDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          disabled={preview.data.pointsApplied <= 0 || renew.isPending}
                          onClick={handleRedeemRenew}
                          className="font-bold"
                        >
                          {renew.isPending ? 'Creating invoice…' : 'Renew with points'}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="md:col-span-6 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Your Personal Referral Code
              </CardTitle>
              <CardDescription className="text-xs">
                Share this code with friends when they take a new connection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-muted/50">
                <div className="font-mono font-bold text-lg text-primary tracking-wider px-2 flex-1">
                  {ref.code || '—'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!ref.code}
                  onClick={() => copyText(ref.code, 'Referral code')}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Code
                </Button>
              </div>
              {ref.link && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyText(ref.link, 'Referral link')}
                  className="gap-1.5 text-xs h-8 px-2"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Copy referral link
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border p-3 bg-muted/20">
                  <span className="text-muted-foreground">Verified referrals</span>
                  <div className="text-lg font-bold mt-0.5">{ref.verified}</div>
                </div>
                <div className="rounded-lg border p-3 bg-muted/20">
                  <span className="text-muted-foreground">Pending verification</span>
                  <div className="text-lg font-bold mt-0.5">{ref.pending}</div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                You have earned <strong>{ref.earnedPoints.toLocaleString()} points</strong> from {ref.total}{' '}
                {ref.total === 1 ? 'referral' : 'referrals'}.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Reward Points Ledger
              </CardTitle>
              {ledgerPages > 1 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>
                    Page {ledgerPage} of {ledgerPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    disabled={ledgerPage <= 1 || ledger.isFetching}
                    onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    disabled={ledgerPage >= ledgerPages || ledger.isFetching}
                    onClick={() => setLedgerPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {ledger.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : ledger.isError || !ledger.data ? (
              <div className="text-sm text-muted-foreground flex items-center justify-between gap-2">
                <span>{errorMessage(ledger.error, 'Could not load your points history.')}</span>
                <Button size="sm" variant="outline" onClick={() => ledger.refetch()}>
                  Retry
                </Button>
              </div>
            ) : ledger.data.items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No reward activity yet.</p>
            ) : (
              <div className="divide-y text-sm">
                {ledger.data.items.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground text-xs sm:text-sm">{tx.description || '—'}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {formatDate(tx.date)} · balance {tx.balanceAfter.toLocaleString()}
                      </div>
                    </div>

                    <div
                      className={`font-mono font-bold text-sm ${
                        tx.direction === 'credit'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {tx.direction === 'credit' ? '+' : '−'}
                      {tx.points.toLocaleString()} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerPageShell>
  );
}

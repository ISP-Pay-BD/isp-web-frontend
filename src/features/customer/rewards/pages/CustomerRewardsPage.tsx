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
import { formatBdtWithSymbol, formatDate, formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { toast } from 'sonner';

const LEDGER_PAGE_SIZE = 10;

async function copyText(value: string, copied: string, failed: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(copied);
  } catch {
    toast.error(failed);
  }
}

export function CustomerRewardsPage() {
  const t = useTranslations();
  const wallet = useRewardWallet();
  const referral = useReferralOverview();
  const subscription = useCustomerSubscription();
  const renew = useRenewSubscription();
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledger = useRewardTransactions({ page: ledgerPage, perPage: LEDGER_PAGE_SIZE });
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const packageId = subscription.data?.packageId ?? '';
  const preview = useRedeemPreview(packageId, redeemDialogOpen);

  const title = t('customer.rewards.title', 'Referrals & Rewards');

  if (wallet.isLoading || referral.isLoading) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.rewards.loading', 'Loading your reward wallet…')}>
        <CustomerLoadingSkeleton variant="rewards" />
      </CustomerPageShell>
    );
  }

  if (wallet.isError || referral.isError || !wallet.data || !referral.data) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.rewards.errorSubtitle', 'Loyalty & referral points')}>
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
            toast.info(
              t('customer.rewards.invoiceRedirect', 'Renewal invoice created with your points — taking you to the payment page…'),
            );
            openPaymentPage(checkout.paymentUrl);
          } else {
            toast.success(
              checkout.message || t('customer.rewards.invoiceCreated', 'Renewal invoice created with your points applied.'),
            );
          }
        },
      },
    );
  };

  return (
    <CustomerPageShell
      title={title}
      subtitle={t('customer.rewards.subtitle', 'Earn points by referring new customers and use them on your renewals.')}
      breadcrumbs={[
        { label: t('customer.common.crumb', 'Customer'), href: '/customer/dashboard' },
        { label: t('customer.rewards.crumb', 'Rewards') },
      ]}
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="border-border/60 bg-card flex flex-col justify-between rounded-xl border p-6 md:col-span-6">
            <div>
              <span className="text-muted-foreground flex items-center gap-1.5 text-sm font-semibold">
                <Gift className="text-primary h-4 w-4" /> {t('customer.rewards.points', 'Reward points')}
              </span>

              <div className="mt-4 flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight tabular-nums">{formatCount(w.balance)}</span>
                <span className="text-muted-foreground text-sm font-medium">{t('customer.rewards.available', 'points available')}</span>
              </div>

              {w.pointValueBdt > 0 && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('customer.rewards.worth', 'Worth up to {amount} off a renewal.', {
                    amount: formatBdtWithSymbol(w.balance * w.pointValueBdt),
                  })}
                </p>
              )}
              <p className="text-muted-foreground mt-2 text-sm">
                {t('customer.rewards.earnedUsed', 'Earned {earned} · Used {used}', {
                  earned: formatCount(w.lifetimeEarned),
                  used: formatCount(w.lifetimeUsed),
                })}
                {w.held > 0
                  ? ` · ${t('customer.rewards.held', '{n} held for a pending invoice', { n: formatCount(w.held) })}`
                  : ''}
                {w.expiringPoints > 0
                  ? ` · ${t('customer.rewards.expiring', '{n} expiring within 30 days', { n: formatCount(w.expiringPoints) })}`
                  : ''}
              </p>
            </div>

            <div className="border-border/60 mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground text-sm">
                {w.pointValueBdt > 0
                  ? t('customer.rewards.pointValue', '1 point = {amount}', { amount: formatBdtWithSymbol(w.pointValueBdt) })
                  : t('customer.rewards.pointValueNone', 'Point value not configured')}
              </span>
              <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
                <DialogTrigger
                  render={<Button disabled={w.balance <= 0 || !packageId} className="h-11 w-full font-semibold sm:w-auto" />}
                >
                  {t('customer.rewards.useOnRenewal', 'Use on renewal')}
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('customer.rewards.dialogTitle', 'Use points on your renewal')}</DialogTitle>
                    <DialogDescription className="text-sm">
                      {subscription.data?.currentPackage?.name
                        ? t(
                            'customer.rewards.dialogHintNamed',
                            'Points are applied as a discount on your next renewal invoice for {name}.',
                            { name: subscription.data.currentPackage.name },
                          )
                        : t('customer.rewards.dialogHint', 'Points are applied as a discount on your next renewal invoice.')}
                    </DialogDescription>
                  </DialogHeader>

                  {preview.isLoading ? (
                    <div className="space-y-2 pt-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-2/3" />
                    </div>
                  ) : preview.isError || !preview.data ? (
                    <div className="text-muted-foreground flex flex-col gap-3 pt-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <span>{errorMessage(preview.error, t('customer.rewards.previewFailed', 'Could not calculate the discount.'))}</span>
                      <Button variant="outline" className="h-11" onClick={() => preview.refetch()}>
                        {t('customer.common.retry', 'Retry')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="bg-muted/40 space-y-2 rounded-xl border p-4 text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">{t('customer.rewards.packagePrice', 'Package price')}</span>
                          <span className="font-semibold">{formatBdtWithSymbol(preview.data.packagePrice)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">{t('customer.rewards.pointsUsable', 'Points you can use')}</span>
                          <span className="font-semibold">{formatCount(preview.data.pointsApplied)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">{t('customer.rewards.discount', 'Discount')}</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            −{formatBdtWithSymbol(preview.data.discountBdt)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3 border-t pt-2 font-bold">
                          <span>{t('customer.rewards.youPay', 'You pay')}</span>
                          <span>{formatBdtWithSymbol(preview.data.finalPayable)}</span>
                        </div>
                      </div>
                      {preview.data.maxRedeemPercent > 0 && (
                        <p className="text-muted-foreground text-sm">
                          {t('customer.rewards.maxPercent', 'Up to {percent}% of a package price can be paid with points.', {
                            percent: formatCount(preview.data.maxRedeemPercent),
                          })}
                        </p>
                      )}
                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button variant="ghost" className="h-11 w-full sm:w-auto" onClick={() => setRedeemDialogOpen(false)}>
                          {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                          disabled={preview.data.pointsApplied <= 0 || renew.isPending}
                          onClick={handleRedeemRenew}
                          className="h-11 w-full font-bold sm:w-auto"
                        >
                          {renew.isPending
                            ? t('customer.rewards.creating', 'Creating invoice…')
                            : t('customer.rewards.renewWithPoints', 'Renew with points')}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="flex flex-col justify-between md:col-span-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Users className="text-primary h-4 w-4" />
                {t('customer.rewards.codeTitle', 'Your personal referral code')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('customer.rewards.codeHint', 'Share this code with friends when they take a new connection.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 flex flex-col gap-2 rounded-xl border p-2.5 sm:flex-row sm:items-center">
                <div className="text-primary flex-1 px-2 font-mono text-lg font-bold tracking-wider break-all">{ref.code || '—'}</div>
                <Button
                  variant="outline"
                  disabled={!ref.code}
                  onClick={() =>
                    copyText(
                      ref.code,
                      t('customer.rewards.codeCopied', 'Referral code copied to clipboard'),
                      t('customer.rewards.codeCopyFailed', 'Could not copy the referral code'),
                    )
                  }
                  className="h-11 w-full gap-1.5 font-semibold sm:w-auto"
                >
                  <Copy className="h-4 w-4" />
                  {t('customer.rewards.copyCode', 'Copy code')}
                </Button>
              </div>
              {ref.link && (
                <Button
                  variant="ghost"
                  onClick={() =>
                    copyText(
                      ref.link,
                      t('customer.rewards.linkCopied', 'Referral link copied to clipboard'),
                      t('customer.rewards.linkCopyFailed', 'Could not copy the referral link'),
                    )
                  }
                  className="h-11 gap-1.5 px-3"
                >
                  <Link2 className="h-4 w-4" />
                  {t('customer.rewards.copyLink', 'Copy referral link')}
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/20 rounded-lg border p-3">
                  <span className="text-muted-foreground">{t('customer.rewards.verified', 'Verified referrals')}</span>
                  <div className="mt-0.5 text-lg font-bold">{formatCount(ref.verified)}</div>
                </div>
                <div className="bg-muted/20 rounded-lg border p-3">
                  <span className="text-muted-foreground">{t('customer.rewards.pendingVerification', 'Pending verification')}</span>
                  <div className="mt-0.5 text-lg font-bold">{formatCount(ref.pending)}</div>
                </div>
              </div>

              <p className="text-muted-foreground text-sm">
                {ref.total === 1
                  ? t('customer.rewards.earnedFromOne', 'You have earned {points} points from 1 referral.', {
                      points: formatCount(ref.earnedPoints),
                    })
                  : t('customer.rewards.earnedFromMany', 'You have earned {points} points from {n} referrals.', {
                      points: formatCount(ref.earnedPoints),
                      n: formatCount(ref.total),
                    })}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <History className="text-primary h-4 w-4" />
                {t('customer.rewards.ledger', 'Reward points ledger')}
              </CardTitle>
              {ledgerPages > 1 && (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span>{t('customer.common.pageOf', 'Page {page} of {total}', { page: formatCount(ledgerPage), total: formatCount(ledgerPages) })}</span>
                  <Button
                    variant="outline"
                    className="h-11 w-11 p-0"
                    aria-label={t('customer.common.previousPage', 'Previous page')}
                    disabled={ledgerPage <= 1 || ledger.isFetching}
                    onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 w-11 p-0"
                    aria-label={t('customer.common.nextPage', 'Next page')}
                    disabled={ledgerPage >= ledgerPages || ledger.isFetching}
                    onClick={() => setLedgerPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
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
              <div className="text-muted-foreground flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span>{errorMessage(ledger.error, t('customer.rewards.ledgerFailed', 'Could not load your points history.'))}</span>
                <Button variant="outline" className="h-11" onClick={() => ledger.refetch()}>
                  {t('customer.common.retry', 'Retry')}
                </Button>
              </div>
            ) : ledger.data.items.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">{t('customer.rewards.ledgerEmpty', 'No reward activity yet.')}</p>
            ) : (
              <div className="divide-y text-sm">
                {ledger.data.items.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-foreground text-sm font-semibold">{tx.description || '—'}</div>
                      <div className="text-muted-foreground font-mono text-sm">
                        {t('customer.rewards.balanceAfter', '{date} · balance {n}', {
                          date: formatDate(tx.date),
                          n: formatCount(tx.balanceAfter),
                        })}
                      </div>
                    </div>

                    <div
                      className={`shrink-0 font-mono text-sm font-bold ${
                        tx.direction === 'credit'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {t('customer.rewards.pointsDelta', '{sign}{n} pts', {
                        sign: tx.direction === 'credit' ? '+' : '−',
                        n: formatCount(tx.points),
                      })}
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

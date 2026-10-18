'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Zap, Shield, CheckCircle2, Users, Receipt, Loader2, RefreshCw, Info } from 'lucide-react';
import { useAdminSubscription, useSelfRecharge } from '../hooks/use-admin-subscription';
import { useCheckoutStatus, gatewayLabel } from '@/features/admin/payment/hooks/use-platform-checkout';
import { GatewayPicker } from '@/features/admin/payment/components/GatewayPicker';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDateTime, formatBdtWithSymbol, formatCount } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';

function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso.replace(' ', 'T')).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86_400_000);
}

export function SelfRechargePage() {
  const t = useTranslations();
  const { data, isLoading, isError, error, refetch } = useAdminSubscription();
  const recharge = useSelfRecharge();
  const statusCheck = useCheckoutStatus();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [gateway, setGateway] = useState('');

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return (
      <EmptyState variant="error"
        title={t('admin.subscription.selfRecharge.loadFailed', 'Failed to load subscription')}
        description={errorMessage(error, t('admin.subscription.selfRecharge.loadFailedHint', 'Could not load your platform subscription.'))}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const rechargeable = data.plans.filter((p) => p.selfRechargeable);
  const planId = selectedPlanId || (rechargeable.find((p) => p.isCurrent)?.id ?? rechargeable[0]?.id ?? '');
  const plan = data.plans.find((p) => p.id === planId);
  const method = gateway || data.providers[0] || '';
  const left = daysLeft(data.willExpire);
  const quota = data.quota;

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.subscription.selfRecharge.title', 'Self Recharge & Plan')}
        subtitle={t('admin.subscription.selfRecharge.subtitle', 'Renew or change your platform plan and review its payments')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.self_recharge', 'Self Recharge') },
        ]}
        actions={
          <Button size="sm" variant="outline" className="text-xs" render={<Link href="/admin/payment" />}>
              <Receipt className="mr-1.5 h-3.5 w-3.5 text-primary" /> {t('admin.subscription.selfRecharge.paymentHistory', 'Payment History')}
            </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7">
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 h-full">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-wide text-primary flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" /> {t('admin.subscription.selfRecharge.currentPlan', 'Current plan')}
                    </span>
                    {data.tenantName ? (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">{data.tenantName}</Badge>
                    ) : null}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2">{data.planName ?? t('admin.subscription.selfRecharge.noPlan', 'No plan assigned')}</h2>
                  {data.planPriceBdt !== null ? (
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-bold font-mono">{formatBdtWithSymbol(data.planPriceBdt)}</span>
                      <span className="text-xs font-normal text-muted-foreground">{t('admin.subscription.selfRecharge.perRenewal', 'per renewal')}</span>
                    </div>
                  ) : null}
                </div>
                {data.subscriptionStatus ? <StatusBadge status={data.subscriptionStatus} /> : null}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border/60 text-xs">
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-foreground">{t('admin.subscription.selfRecharge.validUntil', 'Valid until')}</span>
                  <div className="font-medium">{data.willExpire ? formatDate(data.willExpire) : '—'}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-foreground">{t('admin.subscription.selfRecharge.lastRenewed', 'Last renewed')}</span>
                  <div className="font-medium">{data.lastRenewed ? formatDate(data.lastRenewed) : '—'}</div>
                </div>
                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-xs text-muted-foreground">{t('admin.subscription.selfRecharge.billing', 'Billing')}</span>
                  <div className="font-medium capitalize">{data.planType === 'payg'
                      ? t('admin.subscription.selfRecharge.payg', 'Pay-As-You-Go (wallet)')
                      : data.billingType
                        ? t(`admin.subscription.selfRecharge.billingType.${data.billingType.toLowerCase().replace(/[^a-z]+/g, '_')}`, data.billingType)
                        : '—'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>{t('admin.subscription.selfRecharge.capacity', 'Customer capacity')}</span>
                {left !== null ? (
                  <Badge variant="secondary" tone={left < 0 ? 'danger' : undefined} className={cn('text-xs font-semibold', left >= 0 && 'bg-primary/10 text-primary')}>
                    {left < 0
                      ? t('admin.subscription.selfRecharge.expiredAgo', 'Expired {n} days ago', { n: formatCount(Math.abs(left)) })
                      : t('admin.subscription.selfRecharge.daysLeft', '{n} days left', { n: formatCount(left) })}
                  </Badge>
                ) : null}
              </CardTitle>
              <CardDescription className="text-xs">{t('admin.subscription.selfRecharge.capacityHint', 'Customers counted against your plan')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              {quota ? (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary" /> {t('admin.subscription.selfRecharge.customers', 'Customers')}
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {formatCount(quota.used)} / {quota.isUnlimited ? '∞' : formatCount(quota.limit)}
                      {quota.isUnlimited ? '' : ` (${formatCount(quota.percent)}%)`}
                    </span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
                    <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${quota.isUnlimited ? 0 : Math.min(100, quota.percent)}%` }} />
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">{t('admin.subscription.selfRecharge.noQuota', 'Capacity is not tracked for this account.')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {!data.canRecharge ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <Info className="h-3.5 w-3.5" /> {t('admin.subscription.selfRecharge.adminOnly', 'Only the ISP admin account can pay for the platform plan.')}
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10"><Zap className="h-4 w-4 text-primary" /></span>
            {t('admin.subscription.selfRecharge.choosePlan', 'Choose a plan')}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">{t('admin.subscription.selfRecharge.choosePlanHint', 'Renew your current plan or move to another one')}</p>
        </div>

        {data.plans.length === 0 ? (
          <EmptyState title={t('admin.subscription.selfRecharge.noPlans', 'No plans available')} description={t('admin.subscription.selfRecharge.noPlansHint', 'The platform has not published any plans yet.')} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {data.plans.map((p) => {
              const isSelected = planId === p.id;
              const disabled = !p.selfRechargeable;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={cn(
                    'rounded-2xl border p-5 flex flex-col justify-between text-left transition-colors duration-200',
                    isSelected ? 'border-primary bg-primary/[0.03] ring-2 ring-primary/25 shadow-md' : 'border-border/60 bg-card hover:border-primary/30 ring-1 ring-border/60',
                    disabled && 'opacity-60 cursor-not-allowed',
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-base text-foreground">{p.name}</span>
                      {p.isCurrent ? <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 font-semibold">{t('admin.subscription.selfRecharge.current', 'Current')}</Badge> : null}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.isUnlimited
                        ? t('admin.subscription.selfRecharge.unlimitedCustomers', 'Unlimited customers')
                        : t('admin.subscription.selfRecharge.upToCustomers', 'Up to {n} customers', { n: formatCount(p.maxCustomers ?? 0) })}
                    </div>
                    <div className="mt-4 pb-4 border-b border-border/50">
                      {p.planType === 'payg' ? (
                        <div className="text-sm font-semibold text-foreground">
                          {t('admin.subscription.selfRecharge.paygPrice', '{base} + ৳{rate}/customer', { base: formatBdtWithSymbol(p.baseFeeBdt ?? 0), rate: formatCount(p.perUserRateBdt ?? 0) })}
                          <div className="text-xs font-normal text-muted-foreground">{t('admin.subscription.selfRecharge.paygHint', 'Activated from the wallet')}</div>
                        </div>
                      ) : (
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">{formatBdtWithSymbol(p.priceBdt)}</span>
                      )}
                    </div>
                    {p.features.length ? (
                      <ul className="mt-4 space-y-2.5 text-xs">
                        {p.features.map((feat) => (
                          <li key={feat} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="text-foreground font-medium">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  {p.planType === 'payg' ? (
                    <Link href="/admin/wallet" className="mt-4 text-xs text-primary hover:underline">{t('admin.subscription.selfRecharge.openWallet', 'Open wallet →')}</Link>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {rechargeable.length ? (
        <div className="space-y-4 pt-2">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10"><CreditCard className="h-4 w-4 text-primary" /></span>
              {t('admin.subscription.selfRecharge.gateway', 'Payment gateway')}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{t('admin.subscription.selfRecharge.gatewayHint', "You pay on the gateway's page; gateway charges may apply.")}</p>
          </div>
          <GatewayPicker providers={data.providers} value={method} onChange={setGateway} />

          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60">
            <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground tracking-wide">{t('admin.subscription.selfRecharge.orderSummary', 'Order summary')}</div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-bold text-lg text-foreground">{plan?.name ?? t('admin.subscription.selfRecharge.selectPlan', 'Select a plan')}</span>
                  {method ? <span className="text-xs text-muted-foreground">{t('admin.subscription.selfRecharge.via', 'via {gateway}', { gateway: gatewayLabel(method) })}</span> : null}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  {t('admin.subscription.selfRecharge.renewsAfter', 'Your plan renews after the gateway confirms the payment.')}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-muted-foreground">{t('admin.subscription.selfRecharge.planPrice', 'Plan price')}</div>
                  <div className="text-2xl font-bold font-mono text-foreground">
                    <CurrencyDisplay amount={plan?.selfRechargeable ? plan.priceBdt : 0} />
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => plan && method && recharge.mutate({ planId: plan.id, method })}
                  disabled={!data.canRecharge || !plan?.selfRechargeable || !method || recharge.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-6 h-10"
                >
                  {recharge.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                  {recharge.isPending ? t('admin.subscription.selfRecharge.starting', 'Starting checkout…') : t('admin.subscription.selfRecharge.payRenew', 'Pay & renew')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('admin.subscription.selfRecharge.recentTitle', 'Recent platform payments')}</CardTitle>
          <CardDescription className="text-xs">{t('admin.subscription.selfRecharge.recentHint', 'A checkout shows as pending until the gateway confirms it.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.recentPayments.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">{t('admin.subscription.selfRecharge.noPayments', 'No platform payments yet.')}</p>
          ) : (
            data.recentPayments.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 p-3 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">
                    {p.description || (p.purpose === 'wallet_topup' ? t('admin.subscription.selfRecharge.walletTopup', 'Wallet top-up') : t('admin.subscription.selfRecharge.platformPayment', 'Platform payment'))}
                  </div>
                  <div className="text-muted-foreground font-mono">
                    {p.invoiceNo} · {formatDateTime(p.paidAt ?? p.createdAt ?? '')}
                    {p.gateway ? ` · ${gatewayLabel(p.gateway)}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CurrencyDisplay amount={p.amountBdt} className="font-semibold" />
                  <StatusBadge status={['successful', 'success', 'completed', 'paid'].includes(p.status) ? 'paid' : p.status} />
                  {p.status === 'pending' && p.gateway && p.gatewayRef ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={statusCheck.isPending}
                      onClick={() => statusCheck.mutate({ gateway: p.gateway!, reference: p.gatewayRef! })}
                    >
                      <RefreshCw className={cn('mr-1 h-3 w-3', statusCheck.isPending && 'animate-spin')} /> {t('admin.subscription.selfRecharge.checkStatus', 'Check status')}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

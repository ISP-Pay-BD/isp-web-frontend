'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CreditCard, Zap, RefreshCw, Network, Cpu, Lock, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  CustomerEmptyState,
  useCustomerDashboard,
  statusLabel,
} from '@/features/customer/shared';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toneClasses } from '@/components/shared/status-tones';
import { useCustomerSubscription, useRenewSubscription, openPaymentPage } from '../hooks/use-customer-subscription';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function CustomerSubscriptionPage() {
  const t = useTranslations();
  const { data, isLoading, isError, error, refetch } = useCustomerSubscription();
  const dashboard = useCustomerDashboard();
  const renewMutation = useRenewSubscription();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  const title = t('customer.subscription.title', 'My Subscription');
  const customerCrumb = { label: t('customer.common.crumb', 'Customer'), href: '/customer/dashboard' };

  if (isLoading) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.subscription.loading', 'Loading current package details…')}>
        <CustomerLoadingSkeleton variant="subscription" />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.subscription.errorSubtitle', 'Broadband plan management')}>
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { account, currentPackage, pendingPackage, packages, isActive } = data;
  const routerInfo = dashboard.data?.router ?? null;

  /** Renew creates a pending invoice; only the payment page settles it. */
  const handleRenew = (packageId: string) => {
    renewMutation.mutate(
      { packageId },
      {
        onSuccess: (checkout) => {
          setUpgradeDialogOpen(false);
          if (checkout.paymentUrl) {
            toast.info(t('customer.subscription.invoiceRedirect', 'Invoice created — taking you to the payment page…'));
            openPaymentPage(checkout.paymentUrl);
          } else {
            toast.success(
              checkout.message || t('customer.subscription.invoiceCreated', 'Invoice created. You can pay it from Payments.'),
            );
          }
        },
      },
    );
  };

  const summary = [
    { label: t('customer.subscription.speed', 'Speed'), value: currentPackage?.bandwidth || '—' },
    { label: t('customer.subscription.monthly', 'Monthly fee'), value: currentPackage ? formatBdtWithSymbol(currentPackage.priceBdt) : '—' },
    { label: t('customer.subscription.lastRenewed', 'Last renewed'), value: formatDate(data.lastRenewed) },
    { label: t('customer.subscription.validUntil', 'Valid until'), value: formatDate(data.willExpire) },
  ];

  return (
    <CustomerPageShell
      title={title}
      subtitle={t('customer.subscription.subtitle', 'View your internet package, validity and renewal options.')}
      breadcrumbs={[customerCrumb, { label: title }]}
      actions={
        <Button className="h-11 w-full gap-2 font-semibold sm:w-auto" render={<Link href="/customer/payments/pay" />}>
          <CreditCard className="h-4 w-4" />
          {currentPackage
            ? t('customer.subscription.payAmount', 'Pay bill {amount}', { amount: formatBdtWithSymbol(currentPackage.priceBdt) })
            : t('customer.subscription.payBill', 'Pay bill')}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-card rounded-2xl border p-5 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-6 border-b pb-6 md:flex-row md:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-bold tracking-tight">
                  {currentPackage?.name || t('customer.subscription.noPackage', 'No package assigned')}
                </h2>
                <StatusBadge
                  status={isActive ? 'active' : data.subscriptionStatus}
                  label={
                    isActive
                      ? t('customer.subscription.activeSub', 'Active subscription')
                      : statusLabel(t, data.subscriptionStatus)
                  }
                />
              </div>
              <p className="text-muted-foreground mt-1.5 font-mono text-sm">
                {t('customer.subscription.customerId', 'Customer ID: {id}', { id: account.id || '—' })}
              </p>
              {pendingPackage && (
                <p className={cn('mt-3 rounded-lg border px-3 py-2 text-sm', toneClasses.warning)}>
                  {t('customer.subscription.pendingChange', 'Pending change to {name} — it activates once its invoice is paid.', {
                    name: pendingPackage.name,
                  })}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" className="h-11 w-full gap-2 sm:w-auto" disabled={packages.length === 0}>
                      <Zap className="text-primary h-4 w-4" />
                      {t('customer.subscription.changePackage', 'Change package')}
                    </Button>
                  }
                />
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('customer.subscription.selectPackage', 'Select a package')}</DialogTitle>
                    <DialogDescription className="text-sm">
                      {t(
                        'customer.subscription.switchHint',
                        'Switching creates an invoice for the new package. Your current package stays active until it is paid.',
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-3 pt-2">
                    {packages.map((pkg) => {
                      const isCurrent = pkg.id === data.packageId;
                      const isSelected = selectedPackageId === pkg.id || (isCurrent && !selectedPackageId);
                      return (
                        <button
                          type="button"
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          aria-pressed={isSelected}
                          className={cn(
                            'flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors duration-200 ease-out',
                            isSelected ? 'border-primary bg-primary/5 ring-primary ring-1' : 'hover:border-muted-foreground/40',
                          )}
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-bold">
                                {pkg.name || t('customer.subscription.packageNo', 'Package #{id}', { id: pkg.id })}
                              </span>
                              {isCurrent && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('customer.subscription.current', 'Current')}
                                </Badge>
                              )}
                            </div>
                            {pkg.bandwidth && <div className="text-muted-foreground text-sm">{pkg.bandwidth}</div>}
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-primary text-lg font-bold">{formatBdtWithSymbol(pkg.priceBdt)}</div>
                            <span className="text-muted-foreground text-sm">{t('customer.subscription.perMonth', '/ month')}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                    <Button variant="ghost" className="h-11 w-full sm:w-auto" onClick={() => setUpgradeDialogOpen(false)}>
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                      disabled={renewMutation.isPending || !selectedPackageId || selectedPackageId === data.packageId}
                      onClick={() => selectedPackageId && handleRenew(selectedPackageId)}
                      className="h-11 w-full gap-2 font-bold sm:w-auto"
                    >
                      <RefreshCw className={`h-4 w-4 ${renewMutation.isPending ? 'animate-spin' : ''}`} />
                      {t('customer.subscription.switchPay', 'Switch & Pay')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={() => handleRenew(data.packageId)}
                disabled={renewMutation.isPending || !data.packageId}
                className="h-11 w-full gap-2 font-bold shadow-md sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 ${renewMutation.isPending ? 'animate-spin' : ''}`} />
                {t('customer.subscription.renewPlan', 'Renew plan')}
              </Button>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
            {summary.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="text-muted-foreground text-sm">{item.label}</dt>
                <dd className="text-foreground mt-0.5 text-base font-semibold tabular-nums">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="bg-muted/50 text-muted-foreground mt-8 flex items-start gap-2.5 rounded-xl border p-4 text-sm leading-relaxed">
            <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {t(
                'customer.subscription.renewNote',
                'Renewing or switching creates an invoice and takes you to your provider’s payment page. Your validity is extended only after that payment is confirmed.',
              )}
            </span>
          </div>
        </div>

        {packages.length === 0 && (
          <CustomerEmptyState
            title={t('customer.subscription.noPackages', 'No packages available')}
            description={t('customer.subscription.noPackagesHint', 'Your provider has not published any packages for your account yet.')}
          />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Lock className="text-primary h-4 w-4" />
                {t('customer.subscription.connection', 'Connection')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('customer.subscription.connectionHint', 'Your broadband login and line state')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted/30 flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <div className="text-muted-foreground text-sm">{t('customer.subscription.pppoeUser', 'PPPoE username')}</div>
                  <div className="mt-0.5 truncate font-mono text-sm font-bold">
                    {dashboard.isLoading ? '…' : dashboard.data?.pppoeUsername || '—'}
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  PPPoE
                </Badge>
              </div>

              <div className="bg-muted/30 flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <div className="text-muted-foreground text-sm">{t('customer.subscription.lineStatus', 'Line status')}</div>
                  <div className="mt-0.5 text-sm font-bold">{statusLabel(t, account.connStatus)}</div>
                </div>
                <StatusBadge status={account.accountStatus} label={statusLabel(t, account.accountStatus)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Cpu className="text-primary h-4 w-4" />
                {t('customer.subscription.networkRouter', 'Network router')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('customer.subscription.networkRouterHint', 'The provider router your connection is served from')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/20 space-y-2 rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground text-sm font-semibold">{t('customer.subscription.router', 'Router')}</span>
                  <span className="text-sm font-bold">{dashboard.isLoading ? '…' : routerInfo?.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground text-sm font-semibold">{t('customer.subscription.routerStatus', 'Status')}</span>
                  <span className="text-sm">{dashboard.isLoading ? '…' : statusLabel(t, routerInfo?.status ?? '')}</span>
                </div>
              </div>

              <Button variant="outline" className="h-11 w-full gap-2" render={<Link href="/customer/router" />}>
                <Network className="h-4 w-4" />
                {t('customer.subscription.openRouter', 'Open router tools')}
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerPageShell>
  );
}

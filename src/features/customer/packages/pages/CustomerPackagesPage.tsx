'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Zap, CreditCard, ArrowRight, HelpCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  CustomerEmptyState,
  openPaymentPage,
} from '@/features/customer/shared';
import { useCustomerPackages, useActivatePackage } from '../hooks/use-customer-packages';
import type { CustomerPackage } from '@/lib/api/adapters/customer.adapter';
import { formatBdtWithSymbol } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function CustomerPackagesPage() {
  const t = useTranslations();
  const { data, isLoading, isError, error, refetch } = useCustomerPackages();
  const activateMutation = useActivatePackage();
  const [selectedPkg, setSelectedPkg] = useState<CustomerPackage | null>(null);

  const title = t('customer.packages.title', 'Internet Packages');

  if (isLoading) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.packages.loading', 'Loading available broadband plans…')}>
        <CustomerLoadingSkeleton variant="packages" />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.packages.errorSubtitle', 'Broadband speed upgrades')}>
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { packages, packageId: currentPackageId, pendingPackageId } = data;

  const handleConfirm = () => {
    if (!selectedPkg) return;
    activateMutation.mutate(selectedPkg.id, {
      onSuccess: (checkout) => {
        setSelectedPkg(null);
        if (checkout.paymentUrl) {
          toast.info(t('customer.packages.invoiceRedirect', 'Invoice created — taking you to the payment page…'));
          openPaymentPage(checkout.paymentUrl);
        } else {
          toast.success(
            checkout.message || t('customer.packages.changeRequested', 'Package change requested. Pay the invoice to activate it.'),
          );
        }
      },
    });
  };

  return (
    <CustomerPageShell
      title={title}
      subtitle={t('customer.packages.subtitle', 'Packages your provider offers on your connection.')}
      breadcrumbs={[
        { label: t('customer.common.crumb', 'Customer'), href: '/customer/dashboard' },
        { label: t('customer.packages.crumb', 'Packages') },
      ]}
      actions={
        <Button variant="outline" className="h-11 w-full gap-2 sm:w-auto" render={<Link href="/customer/support/new" />}>
          <HelpCircle className="h-4 w-4" />
          {t('customer.packages.inquiry', 'Custom / corporate inquiry')}
        </Button>
      }
    >
      <div className="space-y-8">
        {packages.length === 0 ? (
          <CustomerEmptyState
            icon={<Package className="text-muted-foreground h-5 w-5" />}
            title={t('customer.packages.empty', 'No packages available')}
            description={t('customer.packages.emptyHint', 'Your provider has not published any packages for your account yet.')}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => {
              const isCurrent = pkg.id === currentPackageId;
              const isPending = pkg.id === pendingPackageId;

              return (
                <Card
                  key={pkg.id}
                  className={cn(
                    'relative flex flex-col justify-between transition-shadow duration-200 ease-out hover:shadow-lg',
                    isCurrent && 'border-primary ring-primary/30 bg-primary/[0.02] ring-2',
                  )}
                >
                  {(isCurrent || isPending) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="secondary" className="px-3 py-0.5 text-xs font-medium shadow-[var(--shadow-xs)]">
                        {isCurrent
                          ? t('customer.packages.currentPlan', 'Current plan')
                          : t('customer.packages.pendingPayment', 'Pending payment')}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pt-6">
                    <CardTitle className="text-xl font-bold">
                      {pkg.name || t('customer.packages.packageNo', 'Package #{id}', { id: pkg.id })}
                    </CardTitle>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-foreground text-3xl font-bold tracking-tight">{formatBdtWithSymbol(pkg.priceBdt)}</span>
                      <span className="text-muted-foreground text-sm">{t('customer.packages.perMonth', '/ month')}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="bg-muted/60 flex items-center justify-between gap-3 rounded-xl p-3">
                      <span className="text-muted-foreground text-sm font-medium">{t('customer.packages.speed', 'Internet speed')}</span>
                      <span className="text-primary flex items-center gap-1 text-base font-bold">
                        <Zap className="h-4 w-4" />
                        {pkg.bandwidth || '—'}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    {isCurrent ? (
                      <Button variant="outline" className="h-11 w-full font-bold" render={<Link href="/customer/subscription" />}>
                        {t('customer.packages.activeSub', 'Active subscription')}
                      </Button>
                    ) : (
                      <Button onClick={() => setSelectedPkg(pkg)} className="h-11 w-full gap-2 font-bold" variant="outline">
                        <Zap className="h-4 w-4" />
                        {t('customer.packages.switchTo', 'Switch to this plan')}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!selectedPkg} onOpenChange={(open) => !open && setSelectedPkg(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('customer.packages.confirmTitle', 'Confirm package change')}</DialogTitle>
              <DialogDescription className="text-sm">
                {selectedPkg?.name
                  ? t('customer.packages.confirmNamed', 'You are about to request a switch to {name}.', { name: selectedPkg.name })
                  : t('customer.packages.confirmThis', 'You are about to request a switch to this package.')}
              </DialogDescription>
            </DialogHeader>

            {selectedPkg && (
              <div className="space-y-4 py-2">
                <div className="bg-muted/40 space-y-2.5 rounded-xl border p-4">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{t('customer.packages.selected', 'Selected package')}</span>
                    <span className="text-right font-bold">{selectedPkg.name || `#${selectedPkg.id}`}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{t('customer.packages.speedShort', 'Speed')}</span>
                    <span className="text-primary font-bold">{selectedPkg.bandwidth || '—'}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{t('customer.packages.monthlyPrice', 'Monthly price')}</span>
                    <span className="font-bold">{formatBdtWithSymbol(selectedPkg.priceBdt)}</span>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(
                    'customer.packages.confirmNote',
                    'An invoice is created for the change. Your current package stays active until that invoice is paid.',
                  )}
                </p>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Button variant="ghost" className="h-11 w-full sm:w-auto" onClick={() => setSelectedPkg(null)}>
                    {t('common.cancel', 'Cancel')}
                  </Button>
                  <Button onClick={handleConfirm} disabled={activateMutation.isPending} className="h-11 w-full gap-2 font-bold sm:w-auto">
                    <CreditCard className={cn('h-4 w-4', activateMutation.isPending && 'animate-pulse')} />
                    {activateMutation.isPending
                      ? t('customer.packages.requesting', 'Requesting…')
                      : t('customer.packages.proceed', 'Proceed to pay & switch')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CustomerPageShell>
  );
}

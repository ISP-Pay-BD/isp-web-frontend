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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function CustomerPackagesPage() {
  const { data, isLoading, isError, error, refetch } = useCustomerPackages();
  const activateMutation = useActivatePackage();
  const [selectedPkg, setSelectedPkg] = useState<CustomerPackage | null>(null);

  if (isLoading) {
    return (
      <CustomerPageShell title="Internet Packages" subtitle="Loading available broadband plans...">
        <CustomerLoadingSkeleton variant="packages" />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="Internet Packages" subtitle="Broadband speed upgrades">
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
          toast.info('Invoice created — taking you to the payment page…');
          openPaymentPage(checkout.paymentUrl);
        } else {
          toast.success(checkout.message || 'Package change requested. Pay the invoice to activate it.');
        }
      },
    });
  };

  return (
    <CustomerPageShell
      title="Internet Packages"
      subtitle="Packages your provider offers on your connection."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Packages' },
      ]}
      actions={
        <Link href="/customer/support/new">
          <Button variant="outline" className="gap-2 text-xs">
            <HelpCircle className="h-4 w-4" />
            Custom / Corporate Inquiry
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {packages.length === 0 ? (
          <CustomerEmptyState
            icon={<Package className="text-muted-foreground h-5 w-5" />}
            title="No packages available"
            description="Your provider has not published any packages for your account yet."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => {
              const isCurrent = pkg.id === currentPackageId;
              const isPending = pkg.id === pendingPackageId;

              return (
                <Card
                  key={pkg.id}
                  className={`relative flex flex-col justify-between transition-all hover:shadow-lg ${
                    isCurrent ? 'border-primary ring-2 ring-primary/30 bg-primary/[0.02]' : ''
                  }`}
                >
                  {(isCurrent || isPending) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="secondary" className="px-3 py-0.5 text-xs font-medium shadow-[var(--shadow-xs)]">
                        {isCurrent ? 'Current plan' : 'Pending payment'}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pt-6">
                    <CardTitle className="text-xl font-bold">{pkg.name || `Package #${pkg.id}`}</CardTitle>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight text-foreground">
                        {formatBdtWithSymbol(pkg.priceBdt)}
                      </span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="rounded-xl bg-muted/60 p-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Internet Speed</span>
                      <span className="text-base font-bold flex items-center gap-1 text-primary">
                        <Zap className="h-4 w-4" />
                        {pkg.bandwidth || '—'}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    {isCurrent ? (
                      <Link href="/customer/subscription" className="w-full">
                        <Button variant="outline" className="w-full font-bold">
                          Active Subscription
                        </Button>
                      </Link>
                    ) : (
                      <Button onClick={() => setSelectedPkg(pkg)} className="w-full font-bold gap-2" variant="outline">
                        <Zap className="h-4 w-4" />
                        Switch to this Plan
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!selectedPkg} onOpenChange={(open) => !open && setSelectedPkg(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Package Change</DialogTitle>
              <DialogDescription>
                You are about to request a switch to {selectedPkg?.name || 'this package'}.
              </DialogDescription>
            </DialogHeader>

            {selectedPkg && (
              <div className="space-y-4 py-2">
                <div className="rounded-xl border bg-muted/40 p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Selected Package</span>
                    <span className="font-bold">{selectedPkg.name || `#${selectedPkg.id}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Speed</span>
                    <span className="font-bold text-primary">{selectedPkg.bandwidth || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly price</span>
                    <span className="font-bold">{formatBdtWithSymbol(selectedPkg.priceBdt)}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  An invoice is created for the change. Your current package stays active until that invoice is paid.
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setSelectedPkg(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirm} disabled={activateMutation.isPending} className="gap-2 font-bold">
                    <CreditCard className={`h-4 w-4 ${activateMutation.isPending ? 'animate-pulse' : ''}`} />
                    {activateMutation.isPending ? 'Requesting…' : 'Proceed to Pay & Switch'}
                    <ArrowRight className="h-3.5 w-3.5" />
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

'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Zap,
  Check,
  CreditCard,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState } from '@/features/customer/shared';
import { useCustomerPackages } from '../hooks/use-customer-packages';
import { formatBdtWithSymbol } from '@/lib/format';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export function CustomerPackagesPage() {
  const { data, isLoading, isError, refetch } = useCustomerPackages();
  const [selectedPkg, setSelectedPkg] = useState<{ id: string; name: string; priceBdt: number; speedMbps: number } | null>(null);

  if (isLoading) {
    return (
      <CustomerPageShell title="Internet Packages" subtitle="Loading available broadband plans...">
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="Internet Packages" subtitle="Broadband speed upgrades">
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { packages, currentPackageId } = data;

  const handleConfirmUpgrade = () => {
    toast.success(`Upgrade requested for ${selectedPkg?.name}! Redirecting to checkout.`);
    setSelectedPkg(null);
  };

  return (
    <CustomerPageShell
      title="Internet Packages"
      subtitle="Explore fiber-optic broadband packages designed for streaming, work, and ultra-low latency gaming."
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
        {/* Highlight Promo Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-background border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-primary p-2.5 text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Uncapped BDIX & FTP Speeds on All Plans</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enjoy up to 100 Mbps BDIX cache for YouTube, Netflix, Facebook, and local torrents regardless of base package.
              </p>
            </div>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30 shrink-0 font-bold">
            Zero Installation Fee
          </Badge>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const isCurrent = pkg.id === currentPackageId;
            const isPopular = pkg.speedMbps === 20 || pkg.speedMbps === 30;

            return (
              <Card
                key={pkg.id}
                className={`relative flex flex-col justify-between transition-all hover:shadow-lg ${
                  isCurrent
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/[0.02]'
                    : isPopular
                    ? 'border-primary/50'
                    : ''
                }`}
              >
                {isPopular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground font-bold text-xs uppercase px-3 py-0.5 shadow-sm">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary" className="font-bold text-xs uppercase px-3 py-0.5 shadow-sm">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">
                      {pkg.type.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Optical fiber dedicated broadband line
                  </CardDescription>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tight text-foreground">
                      {formatBdtWithSymbol(pkg.priceBdt)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-muted/60 p-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Internet Speed</span>
                    <span className="text-base font-extrabold flex items-center gap-1 text-primary">
                      <Zap className="h-4 w-4" />
                      {pkg.speedMbps} Mbps
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>1:1 Dedicated Symmetrical Speed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>100 Mbps BDIX & Local CDN Peer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Static / CGNAT Public IP Included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>24/7 Helpline & Fiber NOC support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>99.9% Network Uptime Guarantee</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter className="pt-2">
                  {isCurrent ? (
                    <Link href="/customer/subscription" className="w-full">
                      <Button variant="outline" className="w-full font-bold">
                        Active Subscription
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => setSelectedPkg(pkg)}
                      className="w-full font-bold gap-2"
                      variant={isPopular ? 'default' : 'outline'}
                    >
                      <Zap className="h-4 w-4" />
                      Switch to this Plan
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Upgrade Confirmation Modal */}
        <Dialog open={!!selectedPkg} onOpenChange={(open) => !open && setSelectedPkg(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Package Change</DialogTitle>
              <DialogDescription>
                You are about to switch your active broadband connection to {selectedPkg?.name}.
              </DialogDescription>
            </DialogHeader>

            {selectedPkg && (
              <div className="space-y-4 py-2">
                <div className="rounded-xl border bg-muted/40 p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Selected Package</span>
                    <span className="font-bold">{selectedPkg.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">New Allocated Speed</span>
                    <span className="font-bold text-primary">{selectedPkg.speedMbps} Mbps</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">New Monthly Bill</span>
                    <span className="font-bold">{formatBdtWithSymbol(selectedPkg.priceBdt)}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  The new bandwidth profile will sync automatically with your router once the bill is settled or renewed.
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setSelectedPkg(null)}>
                    Cancel
                  </Button>
                  <Link href={`/customer/payments/pay?amount=${selectedPkg.priceBdt}`}>
                    <Button onClick={handleConfirmUpgrade} className="gap-2 font-bold">
                      <CreditCard className="h-4 w-4" />
                      Proceed to Pay & Upgrade
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CustomerPageShell>
  );
}

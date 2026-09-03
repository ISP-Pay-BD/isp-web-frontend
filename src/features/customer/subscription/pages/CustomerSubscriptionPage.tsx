'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Calendar,
  CreditCard,
  Zap,
  HardDrive,
  RefreshCw,
  Network,
  Cpu,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState } from '@/features/customer/shared';
import { useCustomerSubscription } from '../hooks/use-customer-subscription';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
import { toast } from 'sonner';

export function CustomerSubscriptionPage() {
  const { data, isLoading, isError, refetch, renewMutation } = useCustomerSubscription();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <CustomerPageShell title="My Subscription" subtitle="Loading current package details...">
        <CustomerLoadingSkeleton variant="subscription" />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="My Subscription" subtitle="Broadband Plan Management">
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { subscription, routerInfo, availablePackages } = data;
  const isActive = subscription.status === 'active';
  const quotaPercent = Math.min(100, Math.round((subscription.quotaUsedGb / subscription.quotaTotalGb) * 100));

  const handleRenew = async (pkgId?: string) => {
    try {
      await renewMutation.mutateAsync(pkgId);
      toast.success(pkgId ? 'Plan updated and renewed successfully!' : 'Subscription renewed successfully!');
      setUpgradeDialogOpen(false);
    } catch {
      toast.error('Failed to recharge subscription. Please try again.');
    }
  };

  return (
    <CustomerPageShell
      title="My Subscription"
      subtitle="View your active internet package, validity, data consumption, and renewal options."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'My Subscription' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/customer/payments/pay">
            <Button className="font-semibold shadow-sm">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Bill {formatBdtWithSymbol(subscription.priceBdt)}
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Main Subscription Banner */}
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold tracking-tight">{subscription.packageName}</h2>
                <Badge variant={isActive ? 'default' : 'destructive'} className="font-bold">
                  {isActive ? 'Active Subscription' : 'Suspended / Expired'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 font-mono">
                Subscription ID: {subscription.packageId} · Assigned to {subscription.userId}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" className="gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Change Package
                    </Button>
                  }
                />
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select a Package Upgrade</DialogTitle>
                    <DialogDescription>
                      Upgrade your broadband speed instantly. New package rate takes effect immediately upon renewal.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-3 pt-2">
                    {availablePackages.map((pkg) => {
                      const isCurrent = pkg.id === subscription.packageId;
                      const isSelected = selectedPackageId === pkg.id || (isCurrent && !selectedPackageId);
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'hover:border-muted-foreground/40'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base">{pkg.name}</span>
                              {isCurrent && (
                                <Badge variant="secondary" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {pkg.speedMbps} Mbps Dedicated · Unlimited Optical Fiber · Free BDIX
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-black text-primary">
                              {formatBdtWithSymbol(pkg.priceBdt)}
                            </div>
                            <span className="text-[11px] text-muted-foreground">/ month</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                    <Button variant="ghost" onClick={() => setUpgradeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      disabled={renewMutation.isPending || !selectedPackageId || selectedPackageId === subscription.packageId}
                      onClick={() => handleRenew(selectedPackageId ?? undefined)}
                      className="gap-2 font-bold"
                    >
                      <RefreshCw className={`h-4 w-4 ${renewMutation.isPending ? 'animate-spin' : ''}`} />
                      Confirm & Switch
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={() => handleRenew()}
                disabled={renewMutation.isPending}
                className="gap-2 font-bold shadow-md"
              >
                <RefreshCw className={`h-4 w-4 ${renewMutation.isPending ? 'animate-spin' : ''}`} />
                Renew Plan
              </Button>
            </div>
          </div>

          {/* Subscription Statistics Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-6">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" /> Allocated Bandwidth
              </span>
              <div className="text-xl font-bold">{subscription.speedMbps} Mbps</div>
              <p className="text-xs text-muted-foreground">1:1 Symmetrical Upload/Download</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-emerald-500" /> Monthly Charge
              </span>
              <div className="text-xl font-bold">{formatBdtWithSymbol(subscription.priceBdt)}</div>
              <p className="text-xs text-muted-foreground">Includes 5% Govt VAT & Charges</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-blue-500" /> Start Date
              </span>
              <div className="text-xl font-bold">{formatDate(subscription.startDate)}</div>
              <p className="text-xs text-muted-foreground">Activated at start of cycle</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-amber-500" /> Valid Until
              </span>
              <div className="text-xl font-bold">{formatDate(subscription.expiryDate)}</div>
              <p className="text-xs text-muted-foreground">Auto-suspension on midnight</p>
            </div>
          </div>

          {/* Quota Progress */}
          <div className="mt-8 p-4 rounded-xl bg-muted/50 border space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-primary" />
                Data Cap & Fair Usage Consumption
              </span>
              <span className="font-bold">
                {subscription.quotaUsedGb} GB / {subscription.quotaTotalGb} GB ({quotaPercent}%)
              </span>
            </div>
            <Progress value={quotaPercent} className="h-2.5" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Remaining this cycle: {subscription.quotaTotalGb - subscription.quotaUsedGb} GB</span>
              <span>Unlimited BDIX & Local Cache throughput</span>
            </div>
          </div>
        </div>

        {/* Technical & Connection Configuration */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* PPPoE Credentials */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Connection Credentials
              </CardTitle>
              <CardDescription className="text-xs">
                Credentials configured in your home ONT / WiFi router
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <div className="text-xs text-muted-foreground">PPPoE Dial-up Username</div>
                  <div className="text-sm font-mono font-bold mt-0.5">{routerInfo.pppoeUsername}</div>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  PPPoE
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <div className="text-xs text-muted-foreground">Assigned Public / CGNAT IP</div>
                  <div className="text-sm font-mono font-bold mt-0.5">{routerInfo.ipAddress}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Static
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <div className="text-xs text-muted-foreground">Hardware MAC Binding</div>
                  <div className="text-sm font-mono font-bold mt-0.5">{routerInfo.macAddress}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Bound
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Router Hardware & Tools link */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                Assigned Hardware & Router
              </CardTitle>
              <CardDescription className="text-xs">Physical equipment registered with POP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Router Model</span>
                  <span className="text-sm font-bold">{routerInfo.routerModel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Optical Power (RX)</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">-19.4 dBm (Normal)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Port Duplex</span>
                  <span className="text-sm font-mono">1000M Full Duplex</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/customer/router" className="w-full">
                  <Button variant="outline" className="w-full gap-2 text-xs">
                    <Network className="h-4 w-4" />
                    Open Router Diagnostic Tools
                    <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerPageShell>
  );
}

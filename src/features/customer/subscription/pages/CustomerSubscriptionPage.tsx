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
} from '@/features/customer/shared';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { useCustomerSubscription, useRenewSubscription, openPaymentPage } from '../hooks/use-customer-subscription';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
import { toast } from 'sonner';

const titleCase = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '—');

const connLabel = (value: string) =>
  value === 'conn' ? 'Connected' : value === 'disconn' ? 'Disconnected' : titleCase(value);

export function CustomerSubscriptionPage() {
  const { data, isLoading, isError, error, refetch } = useCustomerSubscription();
  const dashboard = useCustomerDashboard();
  const renewMutation = useRenewSubscription();
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
            toast.info('Invoice created — taking you to the payment page…');
            openPaymentPage(checkout.paymentUrl);
          } else {
            toast.success(checkout.message || 'Invoice created. You can pay it from Payments.');
          }
        },
      },
    );
  };

  return (
    <CustomerPageShell
      title="My Subscription"
      subtitle="View your internet package, validity and renewal options."
      breadcrumbs={[{ label: 'Customer', href: '/customer/dashboard' }, { label: 'My Subscription' }]}
      actions={
        <Link href="/customer/payments/pay">
          <Button className="font-semibold shadow-sm">
            <CreditCard className="mr-2 h-4 w-4" />
            {currentPackage ? `Pay Bill ${formatBdtWithSymbol(currentPackage.priceBdt)}` : 'Pay Bill'}
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold tracking-tight">{currentPackage?.name || 'No package assigned'}</h2>
                <Badge variant={isActive ? 'default' : 'destructive'} className="font-bold">
                  {isActive ? 'Active Subscription' : titleCase(data.subscriptionStatus)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 font-mono">Customer ID: {account.id || '—'}</p>
              {pendingPackage && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Pending change to {pendingPackage.name} — it activates once its invoice is paid.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" className="gap-2" disabled={packages.length === 0}>
                      <Zap className="h-4 w-4 text-amber-500" />
                      Change Package
                    </Button>
                  }
                />
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select a Package</DialogTitle>
                    <DialogDescription>
                      Switching creates an invoice for the new package. Your current package stays active until it is paid.
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
                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all text-left ${
                            isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-muted-foreground/40'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base">{pkg.name || `Package #${pkg.id}`}</span>
                              {isCurrent && (
                                <Badge variant="secondary" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            {pkg.bandwidth && <div className="text-xs text-muted-foreground">{pkg.bandwidth}</div>}
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{formatBdtWithSymbol(pkg.priceBdt)}</div>
                            <span className="text-[11px] text-muted-foreground">/ month</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                    <Button variant="ghost" onClick={() => setUpgradeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      disabled={renewMutation.isPending || !selectedPackageId || selectedPackageId === data.packageId}
                      onClick={() => selectedPackageId && handleRenew(selectedPackageId)}
                      className="gap-2 font-bold"
                    >
                      <RefreshCw className={`h-4 w-4 ${renewMutation.isPending ? 'animate-spin' : ''}`} />
                      Switch & Pay
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={() => handleRenew(data.packageId)}
                disabled={renewMutation.isPending || !data.packageId}
                className="gap-2 font-bold shadow-md"
              >
                <RefreshCw className={`h-4 w-4 ${renewMutation.isPending ? 'animate-spin' : ''}`} />
                Renew Plan
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <OpsSummaryStrip
              items={[
                { label: 'speed', value: currentPackage?.bandwidth || '—' },
                { label: 'monthly', value: currentPackage ? formatBdtWithSymbol(currentPackage.priceBdt) : '—' },
                { label: 'last renewed', value: formatDate(data.lastRenewed) },
                { label: 'valid until', value: formatDate(data.willExpire) },
              ]}
            />
          </div>

          <div className="mt-8 p-4 rounded-xl bg-muted/50 border flex items-start gap-2.5 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span>
              Renewing or switching creates an invoice and takes you to your provider&apos;s payment page. Your
              validity is extended only after that payment is confirmed.
            </span>
          </div>
        </div>

        {packages.length === 0 && (
          <CustomerEmptyState
            title="No packages available"
            description="Your provider has not published any packages for your account yet."
          />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Connection
              </CardTitle>
              <CardDescription className="text-xs">Your broadband login and line state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <div className="text-xs text-muted-foreground">PPPoE username</div>
                  <div className="text-sm font-mono font-bold mt-0.5">
                    {dashboard.isLoading ? '…' : dashboard.data?.pppoeUsername || '—'}
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  PPPoE
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <div className="text-xs text-muted-foreground">Line status</div>
                  <div className="text-sm font-bold mt-0.5">{connLabel(account.connStatus)}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {titleCase(account.accountStatus)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                Network router
              </CardTitle>
              <CardDescription className="text-xs">The provider router your connection is served from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Router</span>
                  <span className="text-sm font-bold">
                    {dashboard.isLoading ? '…' : routerInfo?.name || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Status</span>
                  <span className="text-sm">{dashboard.isLoading ? '…' : titleCase(routerInfo?.status ?? '')}</span>
                </div>
              </div>

              <Link href="/customer/router" className="w-full">
                <Button variant="outline" className="w-full gap-2 text-xs">
                  <Network className="h-4 w-4" />
                  Open Router Tools
                  <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerPageShell>
  );
}

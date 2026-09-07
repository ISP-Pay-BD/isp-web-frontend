'use client';

import { useState } from 'react';
import {
  Gift,
  Users,
  Copy,
  Check,
  History,
} from 'lucide-react';
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
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState } from '@/features/customer/shared';
import { useCustomerRewards } from '../hooks/use-customer-rewards';
import { formatBdtWithSymbol } from '@/lib/format';
import { toast } from 'sonner';

export function CustomerRewardsPage() {
  const { data, isLoading, isError, refetch, redeemMutation } = useCustomerRewards();
  const [copied, setCopied] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <CustomerPageShell title="Referrals & Rewards" subtitle="Loading your reward wallet...">
        <CustomerLoadingSkeleton variant="rewards" />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="Referrals & Rewards" subtitle="Loyalty & Referral Points">
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { pointsBalance, referralCode, referralsCount, pendingReferrals, transactions } = data;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRedeem = async (pts: number) => {
    try {
      await redeemMutation.mutateAsync(pts);
      toast.success(`Redeemed ${pts} points for a bill discount voucher!`);
      setRedeemDialogOpen(false);
    } catch {
      toast.error('Failed to redeem points. Please check balance.');
    }
  };

  return (
    <CustomerPageShell
      title="Referrals & Rewards"
      subtitle="Invite friends and neighbors to connect with high-speed fiber internet and earn bill discounts."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Rewards' },
      ]}
    >
      <div className="space-y-6">
        {/* Top Wallet Hero Grid */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Points Wallet Card */}
          <div className="md:col-span-6 rounded-xl border border-border/60 bg-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Gift className="h-4 w-4 text-primary" /> Reward points
                </span>
                <Badge variant="outline" className="text-xs">
                  Gold
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight tabular-nums">
                  {pointsBalance.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-muted-foreground">points</span>
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                Cash value ≈ <strong className="text-foreground">{formatBdtWithSymbol(Math.floor(pointsBalance / 2))}</strong> off your next bill.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">1 point = ৳0.50</span>
              <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
                <DialogTrigger
                  render={
                    <Button
                      disabled={pointsBalance < 100}
                      className="font-semibold text-xs h-9"
                    />
                  }
                >
                  Redeem Points
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Redeem Loyalty Points</DialogTitle>
                    <DialogDescription>
                      Convert your points into an instant voucher applied towards your next broadband invoice.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-3 pt-2">
                    {[100, 200, 500].map((pts) => {
                      const canAfford = pointsBalance >= pts;
                      return (
                        <div
                          key={pts}
                          className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/40"
                        >
                          <div>
                            <div className="font-bold text-sm">{pts} Reward Points</div>
                            <div className="text-xs text-muted-foreground">
                              Converts to <strong>{formatBdtWithSymbol(pts / 2)}</strong> bill discount
                            </div>
                          </div>
                          <Button
                            size="sm"
                            disabled={!canAfford || redeemMutation.isPending}
                            onClick={() => handleRedeem(pts)}
                            className="font-bold text-xs"
                          >
                            Redeem
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Referral Code Card */}
          <Card className="md:col-span-6 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Your Personal Referral Code
              </CardTitle>
              <CardDescription className="text-xs">
                Share this code with friends in your neighborhood when they take a new ISP connection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-muted/50">
                <div className="font-mono font-bold text-lg text-primary tracking-wider px-2 flex-1">
                  {referralCode}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5 text-xs font-semibold"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy Code'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border p-3 bg-muted/20">
                  <span className="text-muted-foreground">Successful Activations:</span>
                  <div className="text-lg font-bold mt-0.5">{referralsCount} Customers</div>
                </div>
                <div className="rounded-lg border p-3 bg-muted/20">
                  <span className="text-muted-foreground">Pending Verification:</span>
                  <div className="text-lg font-bold mt-0.5">{pendingReferrals} Pending</div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Both you and your friend receive <strong>200 bonus reward points (৳100 discount)</strong> once their installation is verified.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ledger: Points History */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Reward Points Ledger
              </CardTitle>
              <span className="text-xs text-muted-foreground font-mono">Recent Transactions</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y text-sm">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground text-xs sm:text-sm">{tx.label}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{tx.date}</div>
                  </div>

                  <div
                    className={`font-mono font-bold text-sm ${
                      tx.points > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerPageShell>
  );
}

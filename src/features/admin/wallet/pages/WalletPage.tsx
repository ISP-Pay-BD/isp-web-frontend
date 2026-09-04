'use client';

import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useWallet } from '../hooks/use-wallet';
import { PageSkeleton, EmptyState, StatCard, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, CreditCard, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function WalletPage() {
  const { wallet, isLoading, isError, refetch } = useWallet();

  if (isLoading) return <PageSkeleton variant="dashboard" rows={8} />;

  if (isError || !wallet) {
    return (
      <EmptyState
        title="Failed to load wallet"
        description="Could not load tenant PAYG wallet balance."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground text-sm">
            PAYG platform balance — auto-deducts ৳{wallet.costPerSubscriberBdt}/subscriber monthly.
          </p>
        </div>
        <Button
          onClick={() => toast.success('Top-up flow will connect to bKash/Nagad in Phase 8')}
          className="bg-primary hover:bg-primary/90"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Top Up Wallet
        </Button>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Balance"
          value={<CurrencyDisplay amount={wallet.balanceBdt} />}
          description={`~${wallet.runwayMonths} months runway`}
          icon={Wallet}
        />
        <StatCard
          title="Est. Monthly Charge"
          value={<CurrencyDisplay amount={wallet.estimatedMonthlyChargeBdt} />}
          description={`${wallet.totalSubscribersCount} active subs`}
          icon={Users}
        />
        <StatCard title="Next Billing" value={wallet.nextBillingDate} description="Auto-deduct date" icon={Calendar} />
        <StatCard
          title="Status"
          value={<StatusBadge status={wallet.subscriptionStatus === 'active' ? 'active' : 'pending'} label={wallet.subscriptionStatus} />}
          description={wallet.isPayg ? 'Pay-As-You-Go' : 'Fixed plan'}
          icon={CreditCard}
        />
      </div>

      <div className="bg-card rounded-lg border">
        <div className="border-b p-4">
          <h2 className="font-semibold">Transaction History</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>TrxID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wallet.transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-mono text-xs">{tx.date}</TableCell>
                <TableCell className="font-mono text-xs">{tx.trxId}</TableCell>
                <TableCell>
                  <span className="bg-muted rounded px-2 py-0.5 text-xs capitalize">{tx.type.replace(/_/g, ' ')}</span>
                </TableCell>
                <TableCell className="text-sm">{tx.description}</TableCell>
                <TableCell>
                  <CurrencyDisplay
                    amount={tx.amountBdt}
                    className={tx.type === 'topup' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
                  />
                </TableCell>
                <TableCell><CurrencyDisplay amount={tx.balanceAfterBdt} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    
      </PageContent>
    </div>
  );
}

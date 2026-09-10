'use client';

import { useState, useMemo } from 'react';
import { PageHero, PageContent } from '@/components/motion/PageHero';
import { useWallet } from '../hooks/use-wallet';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  RotateCw,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const TOPUP_PRESETS = [1000, 2500, 5000, 10000, 25000];

export function WalletPage() {
  const { wallet, isLoading, isError, refetch } = useWallet();
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(2500);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'card'>('bkash');
  const [txFilter, setTxFilter] = useState<'all' | 'topup' | 'subscription_deduction' | 'sms_bundle'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = wallet?.transactions ?? [];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchType = txFilter === 'all' || tx.type === txFilter;
      const matchQuery = 
        !searchQuery.trim() || 
        tx.trxId.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tx.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchQuery;
    });
  }, [transactions, txFilter, searchQuery]);

  const handleExecuteTopup = () => {
    toast.success(`৳${topupAmount.toLocaleString()} added to PAYG wallet via ${paymentMethod.toUpperCase()} (Mock)`);
    setIsTopupOpen(false);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Wallet className="h-6 w-6 text-primary" />
            Tenant PAYG Wallet & Billing
          </h1>
          <p className="text-muted-foreground text-sm">
            Self-managed prepaid balance for automated subscriber licensing at ৳{wallet.costPerSubscriberBdt}/subscriber per month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              toast.success('Wallet balance synchronized');
            }}
            className="border-border/70 hover:border-border hover:bg-card/80 text-xs"
          >
            <RotateCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            onClick={() => setIsTopupOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-sm shadow-primary/20"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Top Up Wallet
          </Button>
        </div>
      </PageHero>

      <PageContent className="space-y-6">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card/60 to-card/60 p-4 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Prepaid Wallet Balance</span>
              <div className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/30">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">
              <CurrencyDisplay amount={wallet.balanceBdt} />
            </div>
            <p className="mt-1 text-xs text-primary flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              ~{wallet.runwayMonths} Months Operating Runway
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-border transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Est. Monthly License</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">
              <CurrencyDisplay amount={wallet.estimatedMonthlyChargeBdt} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              For {wallet.totalSubscribersCount} active subscribers
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-border transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Next Auto-Deduction</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-xl font-bold tracking-tight text-foreground font-mono">
              {wallet.nextBillingDate}
            </div>
            <p className="mt-1 text-xs text-amber-400/90 font-medium">
              Auto-billed on 1st of next month
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Subscription Tier</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-xl font-bold tracking-tight text-emerald-400 capitalize flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              {wallet.subscriptionStatus}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {wallet.isPayg ? 'Standard Pay-As-You-Go' : 'Enterprise Committed'}
            </p>
          </div>
        </div>

        {/* Transaction History Card */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
            <div>
              <h2 className="font-semibold text-sm text-foreground">Transaction & Deduction Ledger</h2>
              <p className="text-xs text-muted-foreground">All top-ups, SMS renewals, and subscriber billing events</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search TrxID or note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background/80 border-border/70 w-48 sm:w-56"
                />
              </div>
              <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/60">
                {(['all', 'topup', 'subscription_deduction'] as const).map((filterVal) => (
                  <Button
                    key={filterVal}
                    size="sm"
                    variant={txFilter === filterVal ? 'default' : 'ghost'}
                    onClick={() => setTxFilter(filterVal)}
                    className={`h-7 text-xs px-2.5 capitalize ${
                      txFilter === filterVal ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {filterVal === 'all' ? 'All' : filterVal === 'topup' ? 'Top-ups' : 'Deductions'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                  <TableHead className="text-xs font-semibold">Transaction ID</TableHead>
                  <TableHead className="text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-xs font-semibold">Description</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Balance After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                      No matching wallet transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isCredit = tx.type === 'topup';
                    return (
                      <TableRow key={tx.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {tx.date}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-medium text-foreground">
                          {tx.trxId}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-medium capitalize px-2 py-0.5 ${
                              isCredit
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                : 'border-border/60 bg-muted/30 text-muted-foreground'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="mr-1 h-3 w-3 inline text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="mr-1 h-3 w-3 inline text-muted-foreground" />
                            )}
                            {tx.type.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-foreground/90 font-medium">
                          {tx.description}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold">
                          <span className={isCredit ? 'text-emerald-400' : 'text-red-400'}>
                            {isCredit ? '+' : '-'} <CurrencyDisplay amount={tx.amountBdt} />
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          <CurrencyDisplay amount={tx.balanceAfterBdt} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </PageContent>

      {/* Top-up Dialog */}
      <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/80">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Wallet className="h-5 w-5 text-primary" />
              Top Up PAYG Wallet
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select or type the recharge amount in BDT to top up your platform runway.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-2">Preset Amounts</label>
              <div className="grid grid-cols-3 gap-2">
                {TOPUP_PRESETS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={topupAmount === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTopupAmount(amount)}
                    className={`h-9 text-xs font-mono font-semibold ${
                      topupAmount === amount 
                        ? 'bg-primary text-primary-foreground' 
                        : 'border-border/70 hover:border-primary/50'
                    }`}
                  >
                    ৳{amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Custom Amount (৳)</label>
              <Input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                min={100}
                className="bg-background/80 border-border/70 font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-2">Payment Gateway Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(['bkash', 'nagad', 'card'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-lg border p-2.5 text-center text-xs font-semibold capitalize transition-all ${
                      paymentMethod === method
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border/70 bg-card/40 text-muted-foreground hover:border-border'
                    }`}
                  >
                    {method === 'bkash' ? 'bKash Online' : method === 'nagad' ? 'Nagad' : 'Debit/Credit'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setIsTopupOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleExecuteTopup} className="text-xs bg-primary hover:bg-primary/90">
              Pay ৳{topupAmount.toLocaleString()} via {paymentMethod.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


'use client';

import { useState, useMemo } from 'react';
import {
  Wallet,
  Search,
  Plus,
  Download,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  RotateCcw,
  Sliders,
  DollarSign,
  Calendar,
  X,
  CreditCard,
  Building2,
  User,
  Check,
  Layers,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { DepositRow } from '@/data/admin/isp-ops.data';

type DepositFilter = 'all' | 'refundable' | 'otc' | 'router_deposit' | 'refunded';

export function DepositsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<DepositFilter>('all');
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRow | null>(null);

  const rawDeposits = useMemo(() => data?.deposits ?? [], [data?.deposits]);

  // Aggregate Metrics
  const totalRefundableBdt = useMemo(
    () =>
      rawDeposits
        .filter((d) => d.refundable && d.status !== 'refunded')
        .reduce((s, d) => s + d.amountBdt, 0),
    [rawDeposits]
  );
  const totalOtcBdt = useMemo(
    () =>
      rawDeposits
        .filter((d) => !d.refundable)
        .reduce((s, d) => s + d.amountBdt, 0),
    [rawDeposits]
  );
  const totalRefundedBdt = useMemo(
    () =>
      rawDeposits
        .filter((d) => d.status === 'refunded')
        .reduce((s, d) => s + d.amountBdt, 0),
    [rawDeposits]
  );

  const filteredDeposits = useMemo(() => {
    return rawDeposits.filter((d) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const match =
          d.customerName.toLowerCase().includes(q) ||
          (d.customerId && d.customerId.toLowerCase().includes(q)) ||
          (d.itemDescription && d.itemDescription.toLowerCase().includes(q)) ||
          (d.voucherNo && d.voucherNo.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (filterType === 'refundable') {
        return d.refundable && d.status !== 'refunded';
      }
      if (filterType === 'otc') {
        return d.type === 'otc' || d.type === 'installation';
      }
      if (filterType === 'router_deposit') {
        return d.type === 'router_deposit';
      }
      if (filterType === 'refunded') {
        return d.status === 'refunded';
      }

      return true;
    });
  }, [rawDeposits, search, filterType]);

  const handleProcessRefund = (deposit: DepositRow) => {
    toast.success(`Deposit refund voucher of ৳ ${deposit.amountBdt.toLocaleString()} BDT processed for ${deposit.customerName}`);
    setSelectedDeposit(null);
  };

  const handleAdjustToBalance = (deposit: DepositRow) => {
    toast.success(`৳ ${deposit.amountBdt.toLocaleString()} BDT adjusted against upcoming monthly invoice for ${deposit.customerName}`);
    setSelectedDeposit(null);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load deposits and OTC records"
        description="Could not query security ledger."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      {/* Header */}
      <PageHeader
        title="Security Deposits & One-Time Charges (OTC)"
        subtitle="Manage subscriber ONU hardware security deposits, optical fiber installation charges, and equipment refunds."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
          { label: 'Deposits / OTC' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Deposits ledger synchronized');
              }}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Sync Ledger
            </Button>

            <Button
              size="sm"
              onClick={() => toast.info('New deposit receipt voucher loaded')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Record Security Deposit
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Refundable Deposits */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Held Deposits (Refundable)
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              ৳ {totalRefundableBdt.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>ONU & Hardware Bonds</span>
          </div>
        </Card>

        {/* Total OTC Collected */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              OTC Installation Revenue
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              ৳ {totalOtcBdt.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Non-refundable connection fees</span>
          </div>
        </Card>

        {/* Settled / Refunded */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Refunds Settled
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">
              ৳ {totalRefundedBdt.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Closed subscriber deposits</span>
          </div>
        </Card>

        {/* Total Ledger Entries */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Vouchers
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {rawDeposits.length}
            </span>
            <span className="text-xs text-muted-foreground">records</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Security & OTC items</span>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filter */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by customer name, voucher #, or equipment item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mr-1">
              Category:
            </span>

            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                filterType === 'all' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              All Records ({rawDeposits.length})
            </Button>

            <Button
              variant={filterType === 'refundable' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('refundable')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium gap-1',
                filterType === 'refundable'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10'
              )}
            >
              <ShieldCheck className="h-3 w-3" /> Refundable Deposits
            </Button>

            <Button
              variant={filterType === 'otc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('otc')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium gap-1',
                filterType === 'otc'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/10'
              )}
            >
              <Wallet className="h-3 w-3" /> One-Time Connection (OTC)
            </Button>

            <Button
              variant={filterType === 'router_deposit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('router_deposit')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium gap-1',
                filterType === 'router_deposit'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
              )}
            >
              <HardDrive className="h-3 w-3" /> Router Equipment Bonds
            </Button>

            <Button
              variant={filterType === 'refunded' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('refunded')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium gap-1',
                filterType === 'refunded'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
              )}
            >
              <RotateCcw className="h-3 w-3" /> Settled / Refunded
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deposits Table */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Subscriber Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-4 min-w-[220px]">Item Description & Voucher</th>
                <th className="py-3 px-4">Amount (BDT)</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Receipt Date</th>
                <th className="py-3 px-3">Refundable</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredDeposits.map((dep) => {
                const isRefunded = dep.status === 'refunded';

                return (
                  <tr
                    key={dep.id}
                    onClick={() => setSelectedDeposit(dep)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">
                          {dep.customerName}
                        </span>
                        {dep.customerId && (
                          <span className="font-mono text-[10px] text-muted-foreground mt-0.5">
                            {dep.customerId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize text-[10px] font-semibold px-2 py-0.5',
                          dep.type === 'deposit' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                          dep.type === 'otc' && 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                          dep.type === 'router_deposit' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                          dep.type === 'installation' && 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                        )}
                      >
                        {dep.type.replace('_', ' ')}
                      </Badge>
                    </td>

                    {/* Item Description & Voucher */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {dep.itemDescription ?? 'Security bond payment'}
                        </span>
                        {dep.voucherNo && (
                          <span className="font-mono text-[10px] text-muted-foreground mt-0.5">
                            Voucher: {dep.voucherNo}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold font-mono text-sm text-foreground tabular-nums">
                        ৳ {dep.amountBdt.toLocaleString()}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="capitalize font-mono text-xs text-muted-foreground">
                        {dep.paymentMethod ?? 'Cash'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-xs text-muted-foreground">
                        {dep.at}
                      </span>
                    </td>

                    {/* Refundable Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {isRefunded ? (
                        <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20 text-[10px]">
                          Refunded
                        </Badge>
                      ) : dep.refundable ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                          Refundable
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted/60 text-muted-foreground border-border/80 text-[10px]">
                          Non-Refundable
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDeposit(dep)}
                        className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                      >
                        <Sliders className="h-3.5 w-3.5" /> Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Deposit Management Drawer */}
      <Sheet open={!!selectedDeposit} onOpenChange={(open) => !open && setSelectedDeposit(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          {selectedDeposit && (
            <>
              <SheetHeader>
                <Badge
                  variant="outline"
                  className="w-fit text-[10px] font-semibold uppercase px-2 py-0.5 border-primary/30 text-primary"
                >
                  Deposit & OTC Voucher
                </Badge>
                <SheetTitle className="text-xl font-bold text-foreground mt-2">
                  {selectedDeposit.customerName}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground font-mono">
                  Voucher: {selectedDeposit.voucherNo ?? 'VCH-DEP-2026-001'} · Date: {selectedDeposit.at}
                </SheetDescription>
              </SheetHeader>

              {/* Amount Card */}
              <Card className="p-4 border-border/80 bg-muted/20">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Held Security Amount
                </span>
                <p className="text-2xl font-bold text-primary font-mono tabular-nums mt-1">
                  ৳ {selectedDeposit.amountBdt.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">BDT</span>
                </p>
                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                  <p>Item: <strong className="text-foreground">{selectedDeposit.itemDescription}</strong></p>
                  <p>Payment Mode: <strong className="text-foreground capitalize">{selectedDeposit.paymentMethod ?? 'Cash'}</strong></p>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {selectedDeposit.refundable && selectedDeposit.status !== 'refunded' && (
                  <>
                    <Button
                      onClick={() => handleProcessRefund(selectedDeposit)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Process Full Cash/bKash Refund
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleAdjustToBalance(selectedDeposit)}
                      className="w-full text-xs h-9 border-border/80 hover:bg-accent gap-1.5"
                    >
                      <DollarSign className="h-3.5 w-3.5 text-primary" /> Adjust Against Monthly Invoice
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={() => toast.success(`Receipt printed for voucher ${selectedDeposit.voucherNo ?? 'VCH'}`)}
                  className="w-full text-xs h-9 border-border/80 hover:bg-accent"
                >
                  Print Voucher Receipt
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

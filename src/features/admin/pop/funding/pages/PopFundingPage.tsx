'use client';

import { useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  CreditCard,
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertTriangle,
  History,
  Sparkles,
  Banknote,
  MapPin,
  Plus,
} from 'lucide-react';
import { usePopData, useCreatePopFunding } from '../../hooks/use-pop';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const fundingSchema = z.object({
  popId: z.string().min(1, 'Please select a POP reseller'),
  amountBdt: z.coerce.number().min(100, 'Minimum funding is 100 BDT'),
  fundingType: z.enum(['credit', 'debit']),
  method: z.string().default('Bank Transfer'),
  note: z.string().optional(),
});

type FundingFormValues = z.infer<typeof fundingSchema>;

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export function PopFundingPage() {
  const { data, isLoading, isError, refetch } = usePopData();
  const fundingMutation = useCreatePopFunding();
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(10000);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FundingFormValues>({
    resolver: zodResolver(fundingSchema) as Resolver<FundingFormValues>,
    defaultValues: {
      popId: '',
      amountBdt: 10000,
      fundingType: 'credit',
      method: 'Bank Transfer',
      note: 'Monthly prepaid wallet allocation',
    },
  });

  const selectedPopId = watch('popId');
  const amountBdt = watch('amountBdt') || 0;
  const fundingType = watch('fundingType') || 'credit';

  const resellers = data?.resellers ?? [];
  const transactions = data?.transactions ?? [];

  const selectedReseller = useMemo(
    () => resellers.find((r) => r.id === selectedPopId),
    [resellers, selectedPopId],
  );

  const projectedBalance = useMemo(() => {
    if (!selectedReseller) return null;
    const current = selectedReseller.balanceBdt;
    return fundingType === 'credit' ? current + amountBdt : current - amountBdt;
  }, [selectedReseller, fundingType, amountBdt]);

  const stats = useMemo(() => {
    const totalBalance = resellers.reduce((a, r) => a + r.balanceBdt, 0);
    const totalCustomers = resellers.reduce((a, r) => a + r.customers, 0);
    const lowBalanceCount = resellers.filter((r) => r.balanceBdt < 10000).length;
    const avgBalance = resellers.length ? Math.round(totalBalance / resellers.length) : 0;
    return { totalBalance, totalCustomers, lowBalanceCount, avgBalance };
  }, [resellers]);

  const handleQuickSelect = (amt: number) => {
    setSelectedQuickAmount(amt);
    setValue('amountBdt', amt);
  };

  const handleSelectPop = (popId: string) => {
    setValue('popId', popId);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const onSubmit = async (values: FundingFormValues) => {
    await fundingMutation.mutateAsync({
      popId: values.popId,
      amountBdt: values.fundingType === 'credit' ? values.amountBdt : -values.amountBdt,
      note: values.note ? `[${values.method}] ${values.note}` : `[${values.method}] Wallet adjustment`,
    });
    reset({
      popId: values.popId,
      amountBdt: 10000,
      fundingType: 'credit',
      method: 'Bank Transfer',
      note: '',
    });
    setSelectedQuickAmount(10000);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load POP funding data"
        description="Could not fetch reseller wallet balances."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="POP Funding"
        subtitle="Credit and debit reseller wallet balances for downstream subscriber collections, inventory, and package purchases"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'POP Suite' },
          { label: 'POP Funding' },
        ]}
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{resellers.length}</span>{' '}
          <span className="text-muted-foreground">managed POP wallets</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={stats.totalBalance} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">total active capital</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">
            <CurrencyDisplay amount={stats.avgBalance} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">avg wallet reserve</span>
        </p>
        <p>
          <span className={cn('font-semibold tabular-nums', stats.lowBalanceCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>
            {stats.lowBalanceCount}
          </span>{' '}
          <span className="text-muted-foreground">low balance warning (&lt; 10k)</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column: Funding Allocation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                  <CreditCard className="h-4 w-4" />
                </div>
                <span>Allocate POP Funding</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Injected funding updates reseller prepaid balance instantly in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Select POP */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">POP Reseller Partner *</Label>
                  <Select
                    value={watch('popId')}
                    onValueChange={(v) => v && setValue('popId', v)}
                  >
                    <SelectTrigger className="h-10 shadow-sm text-xs">
                      <SelectValue placeholder="Select target POP partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {resellers.map((r) => (
                        <SelectItem key={r.id} value={r.id} className="text-xs">
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{r.name}</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ৳{r.balanceBdt.toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.popId && (
                    <p className="text-xs text-destructive">{errors.popId.message}</p>
                  )}
                </div>

                {/* Operation Type Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/40 border border-border/50">
                  <button
                    type="button"
                    onClick={() => setValue('fundingType', 'credit')}
                    className={cn(
                      'py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all',
                      fundingType === 'credit'
                        ? 'bg-background shadow-xs text-emerald-600 dark:text-emerald-400 border border-border/60'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" /> Credit Top-Up
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('fundingType', 'debit')}
                    className={cn(
                      'py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all',
                      fundingType === 'debit'
                        ? 'bg-background shadow-xs text-rose-600 dark:text-rose-400 border border-border/60'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <ArrowUpFromLine className="h-3.5 w-3.5" /> Debit / Deduct
                  </button>
                </div>

                {/* Quick Amount Chips */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Quick Amount Presets</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickSelect(amt)}
                        className={cn(
                          'px-2.5 py-1 text-xs rounded-lg font-mono border transition-all',
                          selectedQuickAmount === amt && amountBdt === amt
                            ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs'
                            : 'bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60',
                        )}
                      >
                        ৳{amt >= 1000 ? `${amt / 1000}k` : amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exact Amount Input */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Funding Amount (৳ BDT) *</Label>
                  <Input
                    type="number"
                    {...register('amountBdt')}
                    onChange={(e) => {
                      setValue('amountBdt', Number(e.target.value));
                      setSelectedQuickAmount(null);
                    }}
                    className="h-10 font-mono shadow-sm text-sm font-bold"
                  />
                  {errors.amountBdt && (
                    <p className="text-xs text-destructive">{errors.amountBdt.message}</p>
                  )}
                </div>

                {/* Settlement Channel */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Settlement Channel</Label>
                  <Select
                    value={watch('method')}
                    onValueChange={(v) => v && setValue('method', v)}
                  >
                    <SelectTrigger className="h-9 shadow-sm text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer (City Bank / EBL)</SelectItem>
                      <SelectItem value="bKash Merchant">bKash Merchant Direct</SelectItem>
                      <SelectItem value="Nagad Corporate">Nagad Corporate Gateway</SelectItem>
                      <SelectItem value="Cash Counter">Cash Handover Counter</SelectItem>
                      <SelectItem value="Internal Adjustment">Internal Ledger Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference Note */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Voucher / Memo Note</Label>
                  <Input
                    {...register('note')}
                    placeholder="e.g. Deposit slip #CBL-99201"
                    className="h-9 shadow-sm text-xs"
                  />
                </div>

                {/* Live Balance Projection */}
                {selectedReseller && projectedBalance !== null && (
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Current POP Balance:</span>
                      <span className="font-mono font-semibold text-foreground">
                        ৳{selectedReseller.balanceBdt.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t border-border/40">
                      <span className="text-foreground">Projected New Balance:</span>
                      <span
                        className={cn(
                          'font-mono',
                          projectedBalance >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-destructive',
                        )}
                      >
                        ৳{projectedBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full font-semibold shadow-2xs gap-1.5 text-xs h-10"
                  disabled={isSubmitting || !selectedPopId}
                >
                  {fundingType === 'credit' ? (
                    <>
                      <ArrowDownToLine className="h-4 w-4" /> Credit POP Wallet
                    </>
                  ) : (
                    <>
                      <ArrowUpFromLine className="h-4 w-4" /> Debit POP Wallet
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: POP Reseller Wallet Grid Cards */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Live POP Partner Wallets
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {resellers.length} Hubs Connected
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {resellers.map((r) => {
              const isSelected = selectedPopId === r.id;
              const isLow = r.balanceBdt < 10000;
              return (
                <Card
                  key={r.id}
                  onClick={() => handleSelectPop(r.id)}
                  className={cn(
                    'border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden transition-all duration-200 cursor-pointer group',
                    isSelected
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                      : 'hover:border-primary/40 hover:shadow-md',
                  )}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {r.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                          <span>{r.area}</span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'p-1.5 rounded-lg border',
                          isLow
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                        )}
                      >
                        {isLow ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingUp className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-1 border-t border-border/40">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                          Current Balance
                        </span>
                        <div
                          className={cn(
                            'text-xl font-bold font-mono',
                            isLow
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400',
                          )}
                        >
                          <CurrencyDisplay amount={r.balanceBdt} />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                          Subscribers
                        </span>
                        <span className="text-xs font-bold font-mono text-foreground">
                          {r.customers} Users
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs">
                      <span className="text-[11px] text-muted-foreground font-mono">{r.contact}</span>
                      <Button
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        className="h-6 px-2 text-[10px] font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPop(r.id);
                        }}
                      >
                        {isSelected ? 'Selected' : 'Top-Up'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom: Recent Funding & Allocation Ledger */}
      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden mt-6">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-primary" /> Recent Funding & Settlement Ledger
          </CardTitle>
          <CardDescription className="text-xs">
            Audit history of credit injections and debit settlements across all POP accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[120px]">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Date</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">POP Reseller</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Type</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Amount (BDT)</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Settlement Channel</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Transaction Memo</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 6).map((tx, idx) => (
                  <tr
                    key={`${tx.id || idx}-${tx.date}`}
                    className="border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {tx.date}
                    </TableCell>
                    <TableCell className="font-semibold text-sm text-foreground">
                      {tx.popName}
                    </TableCell>
                    <TableCell>
                      {tx.type === 'credit' ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1"
                        >
                          <ArrowDownToLine className="h-3 w-3" />
                          Credit
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold gap-1"
                        >
                          <ArrowUpFromLine className="h-3 w-3" />
                          Debit
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-mono text-sm font-bold',
                          tx.type === 'credit'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-destructive',
                        )}
                      >
                        {tx.type === 'credit' ? '+' : '-'}
                        <CurrencyDisplay amount={Math.abs(tx.amountBdt)} />
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        Bank / PGW
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate">
                      {tx.note}
                    </TableCell>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

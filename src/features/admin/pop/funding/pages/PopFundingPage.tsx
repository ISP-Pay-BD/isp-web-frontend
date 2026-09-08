'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Wallet,
  ArrowDownToLine,
  Users,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { usePopData, useCreatePopFunding } from '../../hooks/use-pop';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fundingSchema = z.object({
  popId: z.string().min(1, 'Select a POP'),
  amountBdt: z.coerce.number().min(100, 'Minimum funding is 100 BDT'),
  note: z.string().optional(),
});

type FundingFormValues = z.infer<typeof fundingSchema>;

export function PopFundingPage() {
  const { data, isLoading, isError, refetch } = usePopData();
  const fundingMutation = useCreatePopFunding();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FundingFormValues>({
    resolver: zodResolver(fundingSchema) as Resolver<FundingFormValues>,
    defaultValues: { popId: '', amountBdt: 10000, note: '' },
  });

  const resellers = data?.resellers ?? [];

  const stats = useMemo(() => {
    const totalBalance = resellers.reduce((a, r) => a + r.balanceBdt, 0);
    const totalCustomers = resellers.reduce((a, r) => a + r.customers, 0);
    return { totalBalance, totalCustomers };
  }, [resellers]);

  const onSubmit = async (values: FundingFormValues) => {
    await fundingMutation.mutateAsync(values);
    reset({ popId: values.popId, amountBdt: 10000, note: '' });
  };

  if (isLoading) return <PageSkeleton variant="table" rows={4} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load POP data"
        description="Could not fetch reseller list."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Wallet className="h-6 w-6" />
            </div>
            POP Funding
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Credit reseller wallet balance for downstream customer collections and package purchases.
          </p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      {/* Stats */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{resellers.length}</span>{' '}
          <span className="text-muted-foreground">total resellers</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums"><CurrencyDisplay amount={stats.totalBalance} className="font-mono text-foreground font-bold" /></span>{' '}
          <span className="text-muted-foreground">total balance</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats.totalCustomers}</span>{' '}
          <span className="text-muted-foreground">total customers</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Funding Form */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="h-4 w-4" />
                </div>
                Credit POP Wallet
              </CardTitle>
              <CardDescription>Funding is recorded as a credit transaction in POP ledger.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">POP Reseller *</Label>
                  <Select value={watch('popId')} onValueChange={(v) => v && setValue('popId', v)}>
                    <SelectTrigger className="h-10 shadow-sm">
                      <SelectValue placeholder="Select POP" />
                    </SelectTrigger>
                    <SelectContent>
                      {resellers.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} — Balance: <CurrencyDisplay amount={r.balanceBdt} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.popId && <p className="text-xs text-destructive">{errors.popId.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Amount (BDT) *</Label>
                  <Input type="number" {...register('amountBdt')} className="h-10 font-mono shadow-sm" />
                  {errors.amountBdt && <p className="text-xs text-destructive">{errors.amountBdt.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Note</Label>
                  <Input {...register('note')} placeholder="Monthly funding allocation" className="h-10 shadow-sm" />
                </div>

                <Button type="submit" className="w-full font-semibold shadow-sm gap-1.5" disabled={isSubmitting}>
                  <ArrowDownToLine className="h-4 w-4" /> Credit Funding
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Reseller Wallet Cards */}
        <div className="lg:col-span-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {resellers.map((r, idx) => (
              <div
                key={r.id}
              >
                <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-300 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm group-hover:text-primary transition-colors">{r.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {r.customers} customers &middot; {r.area}
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="mt-3 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      <CurrencyDisplay amount={r.balanceBdt} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    
      </PageContent>
    </div>
  );
}

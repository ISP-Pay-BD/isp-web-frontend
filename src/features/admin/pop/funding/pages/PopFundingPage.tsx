'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet, ArrowDownToLine } from 'lucide-react';
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
  amountBdt: z.coerce.number().min(100, 'Minimum funding is ৳100'),
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

  const onSubmit = async (values: FundingFormValues) => {
    await fundingMutation.mutateAsync(values);
    reset({ popId: values.popId, amountBdt: 10000, note: '' });
  };

  if (isLoading) return <PageSkeleton rows={4} />;
  if (isError) {
    return (
      <EmptyState title="Failed to load POP data" description="Could not fetch reseller list." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">POP Funding</h1>
        <p className="text-muted-foreground text-sm">
          Credit reseller wallet balance for downstream customer collections and package purchases.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" /> Credit POP Wallet
          </CardTitle>
          <CardDescription>Funding is recorded as a credit transaction in POP ledger.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>POP Reseller *</Label>
              <Select value={watch('popId')} onValueChange={(v) => v && setValue('popId', v)}>
                <SelectTrigger><SelectValue placeholder="Select POP" /></SelectTrigger>
                <SelectContent>
                  {resellers.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} — Balance: ৳{r.balanceBdt.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.popId && <p className="text-xs text-destructive">{errors.popId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Amount (৳) *</Label>
              <Input type="number" {...register('amountBdt')} />
              {errors.amountBdt && <p className="text-xs text-destructive">{errors.amountBdt.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Note</Label>
              <Input {...register('note')} placeholder="Monthly funding allocation" />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              <ArrowDownToLine className="mr-1.5 h-4 w-4" /> Credit Funding
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {resellers.map((r) => (
          <Card key={r.id}>
            <CardContent className="pt-4">
              <div className="font-medium text-sm">{r.name}</div>
              <div className="text-2xl font-bold mt-1">
                <CurrencyDisplay amount={r.balanceBdt} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{r.customers} customers · {r.area}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

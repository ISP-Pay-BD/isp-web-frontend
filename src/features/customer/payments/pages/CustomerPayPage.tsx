'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowRight, Info, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  useCustomerSubscription,
  manualPaymentSchema,
  type ManualPaymentInput,
} from '@/features/customer/shared';
import { useSubmitManualPayment } from '../hooks/use-customer-payments';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { formatBdtWithSymbol } from '@/lib/format';
import { toast } from 'sonner';

/**
 * Manual payment: the customer paid outside the portal (mobile wallet / bank)
 * and submits the TrxID. POST /v1/customer/payments records it as *pending*
 * until staff verify it. Online gateway checkout starts from a renewal
 * invoice (My Subscription) — no customer endpoint lists gateways here.
 */
export function CustomerPayPage() {
  const router = useRouter();
  const subscription = useCustomerSubscription();
  const payMutation = useSubmitManualPayment();
  const monthlyFee = subscription.data?.currentPackage?.priceBdt ?? 0;

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<ManualPaymentInput>({
    resolver: zodResolver(manualPaymentSchema),
    values: subscription.data
      ? { amount: monthlyFee, method: '', trxId: '', accountNumber: '' }
      : undefined,
    resetOptions: { keepDirtyValues: true },
  });

  const amount = watch('amount');

  const onSubmit = async (values: ManualPaymentInput) => {
    try {
      await payMutation.mutateAsync({
        amount: Number(values.amount),
        method: values.method,
        trxId: values.trxId,
        accountNumber: values.accountNumber,
      });
      toast.success('Payment submitted for verification. It will show as pending until your provider confirms it.');
      router.push('/customer/payments');
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  if (subscription.isLoading) {
    return (
      <CustomerPageShell title="Submit a Payment" subtitle="Loading your bill...">
        <CustomerLoadingSkeleton variant="form" />
      </CustomerPageShell>
    );
  }

  if (subscription.isError || !subscription.data) {
    return (
      <CustomerPageShell title="Submit a Payment" subtitle="Bill payment">
        <CustomerErrorState message={subscription.error?.message || undefined} onRetry={() => subscription.refetch()} />
      </CustomerPageShell>
    );
  }

  const pkg = subscription.data.currentPackage;

  return (
    <CustomerPageShell
      title="Submit a Payment"
      subtitle="Already paid by mobile wallet or bank? Submit the transaction ID for verification."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Payments', href: '/customer/payments' },
        { label: 'Pay Now' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Amount Paid</span>
                {pkg && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {pkg.name ? `${pkg.name} · ` : ''}Monthly fee {formatBdtWithSymbol(pkg.priceBdt)}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Pre-filled with your package&apos;s monthly fee — change it if you paid a different amount.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <Label htmlFor="amount">Amount (৳ BDT)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">৳</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={0}
                  {...register('amount', { valueAsNumber: true })}
                  className="pl-8 font-bold text-base"
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Payment Details</CardTitle>
              <CardDescription className="text-xs">
                Enter exactly what your payment receipt shows so your provider can match it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="method" className="text-xs">
                  Paid via
                </Label>
                <Input id="method" {...register('method')} placeholder="Mobile wallet or bank name" className="text-xs" />
                {errors.method && <p className="text-xs text-destructive">{errors.method.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="accountNumber" className="text-xs">
                    Sender Account / Phone (optional)
                  </Label>
                  <Input id="accountNumber" {...register('accountNumber')} className="font-mono text-xs" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="trxId" className="text-xs">
                    Transaction ID (TrxID)
                  </Label>
                  <Input id="trxId" {...register('trxId')} className="font-mono text-xs uppercase" />
                  {errors.trxId && <p className="text-xs text-destructive">{errors.trxId.message}</p>}
                </div>
              </div>

              <div className="rounded-lg bg-blue-500/10 p-3 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
                <span>
                  Submitted payments are recorded as <strong>pending</strong> and do not extend your subscription until
                  your provider verifies the transaction.
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl border bg-muted/30 p-4 flex items-start gap-2.5 text-xs text-muted-foreground">
            <Globe className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
            <span>
              Prefer to pay online?{' '}
              <Link href="/customer/subscription" className="text-primary font-semibold hover:underline">
                Renew from My Subscription
              </Link>{' '}
              — you&apos;ll be taken to your provider&apos;s payment page to complete the invoice.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card">
            <div>
              <span className="text-xs text-muted-foreground">Amount to submit</span>
              <div className="text-2xl font-bold text-primary">
                {formatBdtWithSymbol(Number.isFinite(amount) ? amount : 0)}
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Link href="/customer/payments" className="w-full sm:w-auto">
                <Button variant="outline" type="button" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={payMutation.isPending} className="w-full sm:w-auto font-bold gap-2 shadow-md">
                <Lock className="h-4 w-4" />
                {payMutation.isPending ? 'Submitting...' : 'Submit for Verification'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </CustomerPageShell>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerPageShell } from '@/features/customer/shared';
import { useCustomerPayments } from '../hooks/use-customer-payments';
import { payInvoiceSchema, type PayInvoiceInput } from '@/features/customer/shared';
import { formatBdtWithSymbol } from '@/lib/format';
import { toast } from 'sonner';

const gateways = [
  { id: 'bkash', name: 'bKash', fee: '0%', instant: true, color: 'bg-pink-500/10 border-pink-500 text-pink-700 dark:text-pink-300' },
  { id: 'nagad', name: 'Nagad', fee: '0%', instant: true, color: 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300' },
  { id: 'rocket', name: 'Rocket', fee: '0%', instant: true, color: 'bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300' },
  { id: 'upay', name: 'Upay', fee: '0%', instant: true, color: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300' },
  { id: 'card', name: 'Visa / Mastercard', fee: '1.5%', instant: true, color: 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300' },
  { id: 'bank', name: 'Bank Transfer / IBFT', fee: '0%', instant: false, color: 'bg-slate-500/10 border-slate-500 text-slate-700 dark:text-slate-300' },
] as const;

export function CustomerPayPage() {
  const router = useRouter();
  const { payMutation } = useCustomerPayments();
  const [selectedGateway, setSelectedGateway] = useState<'bkash' | 'nagad' | 'rocket' | 'upay' | 'card' | 'bank'>('bkash');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PayInvoiceInput>({
    resolver: zodResolver(payInvoiceSchema),
    defaultValues: {
      amount: 0,
      method: 'bkash',
      accountNumber: '',
      trxId: '',
    },
  });

  const amount = watch('amount');

  const onSubmit = async (data: PayInvoiceInput) => {
    try {
      await payMutation.mutateAsync({
        amount: Number(data.amount),
        method: selectedGateway,
        accountNumber: data.accountNumber,
        trxId: data.trxId,
      });
      toast.success(`Payment of ৳${data.amount} received successfully! Subscription extended.`);
      router.push('/customer/payments');
    } catch {
      toast.error('Payment failed. Please verify your payment details and retry.');
    }
  };

  return (
    <CustomerPageShell
      title="Instant Payment & Recharge"
      subtitle="Pay your monthly broadband subscription securely via Mobile Financial Services or Bank Cards."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Payments', href: '/customer/payments' },
        { label: 'Pay Now' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Amount Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Select Recharge Amount</span>
                <span className="text-xs font-normal text-muted-foreground">Monthly Fee: ৳1,200</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Enter your monthly bill amount or choose quick payment presets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {[800, 1200, 1500, 2400].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={amount === preset ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setValue('amount', preset)}
                    className="font-bold text-xs"
                  >
                    ৳{preset} {preset === 1200 ? '(Monthly Due)' : ''}
                  </Button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amount">Custom Amount (৳ BDT)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                    ৳
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    {...register('amount', { valueAsNumber: true })}
                    className="pl-8 font-bold text-base"
                  />
                </div>
                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Gateway Grid */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Choose Payment Method</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> 256-bit SSL Encrypted
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Direct integration with Bangladeshi MFS providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gateways.map((gw) => {
                  const isSelected = selectedGateway === gw.id;
                  return (
                    <div
                      key={gw.id}
                      onClick={() => {
                        setSelectedGateway(gw.id);
                        setValue('method', gw.id);
                      }}
                      className={`relative flex flex-col justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/40 bg-primary/5'
                          : 'hover:border-muted-foreground/40 bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{gw.name}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Fee: {gw.fee}</span>
                        <span className="text-emerald-600 font-medium">Instant</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MFS Phone Number & TrxID Mock input */}
              <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor="accountNumber" className="text-xs">
                    Sender Account Number / Phone
                  </Label>
                  <Input
                    id="accountNumber"
                    {...register('accountNumber')}
                    placeholder="e.g. 01711000000"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="trxId" className="text-xs">
                    Transaction ID (TrxID)
                  </Label>
                  <Input
                    id="trxId"
                    {...register('trxId')}
                    placeholder="e.g. 9J4K28DKAL"
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-blue-500/10 p-3 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
                <span>
                  For automated recharge: Dial *247# (bKash) or *167# (Nagad) &gt; Make Payment to Merchant{' '}
                  <strong className="font-mono">your merchant number</strong> &gt; Enter your Customer ID{' '}
                  <strong className="font-mono">your customer ID</strong> as reference.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card">
            <div>
              <span className="text-xs text-muted-foreground">Total Payable Amount</span>
              <div className="text-2xl font-black text-primary">
                {formatBdtWithSymbol(amount || 0)}
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Link href="/customer/payments" className="w-full sm:w-auto">
                <Button variant="outline" type="button" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={payMutation.isPending}
                className="w-full sm:w-auto font-bold gap-2 shadow-md"
              >
                <Lock className="h-4 w-4" />
                {payMutation.isPending ? 'Processing...' : `Confirm & Pay ${formatBdtWithSymbol(amount || 0)}`}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </CustomerPageShell>
  );
}

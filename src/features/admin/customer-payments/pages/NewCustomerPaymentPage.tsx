'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Receipt, Loader2 } from 'lucide-react';
import { paymentSchema, type PaymentFormValues } from '../schemas/payment.schema';
import { useCreateCustomerPayment } from '../hooks/use-customer-payments';
import { CustomerPicker } from '../components/CustomerPicker';
import type { CustomerOption } from '../types';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/** Billing month names in the backend's `month` format (PHP date('F')). */
const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString('en', { month: 'long' }));

const METHODS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'bKash', label: 'bKash' },
  { value: 'Nagad', label: 'Nagad' },
  { value: 'Rocket', label: 'Rocket' },
  { value: 'Bank', label: 'Bank transfer' },
  { value: 'Card', label: 'Card' },
];

const FIELD_MAP: Record<string, keyof PaymentFormValues> = {
  customer: 'customerId',
  amount: 'amountBdt',
  month: 'billingMonth',
  paid_via: 'method',
  status: 'status',
  method_trx: 'trxId',
  comment: 'note',
};

export function NewCustomerPaymentPage() {
  const router = useRouter();
  const createMutation = useCreateCustomerPayment();
  const [customer, setCustomer] = useState<CustomerOption | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    getValues,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      customerId: '',
      amountBdt: undefined as unknown as number,
      billingMonth: MONTHS[new Date().getMonth()],
      method: 'Cash',
      status: 'successful',
      trxId: '',
      note: '',
    },
  });

  const pickCustomer = (c: CustomerOption | null) => {
    setCustomer(c);
    setValue('customerId', c?.id ?? '', { shouldValidate: Boolean(c) });
    setValue('customerName', c?.name ?? '');
    // Suggest the package price unless the operator already typed an amount.
    if (c?.packagePrice && !dirtyFields.amountBdt && !getValues('amountBdt')) {
      setValue('amountBdt', c.packagePrice, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      const res = await createMutation.mutateAsync({
        customerId: values.customerId,
        amountBdt: values.amountBdt,
        billingMonth: values.billingMonth,
        status: values.status,
        method: values.method,
        trxId: values.trxId,
        note: values.note,
      });
      router.push(res?.id ? `/admin/customer-payments/${res.id}/pos` : '/admin/customer-payments');
    } catch (err) {
      // The global mutation handler already toasts the message; map the
      // backend's field errors (snake_case contract names) onto the form.
      if (err instanceof ApiError && err.details) {
        for (const [key, messages] of Object.entries(err.details)) {
          const field = FIELD_MAP[key];
          const message = Array.isArray(messages) ? messages[0] : messages;
          if (field && message) setError(field, { type: 'server', message: String(message) });
        }
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHero className="flex items-center gap-3">
        <Link href="/admin/customer-payments">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Record Payment</h1>
          <p className="text-muted-foreground text-sm">Log a customer collection — cash, mobile wallet or bank.</p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" /> Payment Details
            </CardTitle>
            <CardDescription>The payment is recorded against the selected customer&apos;s billing month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <CustomerPicker value={customer} onChange={pickCustomer} invalid={Boolean(errors.customerId)} />
              {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Amount (৳) *</Label>
                <Input type="number" step="0.01" min="0" {...register('amountBdt')} />
                {errors.amountBdt && <p className="text-xs text-destructive">{errors.amountBdt.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Billing month *</Label>
                <Select value={watch('billingMonth')} onValueChange={(v) => v && setValue('billingMonth', v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.billingMonth && <p className="text-xs text-destructive">{errors.billingMonth.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Received via *</Label>
                <Select value={watch('method')} onValueChange={(v) => v && setValue('method', v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.method && <p className="text-xs text-destructive">{errors.method.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(v) => v && setValue('status', v as PaymentFormValues['status'])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="successful">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>TrxID / reference</Label>
                <Input {...register('trxId')} placeholder="Gateway TrxID or receipt reference" />
                {errors.trxId && <p className="text-xs text-destructive">{errors.trxId.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Note</Label>
                <Input {...register('note')} placeholder="Optional note" />
                {errors.note && <p className="text-xs text-destructive">{errors.note.message}</p>}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                Save Payment
              </Button>
              <Link href="/admin/customer-payments">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>

      </PageContent>
    </div>
  );
}

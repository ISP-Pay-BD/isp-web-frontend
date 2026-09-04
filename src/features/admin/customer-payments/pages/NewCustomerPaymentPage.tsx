'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Receipt } from 'lucide-react';
import { paymentSchema, type PaymentFormValues } from '../schemas/payment.schema';
import { useCreateCustomerPayment } from '../hooks/use-customer-payments';
import { useCustomers } from '@/features/admin/customers/hooks/use-customers';
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
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

export function NewCustomerPaymentPage() {
  const router = useRouter();
  const createMutation = useCreateCustomerPayment();
  const { data: customersData, isLoading: customersLoading } = useCustomers();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      customerId: '',
      amountBdt: 800,
      method: 'bkash',
      status: 'completed',
      note: '',
    },
  });

  const customers = customersData?.items ?? [];
  const selectedCustomerId = watch('customerId');

  const onSubmit = async (values: PaymentFormValues) => {
    const customer = customers.find((c) => c.id === values.customerId);
    await createMutation.mutateAsync({
      ...values,
      customerName: customer?.name ?? 'Customer',
    });
    router.push('/admin/customer-payments');
  };

  if (customersLoading) return <PageSkeleton variant="form" rows={4} />;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHero className="flex items-center gap-3">
        <Link href="/admin/customer-payments">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Record Payment</h1>
          <p className="text-muted-foreground text-sm">Log a customer collection — bKash, Nagad, cash, or bank.</p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" /> Payment Details
            </CardTitle>
            <CardDescription>Amount will be credited to the selected customer account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <Select
                value={selectedCustomerId}
                onValueChange={(v) => {
                  if (v) {
                    setValue('customerId', v);
                    const c = customers.find((x) => x.id === v);
                    if (c) setValue('customerName', c.name);
                  }
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.slice(0, 50).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Amount (৳) *</Label>
                <Input type="number" {...register('amountBdt')} />
                {errors.amountBdt && <p className="text-xs text-destructive">{errors.amountBdt.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select value={watch('method')} onValueChange={(v) => v && setValue('method', v as PaymentFormValues['method'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="sslcommerz">SSLCommerz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={watch('status')} onValueChange={(v) => v && setValue('status', v as PaymentFormValues['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Note / TrxID</Label>
              <Input {...register('note')} placeholder="TrxID: BK8A2F9X1M or cash receipt ref" />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-1.5 h-4 w-4" /> Save Payment
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

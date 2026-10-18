'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Receipt, Loader2 } from 'lucide-react';
import { paymentSchema, type PaymentFormValues } from '../schemas/payment.schema';
import { useCreateCustomerPayment } from '../hooks/use-customer-payments';
import { CustomerPicker } from '../components/CustomerPicker';
import { useCustomer } from '@/features/admin/customers/hooks/use-customers';
import type { CustomerOption } from '../types';
import { ApiError } from '@/lib/api/client';
import { useLocale } from '@/i18n/locale-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/** Billing month names in the backend's `month` format (PHP date('F')). */
const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString('en', { month: 'long' }));

const METHOD_VALUES = ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank', 'Card'] as const;

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
  const { t, te, locale } = useLocale();
  const createMutation = useCreateCustomerPayment();
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  // "Collect payment" on a customer row links here with ?customerId=…: start with that customer selected.
  const presetId = useSearchParams().get('customerId') ?? '';
  const preset = useCustomer(presetId, { compact: true });

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

  const methods = METHOD_VALUES.map((value) => ({
    value,
    label:
      value === 'Cash'
        ? t('admin.customerPayments.method.cash', 'Cash')
        : value === 'Bank'
          ? t('admin.customerPayments.method.bankTransfer', 'Bank transfer')
          : value === 'Card'
            ? t('admin.customerPayments.method.cardOnly', 'Card')
            : value,
  }));
  const methodItems = Object.fromEntries(methods.map((m) => [m.value, m.label]));
  const monthItems = useMemo(
    () =>
      Object.fromEntries(
        MONTHS.map((m, i) => [m, new Date(2000, i, 1).toLocaleString(locale === 'bn' ? 'bn-BD' : 'en', { month: 'long' })]),
      ),
    [locale],
  );
  const statusItems = {
    successful: t('admin.customerPayments.status.paid', 'Paid'),
    pending: t('admin.customerPayments.status.pending', 'Pending'),
    failed: t('admin.customerPayments.status.failed', 'Failed'),
  };

  const pickCustomer = (c: CustomerOption | null) => {
    setCustomer(c);
    setValue('customerId', c?.id ?? '', { shouldValidate: Boolean(c) });
    setValue('customerName', c?.name ?? '');
    // Suggest the package price unless the operator already typed an amount.
    if (c?.packagePrice && !dirtyFields.amountBdt && !getValues('amountBdt')) {
      setValue('amountBdt', c.packagePrice, { shouldValidate: true });
    }
  };

  const presetApplied = useRef(false);
  useEffect(() => {
    const c = preset.data;
    if (!c || presetApplied.current) return;
    presetApplied.current = true;
    pickCustomer({ id: c.id, name: c.name, mobile: c.phone, packageName: c.packageName || null, packagePrice: c.packagePrice });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset.data]);

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
        <Button variant="ghost" size="icon" aria-label={presetId ? t('admin.customerPayments.form.backToCustomer', 'Back to customer') : t('admin.customerPayments.form.backToPayments', 'Back to payments')} render={<Link href={presetId ? `/admin/customers/${presetId}` : '/admin/customer-payments'} />}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.customerPayments.form.title', 'Record Payment')}</h1>
          <p className="text-muted-foreground text-sm">{t('admin.customerPayments.form.subtitle', 'Log a customer collection — cash, mobile wallet or bank.')}</p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" /> {t('admin.customerPayments.form.details', 'Payment Details')}
            </CardTitle>
            <CardDescription>{t('admin.customerPayments.form.detailsHint', "The payment is recorded against the selected customer's billing month.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('admin.customerPayments.form.customer', 'Customer')} *</Label>
              <CustomerPicker value={customer} onChange={pickCustomer} invalid={Boolean(errors.customerId)} />
              {errors.customerId && <p className="text-xs text-destructive">{te(errors.customerId.message ?? '')}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="amountBdt">{t('admin.customerPayments.form.amount', 'Amount (৳)')} *</Label>
                <Input id="amountBdt" type="number" step="0.01" min="0" {...register('amountBdt')} />
                {errors.amountBdt && <p className="text-xs text-destructive">{te(errors.amountBdt.message ?? '')}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="billingMonth">{t('admin.customerPayments.form.billingMonth', 'Billing month')} *</Label>
                <Select value={watch('billingMonth')} onValueChange={(v) => v && setValue('billingMonth', v, { shouldValidate: true })} items={monthItems}>
                  <SelectTrigger id="billingMonth"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>{monthItems[m]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.billingMonth && <p className="text-xs text-destructive">{te(errors.billingMonth.message ?? '')}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="receivedVia">{t('admin.customerPayments.form.receivedVia', 'Received via')} *</Label>
                <Select value={watch('method')} onValueChange={(v) => v && setValue('method', v, { shouldValidate: true })} items={methodItems}>
                  <SelectTrigger id="receivedVia"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {methods.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.method && <p className="text-xs text-destructive">{te(errors.method.message ?? '')}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">{t('admin.customerPayments.form.status', 'Status')}</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(v) => v && setValue('status', v as PaymentFormValues['status'])}
                  items={statusItems}
                >
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="successful">{statusItems.successful}</SelectItem>
                    <SelectItem value="pending">{statusItems.pending}</SelectItem>
                    <SelectItem value="failed">{statusItems.failed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="trxId">{t('admin.customerPayments.form.trxId', 'TrxID / reference')}</Label>
                <Input id="trxId" {...register('trxId')} placeholder={t('admin.customerPayments.form.trxIdPlaceholder', 'Gateway TrxID or receipt reference')} />
                {errors.trxId && <p className="text-xs text-destructive">{te(errors.trxId.message ?? '')}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">{t('admin.customerPayments.form.note', 'Note')}</Label>
                <Input id="note" {...register('note')} placeholder={t('admin.customerPayments.form.notePlaceholder', 'Optional note')} />
                {errors.note && <p className="text-xs text-destructive">{te(errors.note.message ?? '')}</p>}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                {t('admin.customerPayments.form.save', 'Save Payment')}
              </Button>
              <Button type="button" variant="outline" render={<Link href="/admin/customer-payments" />}>{t('admin.customerPayments.form.cancel', 'Cancel')}</Button>
            </div>
          </CardContent>
        </Card>
      </form>

      </PageContent>
    </div>
  );
}

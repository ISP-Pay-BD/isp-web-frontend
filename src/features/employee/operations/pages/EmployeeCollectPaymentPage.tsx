'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError } from '@/lib/api/client';
import { useLocale } from '@/i18n/locale-context';
import { EmployeePageShell } from '@/features/employee/shared';
import { CustomerPicker } from '@/features/admin/customer-payments/components/CustomerPicker';
import type { CustomerOption } from '@/features/admin/customer-payments/types';
import { EmployeeAccessGate } from '../components/EmployeeAccessGate';
import { useCollectPayment } from '../hooks/use-collect-payment';
import { collectPaymentSchema, type CollectPaymentValues } from '../schemas/collect-payment.schema';

const METHODS = ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank'] as const;

const FIELD_MAP: Record<string, keyof CollectPaymentValues> = {
  customer_id: 'customerId',
  amount_cents: 'amountBdt',
  method: 'method',
  gateway_trx: 'trxId',
  note: 'note',
};

/** A due-customer row links here with `?customerId=&name=&mobile=&price=` (values the dashboard already showed). */
function presetFrom(params: URLSearchParams): CustomerOption | null {
  const id = params.get('customerId') ?? '';
  if (!/^\d+$/.test(id)) return null;
  const price = Number(params.get('price'));
  return {
    id,
    name: params.get('name') ?? '',
    mobile: params.get('mobile') ?? '',
    packageName: null,
    packagePrice: Number.isFinite(price) && price > 0 ? price : null,
  };
}

/** Employee quick action "Collect payment" (PHP: employee with `customer_payment,create`). */
export function EmployeeCollectPaymentPage() {
  const { t } = useLocale();
  const title = t('employee.collect.title', 'Collect payment');
  const breadcrumbs = [
    { label: t('employee.common.breadcrumb', 'Employee'), href: '/employee/dashboard' },
    { label: title },
  ];
  return (
    <EmployeeAccessGate title={title} breadcrumbs={breadcrumbs} allowed={(p) => p.createPayment}>
      <EmployeePageShell
        title={title}
        subtitle={t('employee.collect.subtitle', 'Record money you received from a customer.')}
        breadcrumbs={breadcrumbs}
      >
        <CollectPaymentForm />
      </EmployeePageShell>
    </EmployeeAccessGate>
  );
}

function CollectPaymentForm() {
  const { t, te } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const collect = useCollectPayment();
  const [customer, setCustomer] = useState<CustomerOption | null>(() => presetFrom(params));

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CollectPaymentValues>({
    resolver: zodResolver(collectPaymentSchema) as Resolver<CollectPaymentValues>,
    defaultValues: {
      customerId: customer?.id ?? '',
      amountBdt: (customer?.packagePrice ?? undefined) as unknown as number,
      method: 'Cash',
      trxId: '',
      note: '',
    },
  });

  const methodItems: Record<string, string> = Object.fromEntries(
    METHODS.map((m) => [
      m,
      m === 'Cash'
        ? t('employee.collect.method.cash', 'Cash')
        : m === 'Bank'
          ? t('employee.collect.method.bank', 'Bank transfer')
          : m,
    ]),
  );

  const pick = (c: CustomerOption | null) => {
    setCustomer(c);
    setValue('customerId', c?.id ?? '', { shouldValidate: Boolean(c) });
    if (c?.packagePrice) setValue('amountBdt', c.packagePrice, { shouldValidate: true });
  };

  const onSubmit = async (values: CollectPaymentValues) => {
    try {
      await collect.mutateAsync(values);
      router.push('/employee/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        for (const [key, messages] of Object.entries(err.details)) {
          const field = FIELD_MAP[key];
          const message = Array.isArray(messages) ? messages[0] : messages;
          if (field && message) setError(field, { type: 'server', message: String(message) });
        }
      }
    }
  };

  const busy = isSubmitting || collect.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-2xl" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="text-primary h-4 w-4" />
            {t('employee.collect.details', 'Payment details')}
          </CardTitle>
          <CardDescription>
            {t(
              'employee.collect.detailsHint',
              'Only customers you are allowed to collect from are listed.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>{t('employee.collect.customer', 'Customer')} *</Label>
            <CustomerPicker value={customer} onChange={pick} invalid={Boolean(errors.customerId)} />
            {errors.customerId ? (
              <p className="text-destructive text-xs">{te(errors.customerId.message ?? '')}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="amountBdt">{t('employee.collect.amount', 'Amount (৳)')} *</Label>
              <Input
                id="amountBdt"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="font-mono tabular-nums"
                {...register('amountBdt')}
              />
              {errors.amountBdt ? (
                <p className="text-destructive text-xs">{te(errors.amountBdt.message ?? '')}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="method">{t('employee.collect.receivedVia', 'Received via')} *</Label>
              <Select
                value={watch('method')}
                onValueChange={(v) => v && setValue('method', v, { shouldValidate: true })}
                items={methodItems}
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {methodItems[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="trxId">{t('employee.collect.trxId', 'TrxID / reference')}</Label>
              <Input id="trxId" {...register('trxId')} />
              {errors.trxId ? (
                <p className="text-destructive text-xs">{te(errors.trxId.message ?? '')}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">{t('employee.collect.note', 'Note')}</Label>
              <Input id="note" {...register('note')} />
              {errors.note ? (
                <p className="text-destructive text-xs">{te(errors.note.message ?? '')}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" render={<Link href="/employee/dashboard" />}>
              {t('employee.collect.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              {t('employee.collect.save', 'Save payment')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

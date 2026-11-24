'use client';

import { useState } from 'react';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { OptionSelect } from '@/features/admin/customers/components/OptionSelect';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import type { CustomerSubscription } from '../api/customer-billing.api';
import { MONTH_NAMES, PAID_VIA_OPTIONS } from '../lib/billing-months';
import { renewSchema, type RenewValues } from '../schemas/renew.schema';
import { useRenewSubscription } from '../hooks/use-customer-subscription';
import { monthNameLabel } from './BillingMonthsTable';

/** New expiry: package validity added to the later of today and the current expiry (`YYYY-MM-DD`). */
export function extendExpiry(expiresAt: string, validityDays: number, now = new Date()): string {
  const current = /^\d{4}-\d{2}-\d{2}/.test(expiresAt)
    ? new Date(`${expiresAt.slice(0, 10)}T00:00:00`)
    : null;
  const base =
    current && current > now ? current : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  base.setDate(base.getDate() + (validityDays > 0 ? validityDays : 30));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
}

const newKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

/** Recharge / extend: new expiry, package, this month's payment and the "Daily Bill Generate" flag. */
export function RenewSubscriptionCard({ sub }: { sub: CustomerSubscription }) {
  const t = useTranslations();
  const renew = useRenewSubscription(sub.customerId);
  const [idempotencyKey, setIdempotencyKey] = useState(newKey);
  const now = new Date();
  const pkg = sub.packages.find((p) => p.id === sub.packageId);

  const form = useForm<RenewValues>({
    resolver: zodResolver(renewSchema) as Resolver<RenewValues>,
    defaultValues: {
      package_id: sub.packageId,
      will_expire: extendExpiry(sub.expiresAt, pkg?.validityDays ?? 30),
      month: MONTH_NAMES[now.getMonth()],
      status: 'successful',
      paid_via: 'Cash',
      method_trx: '',
      note: '',
      daily_bill: sub.dailyBill,
    },
  });
  const status = useWatch({ control: form.control, name: 'status' });
  const err = (k: keyof RenewValues) => form.formState.errors[k]?.message;

  const onSubmit = async (v: RenewValues) => {
    try {
      await renew.mutateAsync({
        will_expire: `${v.will_expire} 23:59:59`,
        ...(v.package_id ? { package_id: Number(v.package_id) } : {}),
        month: v.month,
        status: v.status,
        ...(v.status === 'successful' ? { paid_via: v.paid_via } : {}),
        ...(v.method_trx ? { method_trx: v.method_trx } : {}),
        ...(v.note ? { note: v.note } : {}),
        ...(sub.showDailyBill ? { daily_bill: v.daily_bill ? 1 : 0 } : {}),
        idempotency_key: idempotencyKey,
      });
      setIdempotencyKey(newKey());
    } catch (e) {
      handleApiError(e, form.setError);
    }
  };

  const monthOptions = MONTH_NAMES.map((m, i) => ({ value: m, label: monthNameLabel(i) }));
  const busy = form.formState.isSubmitting || renew.isPending;

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RotateCw className="text-primary h-4 w-4" />{' '}
            {t('admin.customerBilling.renewTitle', 'Recharge / extend')}
          </CardTitle>
          <CardDescription>
            {t(
              'admin.customerBilling.renewHint',
              'Set the new expiry and record this month’s payment.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="renew-package">{t('admin.customerBilling.package', 'Package')}</Label>
            <Controller
              control={form.control}
              name="package_id"
              render={({ field }) => (
                <OptionSelect
                  id="renew-package"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  disabled={busy}
                  options={sub.packages.map((p) => ({
                    value: p.id,
                    label: `${p.name} — ৳${p.price}`,
                  }))}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="renew-expire">
              {t('admin.customerBilling.newExpiry', 'New expiry date')} *
            </Label>
            <Input
              id="renew-expire"
              type="date"
              disabled={busy}
              aria-invalid={Boolean(err('will_expire'))}
              {...form.register('will_expire')}
            />
            {err('will_expire') ? (
              <p className="text-destructive text-xs">{err('will_expire')}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="renew-month">
              {t('admin.customerBilling.paymentMonth', 'Payment month')}
            </Label>
            <Controller
              control={form.control}
              name="month"
              render={({ field }) => (
                <OptionSelect
                  id="renew-month"
                  value={field.value}
                  onChange={field.onChange}
                  options={monthOptions}
                  disabled={busy}
                  invalid={Boolean(err('month'))}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="renew-status">{t('admin.customerBilling.col.status', 'Status')}</Label>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <OptionSelect
                  id="renew-status"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={busy}
                  options={[
                    { value: 'successful', label: t('admin.customerBilling.paid', 'Paid') },
                    { value: 'pending', label: t('admin.customerBilling.due', 'Due') },
                  ]}
                />
              )}
            />
          </div>
          {status === 'successful' ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="renew-method">
                  {t('admin.customerBilling.col.method', 'Payment method')} *
                </Label>
                <Controller
                  control={form.control}
                  name="paid_via"
                  render={({ field }) => (
                    <OptionSelect
                      id="renew-method"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      disabled={busy}
                      invalid={Boolean(err('paid_via'))}
                      options={PAID_VIA_OPTIONS.map((m) => ({ value: m, label: m }))}
                    />
                  )}
                />
                {err('paid_via') ? (
                  <p className="text-destructive text-xs">{err('paid_via')}</p>
                ) : null}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="renew-trx">
                  {t('admin.customerBilling.trx', 'Transaction ID')}
                </Label>
                <Input
                  id="renew-trx"
                  disabled={busy}
                  maxLength={128}
                  {...form.register('method_trx')}
                />
              </div>
            </>
          ) : null}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="renew-note">{t('admin.customerBilling.col.note', 'Note')}</Label>
            <Textarea
              id="renew-note"
              rows={2}
              maxLength={512}
              disabled={busy}
              {...form.register('note')}
            />
          </div>
          {sub.showDailyBill ? (
            <Controller
              control={form.control}
              name="daily_bill"
              render={({ field }) => (
                <Label className="border-border/60 flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 sm:col-span-2">
                  <span>
                    <span className="block text-sm font-medium">
                      {t('admin.customerBilling.dailyBill', 'Daily bill generate')}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {t(
                        'admin.customerBilling.dailyBillHint',
                        'Charge this customer day by day instead of a full month.',
                      )}
                    </span>
                  </span>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(on) => field.onChange(Boolean(on))}
                    disabled={busy}
                  />
                </Label>
              )}
            />
          ) : null}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={busy}>
            {busy
              ? t('admin.customerBilling.saving', 'Saving…')
              : t('admin.customerBilling.renewSubmit', 'Update subscription')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

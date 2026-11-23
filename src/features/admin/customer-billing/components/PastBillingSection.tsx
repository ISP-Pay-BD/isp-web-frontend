'use client';

import { useEffect, useRef } from 'react';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { OptionSelect } from '@/features/admin/customers/components/OptionSelect';
import { useTranslations } from '@/i18n/locale-context';
import { billingTotals, buildTimeline, type BillingMonthRow } from '../lib/billing-months';
import { BillingMonthsTable, BillingTotals } from './BillingMonthsTable';

export interface PastBillingState {
  enabled: boolean;
  count: number;
  rows: BillingMonthRow[];
}

export function initialPastBilling(price = 0): PastBillingState {
  return { enabled: false, count: 5, rows: buildTimeline({ count: 5, price, pastDefaults: true }) };
}

interface PastBillingSectionProps {
  value: PastBillingState;
  onChange: (next: PastBillingState) => void;
  /** Monthly price of the package picked in the form (৳); re-prices every row when it changes. */
  packagePrice: number | null;
  disabled?: boolean;
}

const PRESETS = [3, 5, 6, 12] as const;

/** Add Customer — optional "past billing history": the last N months as paid / due payment rows (PHP `pastBillingModule`). */
export function PastBillingSection({
  value,
  onChange,
  packagePrice,
  disabled,
}: PastBillingSectionProps) {
  const t = useTranslations();
  const price = packagePrice ?? 0;
  const regenerate = (count: number) =>
    onChange({ ...value, count, rows: buildTimeline({ count, price, pastDefaults: true }) });

  // Package changed → every row takes the new monthly price (PHP `syncPrices`).
  const lastPrice = useRef(price);
  useEffect(() => {
    if (lastPrice.current === price) return;
    lastPrice.current = price;
    if (price > 0) onChange({ ...value, rows: value.rows.map((r) => ({ ...r, amount: price })) });
  }, [price, value, onChange]);

  const countOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: t('admin.customerBilling.monthsCount', '{count} months', { count: i + 1 }),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="text-primary h-4 w-4" />{' '}
            {t('admin.customerBilling.pastTitle', 'Past billing history')}
          </CardTitle>
          <CardDescription>
            {t(
              'admin.customerBilling.pastHint',
              'Optional — record months this customer already paid or still owes, saved with the customer.',
            )}
          </CardDescription>
        </div>
        <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <Switch
            checked={value.enabled}
            disabled={disabled}
            onCheckedChange={(on) => onChange({ ...value, enabled: Boolean(on) })}
          />
          {t('admin.customerBilling.addPast', 'Add past billing')}
        </Label>
      </CardHeader>
      {value.enabled ? (
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="past-billing-count" className="text-xs">
                {t('admin.customerBilling.numberOfMonths', 'Number of months')}
              </Label>
              <div className="flex gap-2">
                <OptionSelect
                  id="past-billing-count"
                  value={String(value.count)}
                  onChange={(v) => regenerate(Number(v))}
                  options={countOptions}
                  className="h-9 w-36"
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => regenerate(value.count)}
                  disabled={disabled}
                  aria-label={t('admin.customerBilling.regenerate', 'Rebuild months')}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((n) => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant={value.count === n ? 'default' : 'outline'}
                  onClick={() => regenerate(n)}
                  disabled={disabled}
                >
                  {n === 12
                    ? t('admin.customerBilling.oneYear', '1 year')
                    : t('admin.customerBilling.monthsCount', '{count} months', { count: n })}
                </Button>
              ))}
            </div>
            <div className="ml-auto flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() =>
                  onChange({
                    ...value,
                    rows: value.rows.map((r) => ({ ...r, status: 'successful' })),
                  })
                }
              >
                {t('admin.customerBilling.markAllPaid', 'Mark all paid')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() =>
                  onChange({ ...value, rows: value.rows.map((r) => ({ ...r, status: 'pending' })) })
                }
              >
                {t('admin.customerBilling.markAllDue', 'Mark all due')}
              </Button>
            </div>
          </div>
          {price <= 0 ? (
            <p className="text-muted-foreground text-xs">
              {t(
                'admin.customerBilling.pickPackage',
                'Pick a package to fill each month with its price, or type the amounts.',
              )}
            </p>
          ) : null}
          <BillingMonthsTable
            rows={value.rows}
            onChange={(rows) => onChange({ ...value, rows })}
            disabled={disabled}
          />
          <BillingTotals {...billingTotals(value.rows)} />
        </CardContent>
      ) : null}
    </Card>
  );
}

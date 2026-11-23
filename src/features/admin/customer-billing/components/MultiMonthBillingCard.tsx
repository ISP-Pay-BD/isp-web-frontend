'use client';

import { useState } from 'react';
import { CalendarRange, Database, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { OptionSelect } from '@/features/admin/customers/components/OptionSelect';
import { useTranslations } from '@/i18n/locale-context';
import {
  billingTotals,
  buildRecordedTimeline,
  buildTimeline,
  nextMonthRow,
  toBillingRecords,
  type BillingMonthRow,
  type ExistingIndex,
} from '../lib/billing-months';
import { useBatchBilling } from '../hooks/use-customer-subscription';
import { BillingMonthsTable, BillingTotals } from './BillingMonthsTable';

const RANGES = [1, 2, 3, 4, 5, 6, 8, 10, 12, 18, 24] as const;
const QUICK = [3, 5, 6, 12] as const;

interface MultiMonthBillingCardProps {
  customerId: string;
  price: number;
  existing: ExistingIndex;
}

type View = { kind: 'range'; count: number } | { kind: 'recorded' };

/**
 * Multi-month billing manager (PHP subscription.php, commit bc2506d): pick a month range, see which months
 * already have a payment on record, tick the months to write and save them in one batch.
 */
export function MultiMonthBillingCard({ customerId, price, existing }: MultiMonthBillingCardProps) {
  const t = useTranslations();
  const batch = useBatchBilling(customerId);
  const [view, setView] = useState<View>({ kind: 'range', count: 5 });
  const build = (v: View) =>
    v.kind === 'recorded'
      ? buildRecordedTimeline(price, existing)
      : buildTimeline({ count: v.count, price, existing });
  const [rows, setRows] = useState<BillingMonthRow[]>(() => build(view));

  const show = (v: View) => {
    setView(v);
    setRows(build(v));
  };

  const selected = rows.filter((r) => r.selected);
  const recordedPaid = rows.filter((r) => r.existing?.status === 'successful').length;
  const recordedDue = rows.filter((r) => r.existing && r.existing.status !== 'successful').length;
  const rangeOptions = RANGES.map((n) => ({
    value: String(n),
    label: t('admin.customerBilling.lastMonths', 'Last {count} months', { count: n }),
  }));

  const save = () =>
    batch.mutate(toBillingRecords(selected), {
      onSuccess: () => setRows((prev) => prev.map((r) => ({ ...r, selected: false }))),
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarRange className="text-primary h-4 w-4" />{' '}
          {t('admin.customerBilling.managerTitle', 'Multi-month billing')}
        </CardTitle>
        <CardDescription>
          {t(
            'admin.customerBilling.managerHint',
            'Record past or advance months in one go. Months already on record are updated, the rest are added.',
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="billing-range" className="text-xs">
              {t('admin.customerBilling.showMonths', 'Show months')}
            </Label>
            <OptionSelect
              id="billing-range"
              value={view.kind === 'range' ? String(view.count) : ''}
              onChange={(v) => show({ kind: 'range', count: Number(v) })}
              options={rangeOptions}
              placeholder={t('admin.customerBilling.allRecorded', 'All recorded')}
              className="h-9 w-44"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((n) => (
              <Button
                key={n}
                type="button"
                size="sm"
                variant={view.kind === 'range' && view.count === n ? 'default' : 'outline'}
                onClick={() => show({ kind: 'range', count: n })}
              >
                {t('admin.customerBilling.lastMonths', 'Last {count} months', { count: n })}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant={view.kind === 'recorded' ? 'default' : 'outline'}
              onClick={() => show({ kind: 'recorded' })}
            >
              <Database className="mr-1 h-3.5 w-3.5" />
              {t('admin.customerBilling.allRecordedCount', 'All recorded ({count})', {
                count: existing.size,
              })}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setRows((prev) => [...prev, nextMonthRow(prev, price, existing)])}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              {t('admin.customerBilling.nextMonth', 'Next month')}
            </Button>
          </div>
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span>
            {t('admin.customerBilling.showing', 'Showing {count} months', { count: rows.length })}
          </span>
          <span className="text-emerald-700 dark:text-emerald-400">
            {t('admin.customerBilling.paidInSystem', '{count} paid on record', {
              count: recordedPaid,
            })}
          </span>
          <span className="text-amber-700 dark:text-amber-400">
            {t('admin.customerBilling.dueInSystem', '{count} due on record', {
              count: recordedDue,
            })}
          </span>
        </div>
        <BillingMonthsTable rows={rows} onChange={setRows} selectable disabled={batch.isPending} />
        <BillingTotals {...billingTotals(selected)} />
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {selected.length
            ? t('admin.customerBilling.selectedCount', '{count} month(s) selected', {
                count: selected.length,
              })
            : t('admin.customerBilling.selectHint', 'Tick or edit a month to include it.')}
        </p>
        <Button type="button" onClick={save} disabled={!selected.length || batch.isPending}>
          <Save className="mr-1.5 h-4 w-4" />
          {batch.isPending
            ? t('admin.customerBilling.saving', 'Saving…')
            : t('admin.customerBilling.saveMonths', 'Save selected months')}
        </Button>
      </CardFooter>
    </Card>
  );
}

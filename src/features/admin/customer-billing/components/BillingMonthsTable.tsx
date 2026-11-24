'use client';

import { Check, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { OptionSelect } from '@/features/admin/customers/components/OptionSelect';
import { dateLocale } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import {
  MONTH_NAMES,
  PAID_VIA_OPTIONS,
  type BillingMonthRow,
  type BillingStatus,
} from '../lib/billing-months';

interface BillingMonthsTableProps {
  rows: BillingMonthRow[];
  onChange: (rows: BillingMonthRow[]) => void;
  /** Subscription manager: rows are picked with a checkbox and show the payment already on record. */
  selectable?: boolean;
  disabled?: boolean;
}

const GRID =
  'md:grid-cols-[minmax(9rem,1.1fr)_minmax(9rem,1fr)_minmax(7rem,0.8fr)_minmax(9rem,1fr)_minmax(9rem,1.2fr)]';
const GRID_SELECT =
  'md:grid-cols-[2rem_minmax(9rem,1.1fr)_minmax(9rem,1fr)_minmax(7rem,0.8fr)_minmax(9rem,1fr)_minmax(9rem,1.2fr)]';

const fmtMonth = (idx: number, year: number, withYear: boolean) =>
  new Intl.DateTimeFormat(dateLocale(), {
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, idx, 1)));

/** "August 2026" in the active language. */
export function monthLabel(row: Pick<BillingMonthRow, 'month' | 'year'>): string {
  const idx = MONTH_NAMES.indexOf(row.month as (typeof MONTH_NAMES)[number]);
  return idx < 0 ? `${row.month} ${row.year}` : fmtMonth(idx, row.year, true);
}

/** "August" in the active language. */
export function monthNameLabel(idx: number): string {
  return fmtMonth(idx, 2000, false);
}

/** Editable month-by-month billing rows: status, amount (৳), payment method and note. Cards on phones, a grid on desktop. */
export function BillingMonthsTable({
  rows,
  onChange,
  selectable = false,
  disabled = false,
}: BillingMonthsTableProps) {
  const t = useTranslations();
  const update = (index: number, patch: Partial<BillingMonthRow>) =>
    onChange(
      rows.map((r, i) =>
        i === index
          ? { ...r, ...patch, selected: selectable ? (patch.selected ?? true) : r.selected }
          : r,
      ),
    );
  const paidViaOptions = PAID_VIA_OPTIONS.map((v) => ({
    value: v,
    label:
      v === 'Cash'
        ? t('admin.customerBilling.cash', 'Cash')
        : v === 'Bank'
          ? t('admin.customerBilling.bankTransfer', 'Bank transfer')
          : v,
  }));
  const grid = selectable ? GRID_SELECT : GRID;

  return (
    <div className="border-border/60 overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <div
            className={cn(
          'bg-muted/40 text-muted-foreground hidden gap-3 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase md:grid',
          grid,
        )}
      >
        {selectable ? (
          <span className="sr-only">{t('admin.customerBilling.select', 'Select')}</span>
        ) : null}
        <span>{t('admin.customerBilling.col.month', 'Billing month')}</span>
        <span>{t('admin.customerBilling.col.status', 'Status')}</span>
        <span>{t('admin.customerBilling.col.amount', 'Amount (৳)')}</span>
        <span>{t('admin.customerBilling.col.method', 'Payment method')}</span>
        <span>{t('admin.customerBilling.col.note', 'Note')}</span>
      </div>
      <ul className="divide-border/60 divide-y">
        {rows.map((row, index) => {
          const paid = row.status === 'successful';
          return (
            <li
              key={row.period}
              className={cn(
                'grid grid-cols-1 items-center gap-3 px-4 py-3 transition-colors duration-200 ease-out sm:grid-cols-2',
                grid,
                paid ? 'bg-emerald-500/[0.04]' : 'bg-amber-500/[0.04]',
                selectable && !row.selected && 'opacity-70',
              )}
            >
              {selectable ? (
                <Checkbox
                  checked={row.selected}
                  disabled={disabled}
                  onCheckedChange={(checked) => update(index, { selected: Boolean(checked) })}
                  aria-label={t('admin.customerBilling.selectMonth', 'Include {month}', {
                    month: monthLabel(row),
                  })}
                />
              ) : null}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-foreground text-sm font-semibold">{monthLabel(row)}</span>
                {row.isCurrentMonth ? (
                  <Badge variant="secondary" tone="info">
                    {t('admin.customerBilling.thisMonth', 'This month')}
                  </Badge>
                ) : null}
                {row.isNextMonth ? (
                  <Badge variant="secondary" tone="info">
                    {t('admin.customerBilling.advance', 'Advance')}
                  </Badge>
                ) : null}
                {row.existing ? (
                  <Badge
                    variant="secondary"
                    tone={row.existing.status === 'successful' ? 'success' : 'warning'}
                  >
                    {row.existing.status === 'successful'
                      ? t('admin.customerBilling.recordedPaid', 'Paid · ৳{amount}', {
                          amount: String(row.existing.amount),
                        })
                      : t('admin.customerBilling.recordedDue', 'Due on record')}
                  </Badge>
                ) : null}
              </div>
              <div
                role="group"
                aria-label={t('admin.customerBilling.col.status', 'Status')}
                className="border-border/60 inline-flex w-fit rounded-lg border p-0.5"
              >
                {(['successful', 'pending'] as BillingStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={disabled}
                    aria-pressed={row.status === s}
                    onClick={() => update(index, { status: s })}
                    className={cn(
                      'inline-flex min-h-8 items-center gap-1 rounded-md px-2.5 text-xs font-semibold transition-colors duration-200 ease-out',
                      row.status === s
                        ? s === 'successful'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-white'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {s === 'successful' ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                    {s === 'successful'
                      ? t('admin.customerBilling.paid', 'Paid')
                      : t('admin.customerBilling.due', 'Due')}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                disabled={disabled}
                value={Number.isFinite(row.amount) ? row.amount : ''}
                onChange={(e) =>
                  update(index, {
                    amount: e.target.value === '' ? Number.NaN : Number(e.target.value),
                  })
                }
                aria-label={t('admin.customerBilling.amountFor', 'Amount for {month}', {
                  month: monthLabel(row),
                })}
                className="h-9 font-mono tabular-nums"
              />
              <OptionSelect
                value={paid ? row.paidVia : ''}
                onChange={(v) => update(index, { paidVia: v })}
                options={paidViaOptions}
                placeholder={
                  paid
                    ? t('admin.customerBilling.method', 'Method')
                    : t('admin.customerBilling.notPaid', 'Not paid')
                }
                disabled={disabled || !paid}
                className="h-9 w-full"
              />
              <Input
                disabled={disabled}
                value={row.comment}
                maxLength={255}
                onChange={(e) => update(index, { comment: e.target.value })}
                placeholder={t('admin.customerBilling.notePlaceholder', 'Trx ID or note')}
                aria-label={t('admin.customerBilling.noteFor', 'Note for {month}', {
                  month: monthLabel(row),
                })}
                className="h-9"
              />
            </li>
          );
        })}
      </ul>
        </div>
      </div>
    </div>
  );
}

/** Paid / due counts and totals under the month rows. */
export function BillingTotals({
  paidCount,
  paidAmount,
  dueCount,
  dueAmount,
}: {
  paidCount: number;
  paidAmount: number;
  dueCount: number;
  dueAmount: number;
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <p className="text-emerald-700 dark:text-emerald-400">
        <span className="font-semibold">
          {t('admin.customerBilling.paidSummary', '{count} paid', { count: paidCount })}
        </span>{' '}
        · <CurrencyDisplay amount={paidAmount} />
      </p>
      <p className="text-amber-700 dark:text-amber-400">
        <span className="font-semibold">
          {t('admin.customerBilling.dueSummary', '{count} due', { count: dueCount })}
        </span>{' '}
        · <CurrencyDisplay amount={dueAmount} />
      </p>
    </div>
  );
}

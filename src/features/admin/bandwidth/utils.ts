import { ApiError } from '@/lib/api/client';
import { formatDate } from '@/lib/format';
import type { useTranslations } from '@/i18n/locale-context';

export type Translate = ReturnType<typeof useTranslations>;

/** Backend validation `details` (e.g. `items.0.qty`) as one message per field. */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.details) return {};
  const out: Record<string, string> = {};
  for (const [field, msg] of Object.entries(error.details)) {
    const text = Array.isArray(msg) ? msg[0] : msg;
    if (text) out[field] = String(text);
  }
  return out;
}

/** Local calendar date as YYYY-MM-DD. */
export function isoDay(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** First day of the current month as YYYY-MM-DD. */
export function monthStartIso(date = new Date()): string {
  return isoDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

/** A stored YYYY-MM-DD date in the active language, or "—". */
export function dayText(value: string): string {
  return value ? formatDate(value) : '—';
}

/** "1 Oct 2026 → 31 Oct 2026", one side, or "—". */
export function periodLabel(from: string, to: string): string {
  if (from && to) return `${dayText(from)} → ${dayText(to)}`;
  return dayText(from || to);
}

/** Client-side CSV of rows that are already fully loaded. */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const cell = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(cell).join(',')).join('\n');
  const href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

/** Cash / bank transfer / cheque are translated; wallet and gateway names (bKash, Nagad…) keep their own label. */
export function paymentMethodLabel(t: Translate, value: string, label = value): string {
  switch (value.trim().toLowerCase().replace(/\s+/g, '_')) {
    case 'cash':
      return t('admin.bandwidth.method.cash', 'Cash');
    case 'bank_transfer':
      return t('admin.bandwidth.method.bankTransfer', 'Bank Transfer');
    case 'cheque':
      return t('admin.bandwidth.method.cheque', 'Cheque');
    default:
      return label;
  }
}

export function paidDueLabel(t: Translate, paid: boolean): string {
  return paid ? t('status.paid', 'Paid') : t('admin.bandwidth.shared.due', 'Due');
}

export function activeLabel(t: Translate, active: boolean): string {
  return active ? t('status.active', 'Active') : t('admin.bandwidth.shared.inactive', 'Inactive');
}

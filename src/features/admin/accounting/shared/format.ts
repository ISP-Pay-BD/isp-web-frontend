import { formatBdt } from '@/lib/format';

/** ৳ amount with the sign before the symbol (-৳1,200). */
export function money(amount: number): string {
  return amount < 0 ? `-৳${formatBdt(-amount)}` : `৳${formatBdt(amount)}`;
}

/** `part` as a percentage of `whole` (1 decimal), or null when `whole` is 0. */
export function percentOf(part: number, whole: number): string | null {
  if (!whole) return null;
  return `${((part / whole) * 100).toFixed(1)}%`;
}

/** "employee_payment" → "Employee payment". */
export function humanize(value: string): string {
  const s = value.replace(/[_-]+/g, ' ').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

/** First 10 chars of a backend date/datetime ("2026-10-11 09:30:00" → "2026-10-11"). */
export function ymd(value: string): string {
  return value ? value.slice(0, 10) : '';
}

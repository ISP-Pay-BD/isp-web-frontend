import { formatDate, formatDateTime } from '@/lib/format';

/** Backend 'Y-m-d H:i:s' → Date (space form is not parsed by every browser). */
function toDate(value: string): Date {
  return new Date(/^\d{4}-\d{2}-\d{2} \d/.test(value) ? value.replace(' ', 'T') : value);
}

/** Date + time for backend timestamps; raw text when it is not a date (e.g. ticket thread stamps). */
export function platformDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = toDate(value);
  return Number.isNaN(d.getTime()) ? value : formatDateTime(d);
}

export function platformDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = toDate(value);
  return Number.isNaN(d.getTime()) ? value : formatDate(d);
}

/** ৳ axis ticks: 1.2M / 340K / 900. */
export function compactBdt(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `৳${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `৳${(value / 1_000).toFixed(0)}K`;
  return `৳${Math.round(value)}`;
}

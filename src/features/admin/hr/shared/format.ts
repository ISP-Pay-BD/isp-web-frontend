import { digitsOnly } from '@/lib/format';

/** Backend datetimes are `YYYY-MM-DD HH:MM:SS` (server local time). */
const DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/;

export function datePart(value: string | null | undefined): string {
  const m = DATETIME_RE.exec(value ?? '');
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
}

/** `09:05 AM` from a backend datetime (or bare `HH:MM[:SS]`); '' when absent. */
export function formatClock(value: string | null | undefined): string {
  if (!value) return '';
  const m = DATETIME_RE.exec(value);
  let hh: number;
  let mm: string;
  if (m && m[4] !== undefined) {
    hh = Number(m[4]);
    mm = m[5]!;
  } else {
    const t = /^(\d{1,2}):(\d{2})/.exec(value);
    if (!t) return '';
    hh = Number(t[1]);
    mm = t[2]!;
  }
  const suffix = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${String(h12).padStart(2, '0')}:${mm} ${suffix}`;
}

function toMs(value: string): number | null {
  const m = DATETIME_RE.exec(value);
  if (!m || m[4] === undefined) return null;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0));
}

/** `9h 15m` between two backend datetimes; '' when either is missing. */
export function formatDuration(from: string | null | undefined, to: string | null | undefined): string {
  if (!from || !to) return '';
  const a = toMs(from);
  const b = toMs(to);
  if (a === null || b === null || b < a) return '';
  const mins = Math.round((b - a) / 60000);
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/** `YYYY-MM-DDTHH:MM` for <input type="datetime-local"> from a backend datetime. */
export function toLocalInput(value: string | null | undefined): string {
  const m = DATETIME_RE.exec(value ?? '');
  return m && m[4] !== undefined ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}` : '';
}

/** Backend `Y-m-d H:i:s` from a datetime-local value. */
export function fromLocalInput(value: string): string {
  return value ? `${value.replace('T', ' ')}:00` : '';
}

/**
 * Employee mobiles are stored as `8801XXXXXXXXX` (the web edit form enforces
 * it). Accepts 01…, 8801…, +8801… and returns the 13-digit form, or the raw
 * digits when it is not a BD mobile (the backend then reports the error).
 */
export function toBdMobile880(value: string): string {
  const d = digitsOnly(value);
  if (/^8801\d{9}$/.test(d)) return d;
  if (/^01\d{9}$/.test(d)) return `88${d}`;
  return d;
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '—'
  );
}

export function titleCase(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Current month name + year, matching the backend payroll month format. */
export function currentPayPeriod(now = new Date()): { month: string; year: number } {
  return { month: now.toLocaleString('en-US', { month: 'long' }), year: now.getFullYear() };
}

/** Today as YYYY-MM-DD in the browser's local time. */
export function todayIso(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

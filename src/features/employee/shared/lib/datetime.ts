import { dateLocale } from '@/lib/format';

/** Backend datetimes are `YYYY-MM-DD HH:MM:SS` (server local time) — read the parts as-is, never shift timezones. */
const RE = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/;
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

function parse(value: string | null | undefined): { date: Date; hasTime: boolean } | null {
  const m = RE.exec(value ?? '');
  if (!m) return null;
  const hasTime = m[4] !== undefined;
  return { date: new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0))), hasTime };
}

const intl = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(dateLocale(), { timeZone: 'UTC', ...options }).format(date);

export function formatDay(value: string | null | undefined): string {
  const p = parse(value);
  return p ? intl(p.date, { day: '2-digit', month: 'short', year: 'numeric' }) : '';
}

export function formatTime(value: string | null | undefined): string {
  const p = parse(value);
  if (!p?.hasTime) return '';
  return intl(p.date, { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\b(am|pm)\b/, (s) => s.toUpperCase());
}

export function formatDayTime(value: string | null | undefined): string {
  return [formatDay(value), formatTime(value)].filter(Boolean).join(', ');
}

/** The API sends month names in English ("March"); show them in the active language and leave anything else as is. */
export function formatMonthName(value: string | null | undefined): string {
  const raw = (value ?? '').trim();
  const index = MONTHS.indexOf(raw.toLowerCase());
  return index === -1 ? raw : intl(new Date(Date.UTC(2000, index, 1)), { month: 'long' });
}

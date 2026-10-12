/** Backend datetimes are `YYYY-MM-DD HH:MM:SS` (server local time) — format without timezone shifts. */
const RE = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDay(value: string | null | undefined): string {
  const m = RE.exec(value ?? '');
  return m ? `${m[3]} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : '';
}

export function formatTime(value: string | null | undefined): string {
  const m = RE.exec(value ?? '');
  if (!m || m[4] === undefined) return '';
  const hh = Number(m[4]);
  return `${String(hh % 12 === 0 ? 12 : hh % 12).padStart(2, '0')}:${m[5]} ${hh >= 12 ? 'PM' : 'AM'}`;
}

export function formatDayTime(value: string | null | undefined): string {
  const d = formatDay(value);
  const t = formatTime(value);
  return [d, t].filter(Boolean).join(', ');
}

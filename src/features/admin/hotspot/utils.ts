import { saveBlob } from '@/lib/api/client';

/** Byte counter → "12.4 MB" (RouterOS counters are raw bytes). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** i;
  return `${value >= 100 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

/** Save rows as a CSV file (cells quoted, so commas/quotes in names are safe). */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(cell).join(',')).join('\n');
  saveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename);
}

/** Local calendar date as Y-m-d (the report's from/to filter). */
export function ymd(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

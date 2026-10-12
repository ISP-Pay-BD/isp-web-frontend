import { ApiError } from '@/lib/api/client';

/** First backend validation message (ApiError.details) for any of `keys`. */
export function fieldError(error: unknown, ...keys: string[]): string | undefined {
  if (!(error instanceof ApiError) || !error.details) return undefined;
  for (const key of keys) {
    const v = error.details[key];
    if (Array.isArray(v) ? v.length > 0 : v) return Array.isArray(v) ? String(v[0]) : String(v);
  }
  return undefined;
}

/** Inline field error under an input. */
export function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null;
}

/** "2026-10-11 09:30:00" → "2026-10-11 09:30"; empty → "—". */
export function fmtDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return value.replace('T', ' ').slice(0, 16);
}

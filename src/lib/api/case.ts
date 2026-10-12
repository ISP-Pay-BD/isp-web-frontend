/**
 * The zapi backend answers in snake_case; the UI types are camelCase.
 * `camelizeKeys` converts a payload deeply so adapters can map 1:1.
 */
type CamelCase<S extends string> = S extends `${infer H}_${infer T}` ? `${H}${Capitalize<CamelCase<T>>}` : S;

export type Camelized<T> = T extends Array<infer U>
  ? Camelized<U>[]
  : T extends Record<string, unknown>
    ? { [K in keyof T as K extends string ? CamelCase<K> : K]: Camelized<T[K]> }
    : T;

export function toCamel(key: string): string {
  return key.replace(/_+([a-z0-9])/gi, (_, c: string) => c.toUpperCase());
}

export function camelizeKeys<T = unknown>(value: unknown): T {
  if (Array.isArray(value)) return value.map((v) => camelizeKeys(v)) as T;
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[toCamel(k)] = camelizeKeys(v);
    return out as T;
  }
  return value as T;
}

export function toSnake(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

/** Shallow camel→snake for request bodies (backend validators read snake_case). */
export function snakeizeKeys<T extends Record<string, unknown>>(value: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) if (v !== undefined) out[toSnake(k)] = v;
  return out;
}

/** Number coercion for backend numeric strings ("1200.00", null, "--"). */
export function num(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

/** String coercion that keeps empty values empty (never "null"/"undefined"). */
export function str(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  const s = String(value);
  return s === 'null' || s === 'undefined' ? fallback : s;
}

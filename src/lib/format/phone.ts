/** Bangladesh phone helpers (01XXXXXXXXX) */

/** Digits only */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Normalize BD mobile to 11 digits starting with 01.
 * Accepts +8801…, 8801…, 01…
 */
export function normalizeBdPhone(value: string): string {
  let d = digitsOnly(value);
  if (d.startsWith('880') && d.length >= 13) d = d.slice(2);
  if (d.startsWith('0') === false && d.length === 10) d = `0${d}`;
  return d;
}

/** Display: 01712-345678 */
export function formatBdPhone(value: string): string {
  const d = normalizeBdPhone(value);
  if (d.length !== 11) return value;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

/** Valid BD mobile (01[3-9]XXXXXXXX) */
export function isValidBdPhone(value: string): boolean {
  return /^01[3-9]\d{8}$/.test(normalizeBdPhone(value));
}

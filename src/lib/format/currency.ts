/** Currency (BDT ৳) and count formatters for ISP Pay BD. Grouping is lakh/crore (48,25,000). */
import { numberLocale } from './locale';

const cache = new Map<string, Intl.NumberFormat>();

function formatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const locale = numberLocale();
  const key = `${locale}|${JSON.stringify(options)}`;
  let nf = cache.get(key);
  if (!nf) {
    nf = new Intl.NumberFormat(locale, options);
    cache.set(key, nf);
  }
  return nf;
}

export function formatBdt(amount: number, options?: { fractionDigits?: number }): string {
  const digits = options?.fractionDigits ?? 2;
  return formatter({ minimumFractionDigits: 0, maximumFractionDigits: digits }).format(amount);
}

export function formatBdtWithSymbol(amount: number): string {
  return `${CURRENCY_SYMBOL}${formatBdt(amount)}`;
}

/** Short money for tight spots such as dashboard KPIs: ৳48L, ৳1.2Cr. */
export function formatBdtCompact(amount: number): string {
  return `${CURRENCY_SYMBOL}${formatter({ notation: 'compact', maximumFractionDigits: 1 }).format(amount)}`;
}

/** Whole-number counts (customers, tickets, points) with the same grouping as money. */
export function formatCount(value: number): string {
  return formatter({ maximumFractionDigits: 0 }).format(value);
}

/** Options for `NumberFlow` (pair with `locales={numberLocale()}`): 4825000 -> 48L. */
export const COMPACT_FORMAT = { notation: 'compact', maximumFractionDigits: 1 } as const;

export const CURRENCY_SYMBOL = '৳' as const;
export const CURRENCY_CODE = 'BDT' as const;

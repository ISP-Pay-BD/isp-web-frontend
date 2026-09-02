/** Currency (BDT ৳) formatters for ISP Pay BD */
export function formatBdt(amount: number, options?: { fractionDigits?: number }): string {
  const digits = options?.fractionDigits ?? 2;
  return new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(amount);
}

export function formatBdtWithSymbol(amount: number): string {
  return `৳${formatBdt(amount)}`;
}

export const CURRENCY_SYMBOL = '৳' as const;
export const CURRENCY_CODE = 'BDT' as const;

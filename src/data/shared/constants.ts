export const APP_NAME = 'ISP Pay BD';
export const CURRENCY_SYMBOL = '৳';
export const DEFAULT_TENANT_ID = 'tenant_demo';
export const DEFAULT_TENANT_NAME = 'Demo ISP Network';

export const DEMO_PASSWORD = 'demo1234';

/** Format BDT amounts for display */
export function formatBdt(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-BD')}`;
}

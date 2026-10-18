/** Query keys of the bandwidth buy/sell screens (all under ['admin', 'bandwidth']). */
export const bandwidthKeys = {
  all: ['admin', 'bandwidth'] as const,
  categories: ['admin', 'bandwidth', 'categories'] as const,
  items: ['admin', 'bandwidth', 'items'] as const,
  providers: ['admin', 'bandwidth', 'providers'] as const,
  providerList: (params: Record<string, unknown>) => ['admin', 'bandwidth', 'providers', 'list', params] as const,
  providerOptions: ['admin', 'bandwidth', 'providers', 'options'] as const,
  bills: ['admin', 'bandwidth', 'purchase-bills'] as const,
  billList: (params: Record<string, unknown>) => ['admin', 'bandwidth', 'purchase-bills', params] as const,
  clients: ['admin', 'bandwidth', 'clients'] as const,
  clientList: (params: Record<string, unknown>) => ['admin', 'bandwidth', 'clients', 'list', params] as const,
  clientOptions: ['admin', 'bandwidth', 'clients', 'options'] as const,
  invoices: ['admin', 'bandwidth', 'invoices'] as const,
  invoiceList: (params: Record<string, unknown>) => ['admin', 'bandwidth', 'invoices', 'list', params] as const,
  invoiceDetail: (rid: string) => ['admin', 'bandwidth', 'invoices', 'detail', rid] as const,
  dailyBill: ['admin', 'bandwidth', 'daily-bill'] as const,
  dailyBillList: (params: Record<string, unknown>) => ['admin', 'bandwidth', 'daily-bill', params] as const,
};

/** Drops empty filter values so they are neither sent nor part of the cache key. */
export function compact(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
}

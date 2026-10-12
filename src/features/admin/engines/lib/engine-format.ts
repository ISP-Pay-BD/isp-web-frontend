import { formatBdtWithSymbol } from '@/lib/format';
import type { EngineCatalogItem, EngineInstance } from '../types';

/** "Free" when 0, else "৳1,200 / monthly" (billing cycle from the catalog row). */
export function enginePriceLabel(item: Pick<EngineCatalogItem, 'priceBdt' | 'billingCycle'>): string {
  if (item.priceBdt <= 0) return 'Free';
  const price = formatBdtWithSymbol(item.priceBdt);
  return item.billingCycle ? `${price} / ${item.billingCycle}` : price;
}

export function instanceStatusLabel(instance: EngineInstance | null): string {
  if (!instance) return 'Not enabled';
  return instance.status === 'enabled' ? 'Enabled' : 'Disabled';
}

/** Backend 'Y-m-d H:i:s' (server time) shown as-is to the minute; '—' when empty. */
export function engineDate(value: string | null): string {
  return value ? value.replace('T', ' ').slice(0, 16) : '—';
}

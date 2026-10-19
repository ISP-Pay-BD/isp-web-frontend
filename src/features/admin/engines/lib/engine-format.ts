import { formatBdtWithSymbol } from '@/lib/format';
import type { useTranslations } from '@/i18n/locale-context';
import type { EngineCatalogItem, EngineInstance } from '../types';

type Translate = ReturnType<typeof useTranslations>;

/** "Free" when 0, else "৳1,200 / monthly" (billing cycle from the catalog row). */
export function enginePriceLabel(t: Translate, item: Pick<EngineCatalogItem, 'priceBdt' | 'billingCycle'>): string {
  if (item.priceBdt <= 0) return t('common.free', 'Free');
  const price = formatBdtWithSymbol(item.priceBdt);
  if (!item.billingCycle) return price;
  const cycle = t(`admin.engines.cycle.${item.billingCycle.toLowerCase().replace(/[^a-z]+/g, '_')}`, item.billingCycle);
  return `${price} / ${cycle}`;
}

export function instanceStatusLabel(t: Translate, instance: EngineInstance | null): string {
  if (!instance) return t('admin.engines.notEnabled', 'Not enabled');
  return instance.status === 'enabled' ? t('status.enabled', 'Enabled') : t('status.disabled', 'Disabled');
}

/** Backend 'Y-m-d H:i:s' (server time) shown as-is to the minute; '—' when empty. */
export function engineDate(value: string | null): string {
  return value ? value.replace('T', ' ').slice(0, 16) : '—';
}

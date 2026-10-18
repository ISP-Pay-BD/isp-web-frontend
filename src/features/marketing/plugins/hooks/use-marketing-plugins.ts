'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { camelizeKeys, num, str } from '@/lib/api/case';
import { useTranslations } from '@/i18n/locale-context';
import { formatBdtWithSymbol } from '@/lib/format';
import type { PluginRequestInput, PublicPlugin, PublicPluginsParams, PublicPluginsResult } from '../types';

const PER_PAGE = 50;

function strOrNull(value: unknown): string | null {
  const s = str(value);
  return s === '' ? null : s;
}

/** Single mapper for `PluginCatalog::toItem` rows. */
export function toPublicPlugin(value: unknown): PublicPlugin {
  const r = camelizeKeys<Record<string, unknown>>(value) ?? {};
  return {
    id: str(r.id),
    slug: str(r.slug),
    name: str(r.name),
    category: str(r.category, 'General'),
    description: str(r.description),
    imageUrl: strOrNull(r.imageUrl),
    priceBdt: num(r.priceBdt),
    priceType: strOrNull(r.priceType),
    billingCycle: strOrNull(r.billingCycle),
  };
}

/** GET /v1/public/plugins — published plugins, server search + category. */
export function usePublicPlugins(params: PublicPluginsParams) {
  return useQuery({
    queryKey: ['marketing', 'plugins', params],
    queryFn: async ({ signal }): Promise<PublicPluginsResult> => {
      const res = await http.getPage<unknown>(
        '/v1/public/plugins',
        {
          search: params.search || undefined,
          category: params.category || undefined,
          page: params.page,
          per_page: PER_PAGE,
        },
        { signal },
      );
      const categories = Array.isArray(res.raw.categories)
        ? res.raw.categories.map((c) => str(c)).filter(Boolean)
        : [];
      return {
        items: res.items.map(toPublicPlugin),
        total: res.meta.total,
        page: res.meta.page,
        totalPages: res.meta.totalPages,
        categories,
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** GET /v1/public/plugins/{slug} — 404 ApiError when the plugin is not published. */
export function usePublicPlugin(slug: string) {
  return useQuery({
    queryKey: ['marketing', 'plugin', slug],
    queryFn: async ({ signal }) =>
      toPublicPlugin(await http.get<unknown>(`/v1/public/plugins/${encodeURIComponent(slug)}`, undefined, signal)),
    enabled: slug !== '',
  });
}

/** POST /v1/public/plugins/{slug}/request → 201 { id, message }. */
export function useRequestPlugin(slug: string) {
  return useMutation({
    // The form maps 422 field errors + toasts via handleApiError — skip the global toast.
    meta: { silent: true },
    mutationFn: async (input: PluginRequestInput) => {
      const res = await http.post<{ id?: unknown; message?: unknown }>(
        `/v1/public/plugins/${encodeURIComponent(slug)}/request`,
        {
          name: input.name,
          phone: input.phone,
          email: input.email || undefined,
          company: input.company || undefined,
          message: input.message || undefined,
        },
      );
      return { id: str(res?.id), message: str(res?.message) };
    },
  });
}

type Translate = ReturnType<typeof useTranslations>;

/** Billing cycle is free text from the catalog: known values are translated, anything else is shown as entered. */
function cycleLabel(t: Translate, cycle: string): string {
  switch (cycle.toLowerCase().replace(/[^a-z]/g, '')) {
    case 'monthly':
      return t('marketing.pluginDetail.cycleMonthly', 'monthly');
    case 'quarterly':
      return t('marketing.pluginDetail.cycleQuarterly', 'quarterly');
    case 'yearly':
    case 'annual':
    case 'annually':
      return t('marketing.pluginDetail.cycleYearly', 'yearly');
    case 'onetime':
      return t('marketing.pluginDetail.cycleOneTime', 'one-time');
    default:
      return cycle;
  }
}

/** "Free" when 0, else "৳2,500 / monthly". */
export function pluginPriceLabel(t: Translate, plugin: Pick<PublicPlugin, 'priceBdt' | 'billingCycle'>): string {
  if (plugin.priceBdt <= 0) return t('common.free', 'Free');
  const price = formatBdtWithSymbol(plugin.priceBdt);
  return plugin.billingCycle ? `${price} / ${cycleLabel(t, plugin.billingCycle)}` : price;
}

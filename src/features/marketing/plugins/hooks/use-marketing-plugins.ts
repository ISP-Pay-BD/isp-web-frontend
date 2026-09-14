'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { pluginsMarketplaceFull, pluginCategories } from '@/data/marketing/plugins.data';

/** Row shape returned by GET /v1/platform/plugins (`PlatformCatalogController::plugins`). */
interface BackendPluginRow {
  id: string;
  name: string;
  category: string;
  desc: string;
  image?: string | null;
  installed?: boolean;
  priceBdt?: number;
  installs?: number;
}

function isBackendPluginPayload(value: unknown): value is { items: BackendPluginRow[] } {
  return (
    !!value &&
    typeof value === 'object' &&
    'items' in value &&
    Array.isArray((value as { items: unknown }).items) &&
    (value as { items: unknown[] }).items.every(
      (item) => !!item && typeof item === 'object' && 'name' in item,
    )
  );
}

export function useMarketingPlugins() {
  return useQuery({
    queryKey: ['marketing', 'plugins'],
    queryFn: async () => {
      try {
        const raw = await http.get<unknown>('/v1/platform/plugins');
        if (isBackendPluginPayload(raw)) {
          const plugins = raw.items.map((item, index) => ({
            // Keep the marketplace card contract: static-content fields the
            // backend does not track (tagline / features) stay as content.
            ...pluginsMarketplaceFull[index % pluginsMarketplaceFull.length],
            id: item.id,
            name: item.name,
            category: item.category,
            desc: item.desc,
            priceBdt: item.priceBdt ?? 0,
            installs: item.installs ?? 0,
          }));
          const categories = Array.from(
            new Set(['All', ...plugins.map((p) => p.category)]),
          );
          return { plugins, categories };
        }
        // Shape mismatch: static marketplace content, not a fake API result.
        return { plugins: pluginsMarketplaceFull, categories: pluginCategories };
      } catch {
        // Backend unreachable: static marketplace content fallback.
        return { plugins: pluginsMarketplaceFull, categories: pluginCategories };
      }
    },
  });
}

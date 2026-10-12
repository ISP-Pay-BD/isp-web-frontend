'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { str } from '@/lib/api/case';

export interface ShowcaseImage {
  id: string;
  url: string;
  caption: string;
}

export interface ShowcaseCategory {
  id: string;
  name: string;
  slug: string;
  target: 'website' | 'mobile' | string;
  bullets: string[];
  images: ShowcaseImage[];
}

/** GET /v1/reseller/showcase — platform-managed galleries, read-only for tenants. */
export function useProductShowcase(params: { page: number; pageSize: number; target?: string }) {
  return useQuery({
    queryKey: ['admin', 'product-showcase', params],
    queryFn: async () => {
      const res = await http.getPage<Record<string, unknown>>('/v1/reseller/showcase', {
        page: params.page,
        per_page: params.pageSize,
        target: params.target || undefined,
      });
      return {
        meta: res.meta,
        items: res.items.map(
          (c): ShowcaseCategory => ({
            id: str(c.id),
            name: str(c.name),
            slug: str(c.slug),
            target: str(c.target),
            bullets: Array.isArray(c.bullets) ? (c.bullets as unknown[]).map((b) => str(b)) : [],
            images: Array.isArray(c.images)
              ? (c.images as Record<string, unknown>[]).map((i) => ({ id: str(i.id), url: str(i.url), caption: str(i.caption) }))
              : [],
          }),
        ),
      };
    },
    placeholderData: keepPreviousData,
  });
}

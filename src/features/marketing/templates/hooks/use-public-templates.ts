'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

export interface PublicTemplate {
  id: string;
  title: string;
  category: string;
  technology: string;
  demoUrl: string | null;
  image: string | null;
  priceType: string;
  price: number;
  description: string;
  features: string[];
  isFeatured: boolean;
}

function toPublicTemplate(value: unknown): PublicTemplate {
  const r = (value ?? {}) as Record<string, unknown>;
  const demo = str(r.demo_url).trim();
  const image = str(r.image).trim();
  return {
    id: str(r.id),
    title: str(r.title),
    category: str(r.category),
    technology: str(r.technology),
    demoUrl: /^https?:\/\//i.test(demo) ? demo : null,
    // Legacy PHP file names (no host) cannot load on this site.
    image: /^(https?:)?\/\//i.test(image) || image.startsWith('/') ? image : null,
    priceType: str(r.price_type, 'Free'),
    price: num(r.price),
    description: str(r.description),
    features: str(r.features)
      .split(/\r?\n/)
      .map((f) => f.trim())
      .filter(Boolean),
    isFeatured: r.is_featured === true || r.is_featured === 1,
  };
}

/** GET /v1/public/templates — visible templates, sorted by the catalogue order. Filtered by category client-side. */
export function usePublicTemplates() {
  return useQuery({
    queryKey: ['marketing', 'templates'],
    queryFn: async ({ signal }) => {
      const res = await http.get<unknown>('/v1/public/templates', undefined, signal);
      return Array.isArray(res) ? res.map(toPublicTemplate) : [];
    },
  });
}

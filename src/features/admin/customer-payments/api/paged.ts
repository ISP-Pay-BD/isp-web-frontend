import { apiClient } from '@/lib/api/client';
import { num } from '@/lib/api/case';
import type { PageMeta } from '@/lib/api/types';

/**
 * Paginated list whose envelope also carries a whole-set summary in
 * `meta.summary` (customer payments, cash book, usage, BTRC, platform
 * payments). `http.getPage` keeps the page meta but drops that summary.
 */
export interface PagedWithSummary<TRaw> {
  items: TRaw[];
  meta: PageMeta;
  summary: Record<string, unknown> | null;
}

/** Drop empty / "all" filters so the backend never sees `status=all&search=`. */
export function cleanParams(params?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === 'all') continue;
    out[key] = value;
  }
  return out;
}

export async function getPagedWithSummary<TRaw = Record<string, unknown>>(
  url: string,
  params?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<PagedWithSummary<TRaw>> {
  const res = await apiClient.get(url, { params: cleanParams(params), signal });
  const body = (res.data ?? {}) as { data?: unknown; meta?: Record<string, unknown>; pagination?: Record<string, unknown> };
  const items = Array.isArray(body.data) ? (body.data as TRaw[]) : [];
  const m = body.meta ?? body.pagination ?? {};
  const perPage = num(m.per_page ?? m.perPage, items.length || 20);
  const total = num(m.total, items.length);
  return {
    items,
    meta: {
      total,
      page: num(m.page, 1),
      perPage,
      totalPages: num(m.total_pages ?? m.totalPages, Math.max(1, Math.ceil(total / Math.max(1, perPage)))),
    },
    summary: m.summary && typeof m.summary === 'object' ? (m.summary as Record<string, unknown>) : null,
  };
}

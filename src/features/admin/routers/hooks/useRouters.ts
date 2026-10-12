import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { mapRouter } from '../types';

export const routerKeys = {
  all: ['admin', 'routers'] as const,
  list: (params: Record<string, unknown>) => ['admin', 'routers', 'list', params] as const,
  options: ['admin', 'routers', 'options'] as const,
  detail: (id: string) => ['admin', 'routers', 'detail', id] as const,
};

export interface RouterListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/** Paginated admin router list (active + inactive). */
export function useRouters({ page, pageSize, search }: RouterListParams) {
  const params = { page, limit: pageSize, search: search || undefined, status: 'all' };
  return useQuery({
    queryKey: routerKeys.list(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/routers', params);
      return { items: res.items.map(mapRouter), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/**
 * Active routers for pickers/dropdowns (hotspot, queues, walled garden, radius…).
 *
 * `ownedOnly` is for pages that manage the router itself (RADIUS setup, queues): it lists just
 * the routers the caller owns, because the API refuses to manage anyone else's. The default
 * picker list also offers a POP the router its parent ISP assigned it, for assigning customers.
 */
export function useRouterOptions({ ownedOnly = false }: { ownedOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ownedOnly ? [...routerKeys.options, 'owned'] : routerKeys.options,
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/routers', { limit: 100, ...(ownedOnly ? { status: 'all' } : {}) });
      const rows = res.items.map(mapRouter);
      return ownedOnly ? rows.filter((r) => r.status === 'active') : rows;
    },
    staleTime: 5 * 60_000,
  });
}

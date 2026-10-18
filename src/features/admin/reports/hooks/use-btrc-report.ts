'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { http, saveBlob } from '@/lib/api/client';
import { getResellerId } from '@/lib/api/auth-utils';
import { num, str } from '@/lib/api/case';
import { cleanParams, getPagedWithSummary } from '@/features/admin/customer-payments/api/paged';

export interface BtrcSubscriber {
  id: string;
  clientName: string;
  mobile: string;
  email: string;
  packageName: string;
  bandwidth: string;
  priceBdt: number | null;
  area: string;
  connectionType: string;
  clientType: string;
  status: string;
  createdAt: string;
}

export interface BtrcSummary {
  subscribers: number;
  active: number;
  declaredRevenueBdt: number;
  byClientType: Record<string, number>;
}

export interface BtrcFilters {
  page: number;
  pageSize: number;
  search: string;
  status: string;
  clientType: string;
  areaId: string;
}

type Raw = Record<string, unknown>;

function toParams(f: Omit<BtrcFilters, 'page' | 'pageSize'>) {
  return { search: f.search, status: f.status, client_type: f.clientType, area_id: f.areaId };
}

/** GET /v1/reports/btrc — server-paginated subscriber census + whole-set summary. */
export function useBtrcReport(filters: BtrcFilters) {
  return useQuery({
    queryKey: ['admin', 'reports', 'btrc', filters],
    queryFn: async ({ signal }) => {
      const res = await getPagedWithSummary<Raw>(
        '/v1/reports/btrc',
        { page: filters.page, per_page: filters.pageSize, ...toParams(filters) },
        signal,
      );
      const s = res.summary ?? {};
      const byType = (s.by_client_type && typeof s.by_client_type === 'object' ? s.by_client_type : {}) as Record<string, unknown>;
      const summary: BtrcSummary = {
        subscribers: num(s.subscribers, res.meta.total),
        active: num(s.active),
        declaredRevenueBdt: num(s.declared_revenue),
        byClientType: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, num(v)])),
      };
      const items = res.items.map(
        (r): BtrcSubscriber => ({
          id: str(r.id),
          clientName: str(r.name),
          mobile: str(r.mobile),
          email: str(r.email),
          packageName: str(r.package_name),
          bandwidth: str(r.bandwidth),
          priceBdt: r.price === null || r.price === undefined || r.price === '' ? null : num(r.price),
          area: str(r.area_name),
          connectionType: str(r.connection_type),
          clientType: str(r.client_type),
          status: str(r.status),
          createdAt: str(r.created_at),
        }),
      );
      return { items, meta: res.meta, summary };
    },
    placeholderData: keepPreviousData,
  });
}

/** Service areas for the filter (GET /v1/reseller/areas/{rid}). */
export function useAreaOptions() {
  return useQuery({
    queryKey: ['admin', 'reports', 'area-options'],
    queryFn: async () => {
      const res = await http.getPage<Raw>(`/v1/reseller/areas/${getResellerId()}`, { per_page: 100 });
      return res.items
        .map((a) => ({ id: str(a.id), name: str(a.area_name ?? a.name) }))
        .filter((a) => a.id && a.name);
    },
    staleTime: 5 * 60_000,
  });
}

/** BTRC exports through the backend: PDF / Excel binaries, CSV text. */
export async function downloadBtrc(kind: 'pdf' | 'excel' | 'csv', filters: Omit<BtrcFilters, 'page' | 'pageSize'>) {
  const params = cleanParams(toParams(filters));
  if (kind === 'csv') {
    const res = await http.get<{ csv?: string; filename?: string }>('/v1/reports/btrc/export', params);
    saveBlob(new Blob([str(res?.csv)], { type: 'text/csv;charset=utf-8' }), str(res?.filename) || 'BTRC_Report.csv');
    return;
  }
  const { blob, filename } = await http.download(`/v1/reports/btrc/${kind}`, params);
  saveBlob(blob, filename ?? (kind === 'pdf' ? 'BTRC_Report.pdf' : 'BTRC_Report.xlsx'));
}

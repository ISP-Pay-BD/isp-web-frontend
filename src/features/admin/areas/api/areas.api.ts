import { http } from '@/lib/api/client';
import { getResellerId } from '@/lib/api/auth-utils';
import { num, str } from '@/lib/api/case';
import type { AreaPayload, AreaSummary, ServiceArea, SubArea } from '../types';

type Raw = Record<string, unknown>;

const status = (v: unknown): 'active' | 'inactive' => (str(v) === 'inactive' ? 'inactive' : 'active');

function mapArea(r: Raw): ServiceArea {
  return {
    id: str(r.id),
    name: str(r.area_name) || str(r.name),
    code: str(r.area_code),
    status: status(r.status),
    subareaCount: num(r.subarea_count),
    totalCustomers: num(r.total_customers),
    activeCustomers: num(r.active_customers),
  };
}

function mapSubArea(r: Raw): SubArea {
  return { id: str(r.id), areaId: str(r.user_id), name: str(r.area_name), code: str(r.area_code), status: status(r.status) };
}

export const areasApi = {
  list: async (params: { page: number; perPage: number; search?: string; status?: string }) => {
    const res = await http.getPage<Raw>(`/v1/reseller/areas/${getResellerId()}`, {
      page: params.page,
      per_page: params.perPage,
      search: params.search || undefined,
      status: params.status && params.status !== 'all' ? params.status : undefined,
    });
    return { items: res.items.map(mapArea), meta: res.meta };
  },

  summary: async (): Promise<AreaSummary> => {
    const r = await http.get<Raw>(`/v1/reseller/areas/${getResellerId()}/summary`);
    return {
      totalAreas: num(r.total_areas),
      activeAreas: num(r.active_areas),
      inactiveAreas: num(r.inactive_areas),
      totalSubareas: num(r.total_subareas),
      areasWithoutSubareas: num(r.areas_without_subareas),
    };
  },

  subAreas: async (areaId: string, page: number, perPage: number) => {
    const res = await http.getPage<Raw>(`/v1/reseller/areas/${getResellerId()}/sub/${areaId}`, { page, per_page: perPage });
    return { items: res.items.map(mapSubArea), meta: res.meta };
  },

  create: async (body: AreaPayload) => mapArea(await http.post<Raw>(`/v1/reseller/areas/${getResellerId()}`, body)),
  update: (id: string, body: AreaPayload) => http.put(`/v1/reseller/areas/update/${id}`, body),
  /** Bulk-capable delete: body {ids}. */
  remove: (ids: string[]) => http.delete('/v1/reseller/areas/delete', undefined, { ids }),

  createSub: (areaId: string, body: AreaPayload) => http.post('/v1/reseller/subareas', { parent_area_id: areaId, ...body }),
  updateSub: (id: string, body: AreaPayload) => http.put(`/v1/reseller/subareas/update/${id}`, body),
  removeSub: (ids: string[]) => http.delete('/v1/reseller/subareas/delete', undefined, { ids }),
};

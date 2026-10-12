import { http } from '../client';
import { transformBackendDashboardStats, type AdminDashboardResult } from '../adapters/admin.adapter';
import type {
  HierarchyScope,
  HierarchyTreeResponse,
  ResellerSubscribersResponse,
} from '@/features/shared/hierarchy/types';
import { getResellerId } from '../auth-utils';


export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  areaId?: string;
  packageId?: string;
  resellerId?: string | number;
}

export interface BulkRechargePayload {
  customerIds: string[];
  /** New expiry, `Y-m-d H:i:s`. */
  willExpire: string;
  packageId?: string;
}

export interface BulkDeletePayload {
  customerIds: string[];
}

export const adminService = {
  getDashboardStats: async (resellerId?: string | number): Promise<AdminDashboardResult> => {
    const finalId = resellerId || getResellerId();
    const raw = await http.get<Record<string, unknown>>(`/v1/reseller/dashboard/${finalId}`);
    return transformBackendDashboardStats(raw);
  },

  bulkRecharge: async (payload: BulkRechargePayload, resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.post(`/v1/reseller/customers/${finalId}/bulk-recharge`, {
      ids: payload.customerIds,
      will_expire: payload.willExpire,
      package_id: payload.packageId || undefined,
    });
  },

  bulkDelete: async (payload: BulkDeletePayload, resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.post(`/v1/reseller/customers/${finalId}/bulk-delete`, { ids: payload.customerIds });
  },

  /** Re-link PPPoE secret ids from the routers: one customer, or the whole tenant when omitted. */
  syncPppoe: async (customerId?: string, resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.post(`/v1/reseller/customers/${finalId}/sync-pppoe`, customerId ? { customer_id: customerId } : {});
  },

  /** Binds the caller MAC the router currently sees (no MAC input). */
  macBind: async (customerId: string, resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.post(`/v1/reseller/customers/${finalId}/${customerId}/mac-bind`);
  },

  importExcel: async (formData: FormData, onProgress?: (percent: number) => void, resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.upload(`/v1/reseller/customers/${finalId}/import-excel`, formData, onProgress);
  },

  createEmployee: async (data: Record<string, unknown>, resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.post(`/v1/reseller/employees/${finalId}`, data);
  },

  updateEmployee: async (id: string, data: Record<string, unknown>, resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.put(`/v1/reseller/employees/${finalId}/${id}`, data);
  },

  /** Single employee delete — the tenant comes from the JWT (HR screens use hrService). */
  deleteEmployee: async (employeeId: string | number) => {
    return await http.delete(`/v1/employees/${employeeId}`);
  },


  /** GET /api/v1/pops?search=&status=&page=&per_page= — the tenant's POPs (fund = wallet balance). */
  getPops: async (params?: Record<string, unknown>) => {
    return await http.getPage<Record<string, unknown>>('/v1/pops', params);
  },

  /** POST /api/v1/pops — PopController::create (admin_name, mobile, email, password, …). */
  createPop: async (payload: Record<string, unknown>) => {
    return await http.post<Record<string, unknown>>('/v1/pops', payload);
  },

  /** GET /api/v1/pops/{id}/funding?type=&page=&per_page= — POP funding ledger + `summary`. */
  getPopFunding: async (popId: string | number, params?: Record<string, unknown>) => {
    return await http.getPage<Record<string, unknown>>(`/v1/pops/${popId}/funding`, params);
  },

  /**
   * POST /api/v1/pops/{id}/funding — PopFundingController::create:
   * {type: credit|debit, amount, paid_via?, received_date?, invoice_number?, comments?, request_id?}.
   */
  createPopFunding: async (popId: string | number, payload: Record<string, unknown>) => {
    return await http.post<Record<string, unknown>>(`/v1/pops/${popId}/funding`, payload);
  },

  /**
   * `GET /api/common/movieservers?page=&per_page=&search=` — movie/IPTV
   * servers are not versioned under /v1. Backend returns
   * `{ data: [...], pagination }`; only the stored columns are mapped.
   */
  getMovieServers: async (params?: { page?: number; perPage?: number; search?: string }) => {
    const res = await http.getPage<Record<string, unknown>>(
      '/common/movieservers',
      { page: params?.page ?? 1, per_page: params?.perPage ?? 20, search: params?.search || undefined },
      { listKey: 'data' },
    );
    return {
      meta: res.meta,
      items: res.items.map((row) => ({
        id: String(row.id ?? ''),
        name: String(row.name ?? ''),
        url: String(row.url ?? ''),
        details: row.details ? String(row.details) : '',
        rating: row.rating !== undefined && row.rating !== null && row.rating !== '' ? Number(row.rating) : null,
        imageUrl: row.image_url ? String(row.image_url) : null,
        createdAt: row.created_at ? String(row.created_at) : null,
      })),
    };
  },


  getHierarchyTree: async (scope: HierarchyScope, resellerId?: string): Promise<HierarchyTreeResponse> => {
    const authId = getResellerId();
    const res = await http.get<HierarchyTreeResponse>('/v1/hierarchy/tree', {
      scope,
      adminId: authId,
      resellerId: resellerId || undefined,
    });
    return res;
  },

  getResellerSubscribers: async (
    resellerId: string | number,
    params?: { page?: number; limit?: number; search?: string; status?: string },
  ): Promise<ResellerSubscribersResponse> => {
    return await http.get<ResellerSubscribersResponse>('/v1/hierarchy/reseller-customers', {
      resellerId,
      ...params,
    });
  },

  // ---- Phase 8 additions: previously unwired backend v1 routes ----

  /** GET /api/v1/reseller/referrals/{resellerId}?status=&search=&page=&per_page= — paginated referral pipeline. */
  getReferrals: async (params?: Record<string, unknown>, resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.getPage<Record<string, unknown>>(`/v1/reseller/referrals/${finalId}`, params);
  },

  /** POST /api/v1/reseller/referrals/{resellerId}/{referralId}/approve — verify + award points. */
  approveReferral: async (referralId: string | number, resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.post(`/v1/reseller/referrals/${finalId}/${referralId}/approve`);
  },

  /** POST /api/v1/reseller/referrals/{resellerId}/{referralId}/reject — body: { reason }. */
  rejectReferral: async (referralId: string | number, reason: string, resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.post(`/v1/reseller/referrals/${finalId}/${referralId}/reject`, { reason });
  },

  /** GET /api/v1/reseller/rewards/{resellerId}/config — reseller overrides + global defaults. */
  getRewardsConfig: async (resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.get<unknown>(`/v1/reseller/rewards/${finalId}/config`);
  },

  /** PUT /api/v1/reseller/rewards/{resellerId}/config — accepts flat keys or {config:{...}}. */
  updateRewardsConfig: async (values: Record<string, unknown>, resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.put(`/v1/reseller/rewards/${finalId}/config`, values);
  },

  /** GET /api/v1/reseller/rewards/{resellerId}/report — referral performance + reward cost summary. */
  getRewardsReport: async (resellerId?: string | number) => {
    const finalId = resellerId || getResellerId();
    return await http.get<unknown>(`/v1/reseller/rewards/${finalId}/report`);
  },

};


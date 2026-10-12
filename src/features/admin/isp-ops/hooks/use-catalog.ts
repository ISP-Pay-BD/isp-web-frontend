'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { getResellerId } from '@/lib/api/auth-utils';
import { str } from '@/lib/api/case';
import {
  mapAddon,
  mapAddonSubscription,
  mapAddonSubscriptionSummary,
  mapAddonSummary,
  mapCustomerOption,
  mapDealer,
  mapDealerCustomer,
  mapDealerSummary,
  mapMobilePlan,
  mapMobilePlanSummary,
  mapPopCommission,
  mapPopCommissionSummary,
  mapService,
  mapServiceSummary,
} from '../catalog.types';

/**
 * Hooks for the sales-catalog endpoints (zapi v1_ext_catalog.php). Tenant
 * scope comes from the JWT on the server; lists are server-paginated.
 */

type Resource = 'dealers' | 'addons' | 'service-catalog' | 'mobile-plans';
type Raw = Record<string, unknown>;

export const catalogKeys = {
  all: ['admin', 'catalog'] as const,
  resource: (r: Resource | 'addon-subscriptions' | 'pop-commissions' | 'dealer-customers') =>
    ['admin', 'catalog', r] as const,
  list: (r: string, params: Record<string, unknown>) => ['admin', 'catalog', r, 'list', params] as const,
  customers: (search: string) => ['admin', 'catalog', 'customer-options', search] as const,
};

export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
  filters?: Record<string, string | number | undefined>;
}

/** Drops empty values so they never reach the query string or cache key. */
function query({ page, pageSize, search, filters }: ListParams): Record<string, unknown> {
  const out: Record<string, unknown> = { page, per_page: pageSize };
  if (search) out.search = search;
  for (const [k, v] of Object.entries(filters ?? {})) if (v !== undefined && v !== '') out[k] = v;
  return out;
}

function useCatalogList<T, S>(resource: Resource, mapItem: (r: Raw) => T, mapSummary: (s: unknown) => S, params: ListParams) {
  const q = query(params);
  return useQuery({
    queryKey: catalogKeys.list(resource, q),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<Raw>(`/v1/${resource}`, q, { signal });
      return { items: res.items.map(mapItem), meta: res.meta, summary: mapSummary(res.raw.summary) };
    },
    placeholderData: keepPreviousData,
  });
}

export const useDealers = (p: ListParams) => useCatalogList('dealers', mapDealer, mapDealerSummary, p);
export const useAddons = (p: ListParams) => useCatalogList('addons', mapAddon, mapAddonSummary, p);
export const useServiceCatalog = (p: ListParams) => useCatalogList('service-catalog', mapService, mapServiceSummary, p);
export const useMobilePlans = (p: ListParams) => useCatalogList('mobile-plans', mapMobilePlan, mapMobilePlanSummary, p);

/**
 * POST /v1/{resource} or PUT /v1/{resource}/{id} (partial). `silent`: forms
 * map 422 field errors with handleApiError themselves.
 */
export function useSaveCatalogItem(resource: Resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: Raw }) =>
      id ? http.put<Raw>(`/v1/${resource}/${id}`, body) : http.post<Raw>(`/v1/${resource}`, body),
    meta: { silent: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.resource(resource) }),
  });
}

/** DELETE /v1/{resource}/{id} (add-ons with subscriptions answer 409, toasted globally). */
export function useDeleteCatalogItem(resource: Resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<Raw>(`/v1/${resource}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.resource(resource) }),
  });
}

// ---- Dealer ↔ customers ------------------------------------------------------

export function useDealerCustomers(dealerId: string | null, params: ListParams) {
  const q = query(params);
  return useQuery({
    queryKey: [...catalogKeys.resource('dealer-customers'), dealerId, q],
    queryFn: async ({ signal }) => {
      const res = await http.getPage<Raw>(`/v1/dealers/${dealerId}/customers`, q, { signal });
      return { items: res.items.map(mapDealerCustomer), meta: res.meta };
    },
    enabled: Boolean(dealerId),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateDealers() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: catalogKeys.resource('dealers') });
    qc.invalidateQueries({ queryKey: catalogKeys.resource('dealer-customers') });
  };
}

/** POST /v1/dealers/{id}/customers {customer_ids} — moves customers from any other dealer. */
export function useAssignDealerCustomers() {
  const invalidate = useInvalidateDealers();
  return useMutation({
    mutationFn: ({ dealerId, customerIds }: { dealerId: string; customerIds: string[] }) =>
      http.post<Raw>(`/v1/dealers/${dealerId}/customers`, { customer_ids: customerIds.map(Number) }),
    onSuccess: invalidate,
  });
}

/** DELETE /v1/dealers/{id}/customers/{customerId} */
export function useUnassignDealerCustomer() {
  const invalidate = useInvalidateDealers();
  return useMutation({
    mutationFn: ({ dealerId, customerId }: { dealerId: string; customerId: string }) =>
      http.delete<Raw>(`/v1/dealers/${dealerId}/customers/${customerId}`),
    onSuccess: invalidate,
  });
}

// ---- Customer add-on subscriptions -------------------------------------------

export function useAddonSubscriptions(params: ListParams) {
  const q = query(params);
  return useQuery({
    queryKey: catalogKeys.list('addon-subscriptions', q),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<Raw>('/v1/addons/subscriptions', q, { signal });
      return {
        items: res.items.map(mapAddonSubscription),
        meta: res.meta,
        summary: mapAddonSubscriptionSummary(res.raw.summary),
      };
    },
    placeholderData: keepPreviousData,
  });
}

function useInvalidateAddons() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: catalogKeys.resource('addon-subscriptions') });
    qc.invalidateQueries({ queryKey: catalogKeys.resource('addons') });
  };
}

/** POST /v1/addons/subscriptions or PUT /v1/addons/subscriptions/{id}. */
export function useSaveAddonSubscription() {
  const invalidate = useInvalidateAddons();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: Raw }) =>
      id ? http.put<Raw>(`/v1/addons/subscriptions/${id}`, body) : http.post<Raw>('/v1/addons/subscriptions', body),
    meta: { silent: true },
    onSuccess: invalidate,
  });
}

export function useDeleteAddonSubscription() {
  const invalidate = useInvalidateAddons();
  return useMutation({
    mutationFn: (id: string) => http.delete<Raw>(`/v1/addons/subscriptions/${id}`),
    onSuccess: invalidate,
  });
}

/** Tenant service areas for the dealer form (GET /v1/reseller/areas/{id}, first 100). */
export function useAreaOptions() {
  return useQuery({
    queryKey: [...catalogKeys.all, 'area-options'],
    queryFn: async ({ signal }) => {
      const res = await http.getPage<Raw>(`/v1/reseller/areas/${getResellerId()}`, { page: 1, per_page: 100 }, { signal });
      return res.items.map((a) => ({ id: str(a.id), name: str(a.area_name) || str(a.name) }));
    },
    staleTime: 5 * 60_000,
  });
}

/** GET /v1/catalog/customers?search= — tenant customers for pickers (max 20). */
export function useCustomerOptions(search: string, enabled = true) {
  return useQuery({
    queryKey: catalogKeys.customers(search),
    queryFn: async ({ signal }) =>
      (await http.get<Raw[]>('/v1/catalog/customers', { search: search || undefined, limit: 20 }, signal)).map(
        mapCustomerOption,
      ),
    enabled,
    placeholderData: keepPreviousData,
  });
}

// ---- POP commissions -----------------------------------------------------------

/** GET /v1/pop-commissions/statement?period=YYYY-MM — read-only, computed from payments. */
export function usePopCommissionStatement(params: ListParams & { period: string }) {
  const q = { ...query(params), period: params.period };
  return useQuery({
    queryKey: catalogKeys.list('pop-commissions', q),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<Raw>('/v1/pop-commissions/statement', q, { signal });
      return { items: res.items.map(mapPopCommission), meta: res.meta, summary: mapPopCommissionSummary(res.raw.summary) };
    },
    enabled: /^\d{4}-\d{2}$/.test(params.period),
    placeholderData: keepPreviousData,
  });
}

/** PUT /v1/pop-commissions/rules/{popId} {commission_type, commission_value, notes?} */
export function useSaveCommissionRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ popId, body }: { popId: string; body: Raw }) => http.put<Raw>(`/v1/pop-commissions/rules/${popId}`, body),
    meta: { silent: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.resource('pop-commissions') }),
  });
}

/** DELETE /v1/pop-commissions/rules/{popId} */
export function useDeleteCommissionRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (popId: string) => http.delete<Raw>(`/v1/pop-commissions/rules/${popId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.resource('pop-commissions') }),
  });
}

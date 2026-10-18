import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { mapCatalogItem, mapCategory, mapProvider, type ActiveStatus } from '../types';
import { bandwidthKeys, compact } from './keys';

/* ----------------------------------------------------- categories/items */

/** GET /v1/bandwidth/categories — whole tree (catalogue rows are per tenant, small, unpaginated). */
export function useBandwidthCategories() {
  return useQuery({
    queryKey: bandwidthKeys.categories,
    queryFn: async () => (await http.get<unknown[]>('/v1/bandwidth/categories')).map(mapCategory),
  });
}

/** GET /v1/bandwidth/items — flat catalogue item list (feeds tables and line-item pickers). */
export function useBandwidthItems() {
  return useQuery({
    queryKey: bandwidthKeys.items,
    queryFn: async () => (await http.get<unknown[]>('/v1/bandwidth/items')).map(mapCatalogItem),
  });
}

export interface CategoryInput {
  name: string;
  status: ActiveStatus;
  shortDescription: string;
}

function categoryBody(v: CategoryInput) {
  return { name: v.name.trim(), status: v.status, short_description: v.shortDescription.trim() };
}

function useCatalogInvalidation() {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: bandwidthKeys.categories }),
    qc.invalidateQueries({ queryKey: bandwidthKeys.items }),
  ]);
}

/** POST /v1/bandwidth/categories — `parentId` makes it a sub-category. */
export function useCreateBandwidthCategory() {
  const invalidate = useCatalogInvalidation();
  return useMutation({
    mutationFn: (v: CategoryInput & { parentId?: number | null }) =>
      http.post('/v1/bandwidth/categories', { ...categoryBody(v), parent_id: v.parentId || undefined }),
    onSuccess: invalidate,
  });
}

/** PUT /v1/bandwidth/categories/{id} or …/{id}/subcategories/{index}. */
export function useUpdateBandwidthCategory() {
  const invalidate = useCatalogInvalidation();
  return useMutation({
    mutationFn: (v: CategoryInput & { id: number; subIndex?: number | null }) =>
      v.subIndex === null || v.subIndex === undefined
        ? http.put(`/v1/bandwidth/categories/${v.id}`, categoryBody(v))
        : http.put(`/v1/bandwidth/categories/${v.id}/subcategories/${v.subIndex}`, categoryBody(v)),
    onSuccess: invalidate,
  });
}

/** DELETE a category (409 while it has sub-categories) or a sub-category (409 while it has items). */
export function useDeleteBandwidthCategory() {
  const invalidate = useCatalogInvalidation();
  return useMutation({
    mutationFn: (v: { id: number; subIndex?: number | null }) =>
      v.subIndex === null || v.subIndex === undefined
        ? http.delete(`/v1/bandwidth/categories/${v.id}`)
        : http.delete(`/v1/bandwidth/categories/${v.id}/subcategories/${v.subIndex}`),
    onSuccess: invalidate,
  });
}

export interface ItemInput {
  itemName: string;
  categoryId: number;
  subcategoryIndex: number | null;
  status: ActiveStatus;
  unitPrice: string;
  vat: string;
  description: string;
}

function itemBody(v: ItemInput) {
  return {
    item_name: v.itemName.trim(),
    category_id: v.categoryId,
    subcategory_index: v.subcategoryIndex ?? '',
    status: v.status,
    unit: v.unitPrice.trim(),
    vat: v.vat.trim(),
    description: v.description.trim(),
  };
}

/** POST /v1/bandwidth/items. */
export function useCreateBandwidthItem() {
  const invalidate = useCatalogInvalidation();
  return useMutation({
    mutationFn: (v: ItemInput) => http.post('/v1/bandwidth/items', itemBody(v)),
    onSuccess: invalidate,
  });
}

/** PUT /v1/bandwidth/items/{key} — the item stays in its category. */
export function useUpdateBandwidthItem() {
  const invalidate = useCatalogInvalidation();
  return useMutation({
    mutationFn: (v: ItemInput & { id: string }) => http.put(`/v1/bandwidth/items/${encodeURIComponent(v.id)}`, itemBody(v)),
    onSuccess: invalidate,
  });
}

/** DELETE /v1/bandwidth/items/{key}. */
export function useDeleteBandwidthItem() {
  const invalidate = useCatalogInvalidation();
  return useMutation({
    mutationFn: (id: string) => http.delete(`/v1/bandwidth/items/${encodeURIComponent(id)}`),
    onSuccess: invalidate,
  });
}

/* ------------------------------------------------------------ providers */

export interface ProviderListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/** GET /v1/bandwidth/providers?page=&per_page=&search= */
export function useBandwidthProviders({ page, pageSize, search }: ProviderListParams) {
  const params = compact({ page, per_page: pageSize, search });
  return useQuery({
    queryKey: bandwidthKeys.providerList(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/bandwidth/providers', params);
      return { items: res.items.map(mapProvider), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** Providers for pickers (backend max page size). */
export function useBandwidthProviderOptions() {
  return useQuery({
    queryKey: bandwidthKeys.providerOptions,
    queryFn: async () => (await http.getPage<unknown>('/v1/bandwidth/providers', { per_page: 100 })).items.map(mapProvider),
    staleTime: 5 * 60_000,
  });
}

export interface ProviderInput {
  companyName: string;
  contactPerson: string;
  email: string;
  mobileNumber: string;
  phoneNumber: string;
  website: string;
  facebookUrl: string;
  skypeId: string;
  address: string;
}

function providerBody(v: ProviderInput) {
  return {
    company_name: v.companyName.trim(),
    contact_person: v.contactPerson.trim(),
    email: v.email.trim(),
    mobile_number: v.mobileNumber.trim(),
    phone_number: v.phoneNumber.trim(),
    website: v.website.trim(),
    facebook_url: v.facebookUrl.trim(),
    skype_id: v.skypeId.trim(),
    address: v.address.trim(),
  };
}

function useProviderInvalidation() {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: bandwidthKeys.providers }),
    // Bills show the provider's name.
    qc.invalidateQueries({ queryKey: bandwidthKeys.bills }),
  ]);
}

/** POST /v1/bandwidth/providers. */
export function useCreateBandwidthProvider() {
  const invalidate = useProviderInvalidation();
  return useMutation({
    mutationFn: (v: ProviderInput) => http.post('/v1/bandwidth/providers', providerBody(v)),
    onSuccess: invalidate,
  });
}

/** PUT /v1/bandwidth/providers/{id}. */
export function useUpdateBandwidthProvider() {
  const invalidate = useProviderInvalidation();
  return useMutation({
    mutationFn: (v: ProviderInput & { id: number }) => http.put(`/v1/bandwidth/providers/${v.id}`, providerBody(v)),
    onSuccess: invalidate,
  });
}

/** DELETE one provider, or POST …/bulk-delete for several. */
export function useDeleteBandwidthProviders() {
  const invalidate = useProviderInvalidation();
  return useMutation({
    mutationFn: (ids: number[]) =>
      ids.length === 1
        ? http.delete(`/v1/bandwidth/providers/${ids[0]}`)
        : http.post('/v1/bandwidth/providers/bulk-delete', { ids }),
    onSuccess: invalidate,
  });
}

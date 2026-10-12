import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import {
  INVENTORY_URL,
  fetchList,
  fetchPaged,
  inventoryKeys,
  mapCategory,
  pageParams,
  type CategoryPayload,
  type ListParams,
} from '../api';

/** Server-paginated categories (each row carries its sub-categories). */
export function useInventoryCategories(list: ListParams) {
  const params = pageParams(list);
  return useQuery({
    queryKey: [...inventoryKeys.categories, params],
    queryFn: ({ signal }) => fetchPaged(`${INVENTORY_URL}/categories`, params, mapCategory, { signal }),
    placeholderData: keepPreviousData,
  });
}

/** All categories (no `page` → full array) for filters and form dropdowns. */
export function useAllInventoryCategories(enabled = true) {
  return useQuery({
    queryKey: [...inventoryKeys.categories, 'all'],
    queryFn: ({ signal }) => fetchList(`${INVENTORY_URL}/categories`, {}, mapCategory, signal),
    enabled,
  });
}

function useCategoryInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: inventoryKeys.categories });
    qc.invalidateQueries({ queryKey: inventoryKeys.items });
    qc.invalidateQueries({ queryKey: inventoryKeys.summary });
  };
}

/** POST /v1/inventory/categories (with `parent_id` → creates a sub-category). */
export function useCreateCategory() {
  const invalidate = useCategoryInvalidation();
  return useMutation({
    mutationFn: (body: CategoryPayload) => http.post<unknown>(`${INVENTORY_URL}/categories`, body),
    onSuccess: invalidate,
  });
}

/** PUT /v1/inventory/categories/{id}. */
export function useUpdateCategory() {
  const invalidate = useCategoryInvalidation();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CategoryPayload }) =>
      http.put<unknown>(`${INVENTORY_URL}/categories/${id}`, body),
    onSuccess: invalidate,
  });
}

/** DELETE /v1/inventory/categories/{id} — 409 while it still has sub-categories. */
export function useDeleteCategory() {
  const invalidate = useCategoryInvalidation();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`${INVENTORY_URL}/categories/${id}`),
    onSuccess: invalidate,
  });
}

/** PUT /v1/inventory/categories/{id}/subcategories/{index}. */
export function useUpdateSubcategory() {
  const invalidate = useCategoryInvalidation();
  return useMutation({
    mutationFn: ({ categoryId, index, body }: { categoryId: string; index: number; body: CategoryPayload }) =>
      http.put<unknown>(`${INVENTORY_URL}/categories/${categoryId}/subcategories/${index}`, body),
    onSuccess: invalidate,
  });
}

/** DELETE /v1/inventory/categories/{id}/subcategories/{index} — 409 while it has items. */
export function useDeleteSubcategory() {
  const invalidate = useCategoryInvalidation();
  return useMutation({
    mutationFn: ({ categoryId, index }: { categoryId: string; index: number }) =>
      http.delete<unknown>(`${INVENTORY_URL}/categories/${categoryId}/subcategories/${index}`),
    onSuccess: invalidate,
  });
}

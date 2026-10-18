'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, saveBlob } from '@/lib/api/client';
import { camelizeKeys } from '@/lib/api/case';
import type { TenantExport } from '../types';

const EXPORTS = ['admin', 'exports'] as const;

/** GET /v1/reseller/exports — previous "export my data" archives. */
export function useTenantExports(page: number, pageSize = 10) {
  return useQuery({
    queryKey: [...EXPORTS, page, pageSize],
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/reseller/exports', { page, per_page: pageSize });
      return { items: camelizeKeys<TenantExport[]>(res.items), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** POST /v1/reseller/exports — builds the ZIP of CSVs server-side. */
export function useCreateTenantExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => camelizeKeys<TenantExport>(await http.post<unknown>('/v1/reseller/exports')),
    onSuccess: () => qc.invalidateQueries({ queryKey: EXPORTS }),
  });
}

export function useDownloadTenantExport() {
  return useMutation({
    mutationFn: async (item: TenantExport) => {
      const { blob, filename } = await http.download(`/v1/reseller/exports/${item.id}/download`);
      saveBlob(blob, filename ?? item.fileName);
    },
  });
}

export function useDeleteTenantExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`/v1/reseller/exports/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: EXPORTS }),
  });
}

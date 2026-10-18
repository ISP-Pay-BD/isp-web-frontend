'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

export interface RecycleBinItem {
  id: string;
  entity: string;
  label: string;
  sourceId: string;
  deletedBy: string;
  deletedAt: string;
  expiresAt: string;
}

export interface RecycleBinParams {
  page: number;
  pageSize: number;
  search?: string;
  entity?: string;
}

const KEY = ['admin', 'recycle-bin'] as const;

/** GET /v1/recycle-bin — tenant bin (paged) + per-entity counts + retention days. */
export function useRecycleBin(params: RecycleBinParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: async () => {
      const res = await http.getPage<Record<string, unknown>>('/v1/recycle-bin', {
        page: params.page,
        per_page: params.pageSize,
        search: params.search || undefined,
        entity: params.entity || undefined,
      });
      return {
        items: res.items.map(
          (r): RecycleBinItem => ({
            id: str(r.id),
            entity: str(r.entity),
            label: str(r.entity_label),
            sourceId: str(r.source_id),
            deletedBy: str(r.deleted_by_name),
            deletedAt: str(r.created_at),
            expiresAt: str(r.expires_at),
          }),
        ),
        meta: res.meta,
        counts: (res.raw.counts ?? {}) as Record<string, number>,
        retentionDays: num(res.raw.retention_days, 30),
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** POST /v1/recycle-bin/restore {ids} */
export function useRestoreRecycleBinItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => http.post<{ restored: number }>('/v1/recycle-bin/restore', { ids: ids.map(Number) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** POST /v1/recycle-bin/delete-forever {ids} */
export function useDeleteRecycleBinItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => http.post<{ deleted: number }>('/v1/recycle-bin/delete-forever', { ids: ids.map(Number) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** POST /v1/recycle-bin/empty — one request for the whole tenant bin. */
export function useEmptyRecycleBin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.post<{ deleted: number }>('/v1/recycle-bin/empty'),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

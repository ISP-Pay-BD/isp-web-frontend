'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { camelizeKeys } from '@/lib/api/case';
import type { ApiKey, Option, Webhook, WebhookDelivery } from '../types';

const DEV = ['admin', 'developer'] as const;

interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/** GET /v1/developer/api-keys */
export function useApiKeys(params: ListParams) {
  return useQuery({
    queryKey: [...DEV, 'api-keys', params],
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/developer/api-keys', {
        page: params.page,
        per_page: params.pageSize,
        search: params.search || undefined,
      });
      return { items: camelizeKeys<ApiKey[]>(res.items), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** POST /v1/developer/api-keys — the plain key is only in this response. */
export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; scopes: string[] }) =>
      camelizeKeys<{ item: ApiKey; key: string }>(await http.post<unknown>('/v1/developer/api-keys', input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...DEV, 'api-keys'] }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`/v1/developer/api-keys/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...DEV, 'api-keys'] }),
  });
}

/** GET /v1/developer/webhooks — also carries the event + scope catalogues. */
export function useWebhooks(params: ListParams) {
  return useQuery({
    queryKey: [...DEV, 'webhooks', params],
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/developer/webhooks', {
        page: params.page,
        per_page: params.pageSize,
        search: params.search || undefined,
      });
      return {
        items: camelizeKeys<Webhook[]>(res.items),
        meta: res.meta,
        events: (res.raw.events ?? []) as Option[],
        scopes: (res.raw.scopes ?? []) as Option[],
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { url: string; events: string[]; active: boolean }) =>
      camelizeKeys<{ item: Webhook; secret: string }>(await http.post<unknown>('/v1/developer/webhooks', input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...DEV, 'webhooks'] }),
  });
}

export function useUpdateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; url?: string; events?: string[]; active?: boolean }) =>
      http.put(`/v1/developer/webhooks/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...DEV, 'webhooks'] }),
  });
}

export function useDeleteWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`/v1/developer/webhooks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...DEV, 'webhooks'] }),
  });
}

export function useRotateWebhookSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      camelizeKeys<{ item: Webhook; secret: string }>(await http.post<unknown>(`/v1/developer/webhooks/${id}/rotate-secret`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...DEV, 'webhooks'] }),
  });
}

/** POST /v1/developer/webhooks/{id}/test — real signed delivery, logged server-side. */
export function useTestWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      camelizeKeys<{ success: boolean; statusCode: number | null; durationMs: number; error: string | null }>(
        await http.post<unknown>(`/v1/developer/webhooks/${id}/test`),
      ),
    onSuccess: (_res, id) => {
      void qc.invalidateQueries({ queryKey: [...DEV, 'webhooks'] });
      void qc.invalidateQueries({ queryKey: [...DEV, 'deliveries', id] });
    },
  });
}

export function useWebhookDeliveries(id: string | null, page: number) {
  return useQuery({
    queryKey: [...DEV, 'deliveries', id, page],
    queryFn: async () => {
      const res = await http.getPage<unknown>(`/v1/developer/webhooks/${id}/deliveries`, { page, per_page: 10 });
      return { items: camelizeKeys<WebhookDelivery[]>(res.items), meta: res.meta };
    },
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });
}

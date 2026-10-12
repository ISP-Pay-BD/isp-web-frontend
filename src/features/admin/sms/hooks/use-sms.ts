'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { str, num } from '@/lib/api/case';
import { getResellerId } from '@/lib/api/auth-utils';
import {
  mapArea,
  mapBatch,
  mapEvent,
  mapOverview,
  mapRecipient,
  mapSmsLog,
  mapTemplate,
  type SmsPreviewItem,
  type SmsTemplateOption,
} from '../types';

export const smsKeys = {
  all: ['admin', 'sms'] as const,
  overview: ['admin', 'sms', 'overview'] as const,
  recipients: (params: Record<string, unknown>) => ['admin', 'sms', 'recipients', params] as const,
  logs: (params: Record<string, unknown>) => ['admin', 'sms', 'logs', params] as const,
  batches: (params: Record<string, unknown>) => ['admin', 'sms', 'batches', params] as const,
  batch: (id: string) => ['admin', 'sms', 'batch', id] as const,
  preview: (params: Record<string, unknown>) => ['admin', 'sms', 'preview', params] as const,
  templates: (params: Record<string, unknown>) => ['admin', 'sms', 'templates', params] as const,
  templateOptions: ['admin', 'sms', 'templates', 'options'] as const,
  events: ['admin', 'sms', 'events'] as const,
};

/** Gateway status + live balance, delivery stats and the server-supported variables. */
export function useSmsOverview() {
  return useQuery({
    queryKey: smsKeys.overview,
    queryFn: async () => mapOverview(await http.get<unknown>('/v1/reseller/sms-center/overview')),
    staleTime: 60_000,
  });
}

/** Forces a live gateway balance check (bypasses the 5-minute server cache). */
export function useRefreshGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => mapOverview(await http.get<unknown>('/v1/reseller/sms-center/overview', { refresh: 1 })),
    onSuccess: (data) => qc.setQueryData(smsKeys.overview, data),
  });
}

export interface RecipientParams {
  page: number;
  pageSize: number;
  search?: string;
  areaId?: string;
}

/** Tenant customers (paginated, searchable) + areas with active counts + the send-to-all audience size. */
export function useSmsRecipients({ page, pageSize, search, areaId }: RecipientParams, enabled = true) {
  const params = {
    page,
    per_page: pageSize,
    search: search || undefined,
    area_id: areaId && areaId !== 'all' ? areaId : undefined,
  };
  return useQuery({
    queryKey: smsKeys.recipients(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>(`/v1/reseller/sms/${getResellerId()}/recipients`, params, { listKey: 'customers' });
      const areas = Array.isArray(res.raw.areas) ? res.raw.areas.map(mapArea) : [];
      const templates: SmsTemplateOption[] = Array.isArray(res.raw.templates)
        ? res.raw.templates.map((t) => {
            const r = (t ?? {}) as Record<string, unknown>;
            return { id: str(r.id), title: str(r.title), content: str(r.content), templateType: str(r.template_type) };
          })
        : [];
      return {
        items: res.items.map(mapRecipient),
        meta: res.meta,
        areas,
        templates,
        audienceTotal: num(res.raw.audience_total),
      };
    },
    placeholderData: keepPreviousData,
    enabled,
  });
}

export interface SmsLogParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export function useSmsLogs({ page, pageSize, search, status }: SmsLogParams) {
  const params = { page, per_page: pageSize, search: search || undefined, status: status && status !== 'all' ? status : undefined };
  return useQuery({
    queryKey: smsKeys.logs(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>(`/v1/reseller/sms/${getResellerId()}`, params);
      return { items: res.items.map(mapSmsLog), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/**
 * Queued sends for a channel. Polls every 30s (background polling off) only
 * while a batch is still being drained by the queue worker.
 */
export function useMessageBatches(channel: 'sms' | 'voice' | 'whatsapp', page = 1, pageSize = 5) {
  const params = { channel, page, per_page: pageSize };
  return useQuery({
    queryKey: smsKeys.batches(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/reseller/sms-center/batches', params);
      return { items: res.items.map(mapBatch), meta: res.meta };
    },
    placeholderData: keepPreviousData,
    refetchInterval: (q) => (q.state.data?.items.some((b) => b.status !== 'completed') ? 30_000 : false),
    refetchIntervalInBackground: false,
  });
}

/** Server-rendered per-recipient preview (variables resolved by the backend). */
export function useSmsPreview(content: string, customerIds: string[], areaId?: string) {
  const params = { content, customer_ids: customerIds, area_id: areaId && areaId !== 'all' ? areaId : undefined };
  return useQuery({
    queryKey: smsKeys.preview(params),
    queryFn: async () => {
      const res = await http.post<{ items?: unknown[] }>('/v1/reseller/sms-center/preview', params);
      return (res?.items ?? []).map((raw): SmsPreviewItem => {
        const r = (raw ?? {}) as Record<string, unknown>;
        return { customerId: str(r.customer_id), name: str(r.name), mobile: str(r.mobile), message: str(r.message) };
      });
    },
    enabled: content.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export interface SendSmsPayload {
  content: string;
  /** ['all'] or customer ids */
  sendTo: string[];
  areaId?: string;
}

export interface SendSmsResult {
  queued: boolean;
  batchId: string;
  count: number;
}

export function useSendSms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ content, sendTo, areaId }: SendSmsPayload): Promise<SendSmsResult> => {
      const res = await http.post<Record<string, unknown>>(`/v1/reseller/sms/${getResellerId()}/send`, {
        content,
        send_to: sendTo,
        area: areaId && areaId !== 'all' ? areaId : undefined,
      });
      return { queued: Boolean(res?.queued), batchId: str(res?.batch_id), count: num(res?.count) };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'sms', 'logs'] });
      qc.invalidateQueries({ queryKey: ['admin', 'sms', 'batches'] });
      qc.invalidateQueries({ queryKey: smsKeys.overview });
    },
  });
}

export function useTestSms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { mobile: string; content: string; customerId?: string }) =>
      http.post<{ message?: string }>('/v1/reseller/sms-center/test', {
        mobile: payload.mobile,
        content: payload.content,
        customer_id: payload.customerId || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'sms', 'logs'] });
      qc.invalidateQueries({ queryKey: smsKeys.overview });
    },
  });
}

/* ── Templates ─────────────────────────────────────────────── */

export function useSmsTemplates({ page, pageSize, search }: { page: number; pageSize: number; search?: string }) {
  const params = { page, per_page: pageSize, search: search || undefined };
  return useQuery({
    queryKey: smsKeys.templates(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/sms/templates', params);
      return { items: res.items.map(mapTemplate), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** Every template the tenant can pick (own + defaults) for selects. */
export function useSmsTemplateOptions() {
  return useQuery({
    queryKey: smsKeys.templateOptions,
    queryFn: async () => {
      const res = await http.get<{ items?: unknown[] }>('/v1/sms/templates');
      return (res?.items ?? []).map(mapTemplate);
    },
    staleTime: 5 * 60_000,
  });
}

export function useSaveSmsTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, body }: { id?: string; name: string; body: string }) => {
      const payload = { template_name: name, message_body: body };
      return id ? http.put(`/v1/sms/templates/${id}`, payload) : http.post('/v1/sms/templates', payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'sms', 'templates'] }),
  });
}

export function useDeleteSmsTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`/v1/sms/templates/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'sms', 'templates'] });
      qc.invalidateQueries({ queryKey: smsKeys.events });
    },
  });
}

/* ── Event triggers (sms_event_config — read by sendEventSms) ─ */

export function useSmsEvents() {
  return useQuery({
    queryKey: smsKeys.events,
    queryFn: async () => {
      const res = await http.get<{ items?: unknown[]; can_edit?: boolean }>('/v1/reseller/sms-center/events');
      return { items: (res?.items ?? []).map(mapEvent), canEdit: Boolean(res?.can_edit) };
    },
  });
}

export function useUpdateSmsEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { event: string; templateId: string; enabled: boolean }) =>
      http.put('/v1/reseller/sms-center/events', {
        event: payload.event,
        template_id: payload.templateId || null,
        enabled: payload.enabled,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: smsKeys.events }),
  });
}

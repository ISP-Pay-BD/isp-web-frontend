'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num } from '@/lib/api/case';
import {
  mapCampaign,
  mapConversation,
  mapLog,
  mapLogStats,
  mapMessage,
  mapOptIn,
  mapSettings,
  mapTemplate,
  mapTemplateStats,
  type WaCategory,
  type WaMetaForm,
} from '../types';

const WA = '/v1/reseller/whatsapp';

export const waKeys = {
  all: ['admin', 'whatsapp'] as const,
  settings: ['admin', 'whatsapp', 'settings'] as const,
  conversations: ['admin', 'whatsapp', 'conversations'] as const,
  conversation: (id: string) => ['admin', 'whatsapp', 'conversation', id] as const,
  templates: (params: Record<string, unknown>) => ['admin', 'whatsapp', 'templates', params] as const,
  logs: (params: Record<string, unknown>) => ['admin', 'whatsapp', 'logs', params] as const,
  optIns: (params: Record<string, unknown>) => ['admin', 'whatsapp', 'opt-ins', params] as const,
  campaigns: (params: Record<string, unknown>) => ['admin', 'whatsapp', 'campaigns', params] as const,
};

interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/* ── Settings ─────────────────────────────────────────────── */

export function useWhatsAppSettings() {
  return useQuery({
    queryKey: waKeys.settings,
    queryFn: async () => mapSettings(await http.get<unknown>(`${WA}/settings`)),
  });
}

export function useSaveWhatsAppSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: WaMetaForm) =>
      http.put(`${WA}/settings`, {
        phone_number_id: form.phoneNumberId,
        display_phone: form.displayPhone,
        waba_id: form.wabaId,
        verify_token: form.verifyToken,
        // Blank = keep the stored secret.
        access_token: form.accessToken || undefined,
        app_secret: form.appSecret || undefined,
        is_active: form.isActive,
        ai_enabled: form.aiEnabled,
        utility_enabled: form.utilityEnabled,
        authentication_enabled: form.authenticationEnabled,
        marketing_enabled: form.marketingEnabled,
        otp_channel: form.otpChannel,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: waKeys.settings }),
  });
}

/** Start / restart the tenant's WAHA session. */
export function useRestartWahaSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.post(`${WA}/sessions`),
    onSuccess: () => qc.invalidateQueries({ queryKey: waKeys.settings }),
  });
}

/* ── Inbox ────────────────────────────────────────────────── */

/** Conversation list from the AI chatbot store (it caps at the 100 most recent). Live inbox: 30s refresh. */
export function useWhatsAppConversations() {
  return useQuery({
    queryKey: waKeys.conversations,
    queryFn: async () => {
      const res = await http.get<{ conversations?: unknown[] }>(`${WA}/conversations`);
      return (res?.conversations ?? []).map(mapConversation);
    },
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useWhatsAppConversation(id: string | null) {
  return useQuery({
    queryKey: waKeys.conversation(id ?? ''),
    queryFn: async () => {
      const res = await http.get<{ messages?: unknown[]; wa_phone?: string }>(`${WA}/conversations/${encodeURIComponent(id ?? '')}`);
      return { messages: (res?.messages ?? []).map(mapMessage), phone: String(res?.wa_phone ?? '') };
    },
    enabled: Boolean(id),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useSendWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { to: string; text: string; provider: 'meta' | 'waha' }) => http.post(`${WA}/send`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: waKeys.conversations });
      qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'conversation'] });
      qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'logs'] });
    },
  });
}

/* ── Templates ────────────────────────────────────────────── */

export function useWhatsAppTemplates({ page, pageSize, search, category }: ListParams & { category?: string }) {
  const params = { page, per_page: pageSize, search: search || undefined, category: category && category !== 'all' ? category : undefined };
  return useQuery({
    queryKey: waKeys.templates(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>(`${WA}/templates`, params, { listKey: 'templates' });
      return {
        items: res.items.map(mapTemplate),
        meta: res.meta,
        stats: mapTemplateStats(res.raw.stats),
        wabaId: String(res.raw.waba_id ?? ''),
      };
    },
    placeholderData: keepPreviousData,
  });
}

export interface WaTemplateInput {
  id?: string;
  name: string;
  language: string;
  category: WaCategory;
  body: string;
  eventKey: string;
  metaTemplateId: string;
  enabled: boolean;
}

export function useSaveWhatsAppTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WaTemplateInput) =>
      http.post(`${WA}/templates`, {
        id: input.id || undefined,
        name: input.name,
        language: input.language,
        category: input.category,
        body_preview: input.body,
        event_key: input.eventKey || undefined,
        meta_template_id: input.metaTemplateId || undefined,
        is_enabled: input.enabled,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'templates'] }),
  });
}

export function useDeleteWhatsAppTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`${WA}/templates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'templates'] }),
  });
}

export function useTestWhatsAppTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to, params }: { id: string; to: string; params: string[] }) => http.post(`${WA}/templates/${id}/test`, { to, params }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'logs'] }),
  });
}

/* ── Message log ──────────────────────────────────────────── */

export function useWhatsAppLogs({ page, pageSize, search, direction, status }: ListParams & { direction?: string; status?: string }) {
  const params = {
    page,
    per_page: pageSize,
    search: search || undefined,
    direction: direction && direction !== 'all' ? direction : undefined,
    status: status && status !== 'all' ? status : undefined,
  };
  return useQuery({
    queryKey: waKeys.logs(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>(`${WA}/message-log`, params, { listKey: 'logs' });
      return { items: res.items.map(mapLog), meta: res.meta, stats: mapLogStats(res.raw.stats) };
    },
    placeholderData: keepPreviousData,
  });
}

/* ── Opt-ins ──────────────────────────────────────────────── */

export function useWhatsAppOptIns({ page, pageSize, search, status }: ListParams & { status?: string }) {
  const params = { page, per_page: pageSize, search: search || undefined, status: status && status !== 'all' ? status : undefined };
  return useQuery({
    queryKey: waKeys.optIns(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>(`${WA}/opt-ins`, params, { listKey: 'opt_ins' });
      const stats = (res.raw.stats ?? {}) as Record<string, unknown>;
      return {
        items: res.items.map(mapOptIn),
        meta: res.meta,
        stats: { total: num(stats.total), optedIn: num(stats.opted_in), optedOut: num(stats.opted_out) },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useSaveOptIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, optedIn }: { phone: string; optedIn: boolean }) =>
      http.post(`${WA}/opt-ins`, { wa_phone: phone, marketing_opt_in: optedIn }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'opt-ins'] }),
  });
}

export function useDeleteOptIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`${WA}/opt-ins/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'opt-ins'] }),
  });
}

/* ── Campaigns ────────────────────────────────────────────── */

export function useWhatsAppCampaigns({ page, pageSize, search }: ListParams) {
  const params = { page, per_page: pageSize, search: search || undefined };
  return useQuery({
    queryKey: waKeys.campaigns(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>(`${WA}/campaigns`, params, { listKey: 'campaigns' });
      return {
        items: res.items.map(mapCampaign),
        meta: res.meta,
        templates: Array.isArray(res.raw.templates) ? res.raw.templates.map(mapTemplate) : [],
        optedInCount: num(res.raw.opted_in_count),
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, templateId }: { name: string; templateId: string }) =>
      http.post<Record<string, unknown>>(`${WA}/campaigns`, { name, template_id: templateId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'campaigns'] }),
  });
}

export function useLaunchCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await http.post<{ stats?: { sent?: number; failed?: number } }>(`${WA}/campaigns/${id}/launch`);
      return { sent: num(res?.stats?.sent), failed: num(res?.stats?.failed) };
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'campaigns'] });
      qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'logs'] });
    },
  });
}

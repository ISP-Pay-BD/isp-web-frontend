'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { getResellerId } from '@/lib/api/auth-utils';
import { isoDate } from '@/features/admin/sms/types';

export interface VoiceTemplate {
  id: string;
  name: string;
  /** Voice/message id registered on the voice gateway. */
  messageId: string;
  createdAt: string;
}

export interface GatewayVoice {
  id: string;
  name: string;
}

const base = () => `/v1/reseller/voice-sms/${getResellerId()}`;

function mapVoiceTemplate(raw: unknown): VoiceTemplate {
  const r = (raw ?? {}) as Record<string, unknown>;
  return { id: str(r.id), name: str(r.name), messageId: str(r.message_id), createdAt: isoDate(r.created_at) };
}

export const voiceKeys = {
  templates: (params: Record<string, unknown>) => ['admin', 'voice-sms', 'templates', params] as const,
  settings: ['admin', 'voice-sms', 'settings'] as const,
  voices: ['admin', 'voice-sms', 'gateway-voices'] as const,
};

export function useVoiceTemplates({ page, pageSize, search }: { page: number; pageSize: number; search?: string }) {
  const params = { page, per_page: pageSize, search: search || undefined };
  return useQuery({
    queryKey: voiceKeys.templates(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>(`${base()}/templates`, params, { listKey: 'templates' });
      return { items: res.items.map(mapVoiceTemplate), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** The tenant's configured voice gateway (read from per-tenant settings). */
export function useVoiceSettings() {
  return useQuery({
    queryKey: voiceKeys.settings,
    queryFn: async () => {
      const res = await http.get<Record<string, unknown>>(`${base()}/settings`);
      return { gateway: str(res?.default_voice_sms_gateway) };
    },
    staleTime: 5 * 60_000,
  });
}

/** Voices registered on the Awaj Digital account (the only gateway that lists them). */
export function useGatewayVoices(enabled: boolean) {
  return useQuery({
    queryKey: voiceKeys.voices,
    queryFn: async () => {
      const res = await http.getPage<unknown>(`${base()}/gateway-voices`, { per_page: 100 }, { listKey: 'voices' });
      return res.items.map((raw): GatewayVoice => {
        const r = (raw ?? {}) as Record<string, unknown>;
        const id = str(r.id ?? r.voice ?? r.voice_id ?? r.name);
        return { id, name: str(r.name ?? r.title ?? r.voice ?? id) };
      });
    },
    enabled,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useSaveVoiceTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, messageId }: { id?: string; name: string; messageId: string }) => {
      const body = { name, message_id: messageId };
      return id ? http.put(`${base()}/templates/${id}`, body) : http.post(`${base()}/templates`, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'voice-sms', 'templates'] }),
  });
}

export function useDeleteVoiceTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`${base()}/templates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'voice-sms', 'templates'] }),
  });
}

/** Voice broadcast to all active customers (optionally one area). Many calls are queued. */
export function useSendVoiceBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, areaId }: { templateId: string; areaId?: string }) => {
      const res = await http.post<Record<string, unknown>>(`${base()}/send`, {
        template_id: templateId,
        send_to: ['all'],
        area: areaId && areaId !== 'all' ? areaId : undefined,
      });
      return { queued: Boolean(res?.queued), count: num(res?.count ?? res?.sent), failed: num(res?.failed) };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'sms', 'batches'] }),
  });
}

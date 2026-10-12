'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num } from '@/lib/api/case';
import {
  dunningRuleBody,
  mapDunningRule,
  mapReminder,
  mapReminderStats,
  mapUsageLog,
  mapUsageRule,
  mapUsageStats,
  usageRuleBody,
  type DunningRuleInput,
  type MessageChannel,
  type UsageAlertInput,
} from '../types';

export const dunningKeys = {
  rules: ['admin', 'dunning', 'rules'] as const,
  reminders: (params: Record<string, unknown>) => ['admin', 'dunning', 'reminders', params] as const,
  usageRules: (params: Record<string, unknown>) => ['admin', 'usage-alerts', 'rules', params] as const,
  usageLog: (params: Record<string, unknown>) => ['admin', 'usage-alerts', 'log', params] as const,
};

/* ── Dunning rules ─────────────────────────────────────────── */

/** All escalation steps of the tenant, ordered by day offset (a tenant has a handful). */
export function useDunningRules() {
  return useQuery({
    queryKey: dunningKeys.rules,
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/reseller/dunning/rules', { per_page: 100 });
      return { items: res.items.map(mapDunningRule), meta: res.meta };
    },
  });
}

export function useSaveDunningRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: DunningRuleInput }) =>
      id
        ? http.put(`/v1/reseller/dunning/rules/${id}`, dunningRuleBody(input))
        : http.post('/v1/reseller/dunning/rules', dunningRuleBody(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: dunningKeys.rules }),
  });
}

export function useDeleteDunningRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`/v1/reseller/dunning/rules/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: dunningKeys.rules }),
  });
}

/** Runs the tenant's rules now (the same job the daily cron runs). */
export function useRunDunning() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await http.post<Record<string, unknown>>('/v1/reseller/dunning/run');
      return { queued: num(res?.queued), rules: num(res?.rules) };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dunningKeys.rules });
      qc.invalidateQueries({ queryKey: ['admin', 'dunning', 'reminders'] });
    },
  });
}

/* ── Reminder log ──────────────────────────────────────────── */

export interface ReminderParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  channel?: string;
}

export function useReminders({ page, pageSize, search, status, channel }: ReminderParams) {
  const params = {
    page,
    per_page: pageSize,
    search: search || undefined,
    status: status && status !== 'all' ? status : undefined,
    channel: channel && channel !== 'all' ? channel : undefined,
  };
  return useQuery({
    queryKey: dunningKeys.reminders(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/reseller/dunning/reminders', params);
      return { items: res.items.map(mapReminder), meta: res.meta, stats: mapReminderStats(res.raw.stats) };
    },
    placeholderData: keepPreviousData,
  });
}

export function useSendReminderNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { customerId: string; channel: MessageChannel; templateId?: string; message?: string }) =>
      http.post('/v1/reseller/dunning/reminders/send', {
        customer_id: payload.customerId,
        channel: payload.channel,
        template_id: payload.templateId || undefined,
        message: payload.message || undefined,
      }),
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'dunning', 'reminders'] }),
  });
}

export function useResendReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.post(`/v1/reseller/dunning/reminders/${id}/resend`),
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'dunning', 'reminders'] }),
  });
}

/* ── Usage alerts ──────────────────────────────────────────── */

export function useUsageAlertRules({ page, pageSize, search }: { page: number; pageSize: number; search?: string }) {
  const params = { page, per_page: pageSize, search: search || undefined };
  return useQuery({
    queryKey: dunningKeys.usageRules(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/reseller/usage-alerts/rules', params);
      return { items: res.items.map(mapUsageRule), meta: res.meta, stats: mapUsageStats(res.raw.stats) };
    },
    placeholderData: keepPreviousData,
  });
}

export function useSaveUsageAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: UsageAlertInput }) =>
      id
        ? http.put(`/v1/reseller/usage-alerts/rules/${id}`, usageRuleBody(input))
        : http.post('/v1/reseller/usage-alerts/rules', usageRuleBody(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'usage-alerts', 'rules'] }),
  });
}

export function useDeleteUsageAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`/v1/reseller/usage-alerts/rules/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'usage-alerts', 'rules'] }),
  });
}

export function useRunUsageAlerts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await http.post<Record<string, unknown>>('/v1/reseller/usage-alerts/run');
      return { alerted: num(res?.alerted) };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'usage-alerts'] });
    },
  });
}

export function useUsageAlertLog({ page, pageSize, search }: { page: number; pageSize: number; search?: string }) {
  const params = { page, per_page: pageSize, search: search || undefined };
  return useQuery({
    queryKey: dunningKeys.usageLog(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/reseller/usage-alerts/log', params);
      return { items: res.items.map(mapUsageLog), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

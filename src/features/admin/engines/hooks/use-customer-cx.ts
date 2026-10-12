'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

/* Customer "My Experience": notification preferences + CSAT feedback (JWT customer only). */

export const NOTIFICATION_PREF_KEYS = [
  'sms',
  'whatsapp',
  'email',
  'push',
  'billingReminders',
  'outageAlerts',
  'promotions',
] as const;
export type NotificationPrefKey = (typeof NOTIFICATION_PREF_KEYS)[number];
export type NotificationPrefFlags = Record<NotificationPrefKey, boolean>;

export interface NotificationPrefs extends NotificationPrefFlags {
  isDefault: boolean;
  updatedAt: string | null;
}

export interface FeedbackCategory {
  value: string;
  label: string;
}

export interface CustomerFeedbackItem {
  id: string;
  rating: number;
  category: string;
  categoryLabel: string;
  comment: string | null;
  ticketId: string | null;
  createdAt: string | null;
}

export interface FeedbackInput {
  rating: number;
  category: string;
  comment: string;
}

const prefsKey = ['customer', 'notification-prefs'] as const;
const feedbackKey = ['customer', 'feedback'] as const;

const SNAKE: Record<NotificationPrefKey, string> = {
  sms: 'sms',
  whatsapp: 'whatsapp',
  email: 'email',
  push: 'push',
  billingReminders: 'billing_reminders',
  outageAlerts: 'outage_alerts',
  promotions: 'promotions',
};

function mapPrefs(raw: unknown): NotificationPrefs {
  const r = (raw ?? {}) as Record<string, unknown>;
  const flags = Object.fromEntries(NOTIFICATION_PREF_KEYS.map((k) => [k, Boolean(r[SNAKE[k]])])) as NotificationPrefFlags;
  return { ...flags, isDefault: Boolean(r.is_default), updatedAt: r.updated_at ? str(r.updated_at) : null };
}

function mapFeedbackItem(raw: unknown): CustomerFeedbackItem {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: str(r.id),
    rating: num(r.rating),
    category: str(r.category),
    categoryLabel: str(r.category_label, str(r.category)),
    comment: r.comment ? str(r.comment) : null,
    ticketId: r.ticket_id ? str(r.ticket_id) : null,
    createdAt: r.created_at ? str(r.created_at) : null,
  };
}

/** GET /v1/customer/notification-prefs */
export function useNotificationPrefs() {
  return useQuery({
    queryKey: prefsKey,
    queryFn: async () => mapPrefs(await http.get<unknown>('/v1/customer/notification-prefs')),
  });
}

/** PUT /v1/customer/notification-prefs */
export function useUpdateNotificationPrefs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (flags: NotificationPrefFlags) =>
      mapPrefs(
        await http.put<unknown>(
          '/v1/customer/notification-prefs',
          Object.fromEntries(NOTIFICATION_PREF_KEYS.map((k) => [SNAKE[k], flags[k]])),
        ),
      ),
    onSuccess: (data) => queryClient.setQueryData(prefsKey, data),
  });
}

/** GET /v1/customer/feedback — categories + the customer's recent feedback. */
export function useCustomerFeedback() {
  return useQuery({
    queryKey: feedbackKey,
    queryFn: async () => {
      const raw = (await http.get<Record<string, unknown>>('/v1/customer/feedback')) ?? {};
      const categories = Array.isArray(raw.categories) ? (raw.categories as Record<string, unknown>[]) : [];
      return {
        categories: categories.map((c) => ({ value: str(c.value), label: str(c.label) })) as FeedbackCategory[],
        items: (Array.isArray(raw.items) ? raw.items : []).map(mapFeedbackItem),
      };
    },
  });
}

/** POST /v1/customer/feedback (the server allows 5 per hour). */
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: FeedbackInput) =>
      mapFeedbackItem(
        await http.post<unknown>('/v1/customer/feedback', {
          rating: input.rating,
          category: input.category,
          comment: input.comment.trim() || null,
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feedbackKey }),
  });
}

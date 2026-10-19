'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { camelizeKeys, str } from '@/lib/api/case';
import { getResellerId } from '@/lib/api/auth-utils';
import type { GeneralSettings, SettingsGroup, SettingsGroupId, SmsBalance } from '../types';

const settingsKey = (...parts: unknown[]) => ['admin', 'settings', ...parts] as const;

function toGeneral(raw: Record<string, unknown>): GeneralSettings {
  return {
    appName: str(raw.app_name),
    appSlogan: str(raw.app_slogan),
    companyCell: str(raw.company_cell) || str(raw.support_mobile) || str(raw.company_phone),
    webmasterEmail: str(raw.webmaster_email),
    companyAddress: str(raw.company_address),
    expiryReminderDays:
      'notify_user_subscription_expire_before_days' in raw ? str(raw.notify_user_subscription_expire_before_days) : null,
    logoUrl: raw.app_logo_url ? str(raw.app_logo_url) : null,
    iconUrl: raw.app_icon_url ? str(raw.app_icon_url) : null,
  };
}

/** GET /v1/reseller/settings/{id} — company profile / branding keys. */
export function useSoftwareSettings() {
  return useQuery({
    queryKey: settingsKey('general'),
    queryFn: async () => toGeneral(await http.get<Record<string, unknown>>(`/v1/reseller/settings/${getResellerId()}`)),
  });
}

/** PUT /v1/reseller/settings/{id} — only the editable keys are sent. */
export function useUpdateGeneralSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (g: GeneralSettings) => {
      const phone = g.companyCell.trim();
      const settings: Record<string, string> = {
        app_name: g.appName.trim(),
        app_slogan: g.appSlogan.trim(),
        // The web keeps the three phone keys in sync (setSetting); do the same.
        company_cell: phone,
        support_mobile: phone,
        company_phone: phone,
        webmaster_email: g.webmasterEmail.trim(),
        company_address: g.companyAddress.trim(),
      };
      if (g.expiryReminderDays !== null) settings.notify_user_subscription_expire_before_days = g.expiryReminderDays.trim();
      return toGeneral(await http.put<Record<string, unknown>>(`/v1/reseller/settings/${getResellerId()}`, { settings }));
    },
    onSuccess: (data) => qc.setQueryData(settingsKey('general'), data),
  });
}

/** Text fields of the company profile (logo/icon URLs change only through uploads). */
export function sameGeneralText(a: GeneralSettings, b: GeneralSettings): boolean {
  return (
    a.appName === b.appName &&
    a.appSlogan === b.appSlogan &&
    a.companyCell === b.companyCell &&
    a.webmasterEmail === b.webmasterEmail &&
    a.companyAddress === b.companyAddress &&
    a.expiryReminderDays === b.expiryReminderDays
  );
}

/** POST /v1/reseller/settings/{id}/logo (multipart file + kind). */
export function useUploadBrandingImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, kind }: { file: File; kind: 'logo' | 'icon' }) => {
      const form = new FormData();
      form.append('file', file);
      form.append('kind', kind);
      return http.upload<{ key: string; url: string }>(`/v1/reseller/settings/${getResellerId()}/logo`, form);
    },
    // Patch the cached URL only — a refetch would discard unsaved form edits.
    onSuccess: (res, { kind }) =>
      qc.setQueryData<GeneralSettings>(settingsKey('general'), (old) =>
        old ? { ...old, [kind === 'icon' ? 'iconUrl' : 'logoUrl']: res.url } : old,
      ),
  });
}

/** A group without sections/fields renders as empty instead of crashing the page. */
function toSettingsGroup(raw: unknown): SettingsGroup {
  const g = camelizeKeys<SettingsGroup>(raw);
  return { ...g, sections: (g?.sections ?? []).map((section) => ({ ...section, fields: section.fields ?? [] })) };
}

/** GET /v1/reseller/settings/{id}/groups/{group} — secrets come back masked. */
export function useSettingsGroup(group: SettingsGroupId, enabled = true) {
  return useQuery({
    queryKey: settingsKey('group', group),
    queryFn: async () => toSettingsGroup(await http.get<unknown>(`/v1/reseller/settings/${getResellerId()}/groups/${group}`)),
    enabled,
  });
}

/** PUT /v1/reseller/settings/{id}/groups/{group} — blank secrets keep the stored value. */
export function useSaveSettingsGroup(group: SettingsGroupId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, string | boolean>) =>
      toSettingsGroup(await http.put<unknown>(`/v1/reseller/settings/${getResellerId()}/groups/${group}`, { values })),
    onSuccess: (data) => qc.setQueryData(settingsKey('group', group), data),
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: (to: string) => http.post<{ sent: boolean; to: string }>(`/v1/reseller/settings/${getResellerId()}/test-email`, { to }),
  });
}

export function useSendTestSms() {
  return useMutation({
    mutationFn: (phone: string) =>
      http.post<{ sent: boolean; gateway: string }>(`/v1/reseller/settings/${getResellerId()}/test-sms`, { phone }),
  });
}

/** Live balance from the default SMS gateway — an external call, so on demand only. */
export function useCheckSmsBalance() {
  return useMutation({
    mutationFn: async () =>
      camelizeKeys<SmsBalance>(await http.get<unknown>(`/v1/reseller/settings/${getResellerId()}/sms-balance`)),
  });
}

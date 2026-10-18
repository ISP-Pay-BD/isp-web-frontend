'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { camelizeKeys, str } from '@/lib/api/case';
import { getAuthUserId } from '@/lib/api/auth-utils';
import { useAuthStore } from '@/stores/auth-store';

export interface AdminProfile {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  whatsapp: string;
  address: string;
  role: string;
  status: string;
  joinedAt: string | null;
  organizationName: string;
  nationalId: string;
  division: string;
  district: string;
}

export interface SecurityOverview {
  twoFactor: { available: boolean; enabled: boolean; pending: boolean; confirmedAt: string | null; enforcedAtLogin: boolean };
  tokensRevokedAt: string | null;
  loginHistory: { id: string; action: string; at: string | null; ip: string; client: string; platform: string; userAgent: string }[];
  events: { id: string; action: string; entity: string; at: string | null; ip: string }[];
}

const PROFILE_KEY = ['admin', 'profile'] as const;
const SECURITY_KEY = ['admin', 'profile', 'security'] as const;

function toProfile(raw: { profile?: Record<string, unknown>; organization?: Record<string, unknown> | null }): AdminProfile {
  const p = raw.profile ?? {};
  const o = raw.organization ?? {};
  return {
    userId: str(p.id),
    name: str(p.name),
    email: str(p.email),
    mobile: str(p.mobile),
    whatsapp: str(p.whatsapp_number),
    address: str(p.address),
    role: str(p.role),
    status: str(p.status),
    joinedAt: p.created_at ? str(p.created_at) : null,
    organizationName: str(o.organization_name) || str(p.organization_name),
    nationalId: str(o.nationalid) || str(p.nationalid),
    division: str(o.division) || str(p.division),
    district: str(o.district),
  };
}

/** GET /v1/reseller/profile/{me} — {profile, organization}. */
export function useAdminProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => toProfile(await http.get<{ profile?: Record<string, unknown>; organization?: Record<string, unknown> }>(`/v1/reseller/profile/${getAuthUserId()}`)),
  });
}

/** PUT profile (name/email/mobile/address) and, when changed, PUT profile/organization. */
export function useUpdateAdminProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ next, prev }: { next: AdminProfile; prev: AdminProfile }) => {
      const id = getAuthUserId();
      const userChanged =
        next.name !== prev.name || next.email !== prev.email || next.mobile !== prev.mobile || next.address !== prev.address;
      const orgChanged =
        next.organizationName !== prev.organizationName ||
        next.nationalId !== prev.nationalId ||
        next.division !== prev.division ||
        next.district !== prev.district;
      if (userChanged) {
        await http.put(`/v1/reseller/profile/${id}`, {
          name: next.name.trim(),
          email: next.email.trim(),
          mobile: next.mobile.trim(),
          address: next.address.trim(),
        });
      }
      if (orgChanged) {
        await http.put(`/v1/reseller/profile/${id}/organization`, {
          organization_name: next.organizationName.trim(),
          nationalid: next.nationalId.trim(),
          division: next.division.trim(),
          district: next.district.trim(),
        });
      }
      return userChanged;
    },
    onSuccess: (userChanged, { next }) => {
      void qc.invalidateQueries({ queryKey: PROFILE_KEY });
      // Keep the header/sidebar name in sync with the saved profile.
      if (userChanged) {
        const user = useAuthStore.getState().user;
        if (user) useAuthStore.setState({ user: { ...user, name: next.name.trim(), email: next.email.trim() } });
      }
    },
  });
}

/** Errors are shown by the page (field messages), so the global toast is muted. */
export function useChangePassword() {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: (input: { current: string; next: string; confirm: string }) =>
      http.post(`/v1/reseller/profile/${getAuthUserId()}/change-password`, {
        current_password: input.current,
        new_password: input.next,
        confirm_password: input.confirm,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SECURITY_KEY }),
  });
}

/** GET /v1/users/me/security — 2FA state, sign-out stamp, login history, events. */
export function useSecurityOverview(enabled = true) {
  return useQuery({
    queryKey: SECURITY_KEY,
    queryFn: async () => camelizeKeys<SecurityOverview>(await http.get<unknown>('/v1/users/me/security')),
    enabled,
  });
}

/**
 * POST /v1/users/me/sessions/revoke-others — every token issued before now
 * dies; this device receives a fresh pair and keeps working.
 */
export function useSignOutOtherDevices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => http.post<{ access_token: string; refresh_token: string }>('/v1/users/me/sessions/revoke-others'),
    onSuccess: (tokens) => {
      useAuthStore.setState({ token: tokens.access_token });
      try {
        localStorage.setItem('isp_refresh_token', tokens.refresh_token);
      } catch {
        // storage unavailable — the access token still works until it expires
      }
      void qc.invalidateQueries({ queryKey: SECURITY_KEY });
    },
  });
}

export interface TwoFactorSetup {
  secret: string;
  otpauthUri: string;
  account: string;
  issuer: string;
}

export function useSetupTwoFactor() {
  return useMutation({
    mutationFn: async () => camelizeKeys<TwoFactorSetup>(await http.post<unknown>('/v1/users/me/2fa/setup')),
  });
}

export function useEnableTwoFactor() {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: (code: string) => http.post('/v1/users/me/2fa/enable', { code }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SECURITY_KEY }),
  });
}

export function useDisableTwoFactor() {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: (input: { code?: string; password?: string }) => http.post('/v1/users/me/2fa/disable', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: SECURITY_KEY }),
  });
}

/** First field message of a validation error, else the error message. */
export function firstErrorDetail(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const details = (error as { details?: Record<string, string[] | string> } | null)?.details;
  if (details) {
    const first = Object.values(details)[0];
    const msg = Array.isArray(first) ? first[0] : first;
    if (msg) return String(msg);
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

/**
 * Customer VPN accounts (/v1/network-ops/vpn/accounts). Saved accounts are
 * `pending_provision`; PPP types (L2TP/PPTP/SSTP/OpenVPN) become `active`
 * only after the router accepts the secret. Passwords are write-only.
 */

export const VPN_TYPES = ['l2tp', 'pptp', 'sstp', 'ovpn', 'wireguard', 'ipsec'] as const;
export type VpnType = (typeof VPN_TYPES)[number];
export type VpnStatus = 'pending_provision' | 'active' | 'disabled';

export interface VpnAccount {
  id: string;
  vpnType: VpnType;
  username: string;
  hasPassword: boolean;
  assignedIp: string | null;
  profile: string | null;
  status: VpnStatus;
  canProvision: boolean;
  userId: string | null;
  customerName: string | null;
  routerId: string | null;
  routerName: string | null;
  lastError: string | null;
  notes: string | null;
  updatedAt: string | null;
}

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const opt = (v: unknown) => str(v) || null;

function mapAccount(raw: unknown): VpnAccount {
  const r = obj(raw);
  const status = str(r.status);
  return {
    id: str(r.id),
    vpnType: str(r.vpn_type) as VpnType,
    username: str(r.username),
    hasPassword: r.has_password === true,
    assignedIp: opt(r.assigned_ip),
    profile: opt(r.profile),
    status: status === 'active' || status === 'disabled' ? status : 'pending_provision',
    canProvision: r.can_provision === true,
    userId: opt(r.user_id),
    customerName: opt(r.customer_name),
    routerId: opt(r.router_id),
    routerName: opt(r.router_name),
    lastError: opt(r.last_error),
    notes: opt(r.notes),
    updatedAt: opt(r.updated_at),
  };
}

const vpnKeys = {
  all: ['admin', 'vpn'] as const,
  list: (params: Record<string, unknown>) => ['admin', 'vpn', 'list', params] as const,
};

export function useVpnAccounts({ page, pageSize, search }: { page: number; pageSize: number; search?: string }) {
  const params = { page, limit: pageSize, search: search || undefined };
  return useQuery({
    queryKey: vpnKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/vpn/accounts', params, { signal });
      const s = obj(res.raw.summary);
      return {
        items: res.items.map(mapAccount),
        meta: res.meta,
        summary: { total: num(s.total), active: num(s.active), pending: num(s.pending_provision), disabled: num(s.disabled) },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useSaveVpnAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id?: string; body: Record<string, unknown> }) =>
      mapAccount(id ? await http.put<unknown>(`/v1/network-ops/vpn/accounts/${id}`, body) : await http.post<unknown>('/v1/network-ops/vpn/accounts', body)),
    onSuccess: (_a, { id }) => {
      toast.success(id ? 'VPN account updated' : 'VPN account saved — pending provisioning');
      qc.invalidateQueries({ queryKey: vpnKeys.all });
    },
  });
}

export function useDeleteVpnAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`/v1/network-ops/vpn/accounts/${id}`),
    onSuccess: () => {
      toast.success('VPN account deleted');
      qc.invalidateQueries({ queryKey: vpnKeys.all });
    },
  });
}

/** Creates the PPP secret on the account's router. */
export function useProvisionVpnAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => mapAccount(await http.post<unknown>(`/v1/network-ops/vpn/accounts/${id}/provision`)),
    onSuccess: (a) => toast.success(`${a.username} provisioned on ${a.routerName ?? 'the router'}`),
    // Failed attempts record last_error on the account, so refresh either way.
    onSettled: () => qc.invalidateQueries({ queryKey: vpnKeys.all }),
  });
}

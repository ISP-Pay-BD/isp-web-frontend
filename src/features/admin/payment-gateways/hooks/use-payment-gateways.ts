'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/lib/api/client';
import { getResellerId } from '@/lib/api/auth-utils';
import { num, str } from '@/lib/api/case';

export interface GatewayField {
  key: string;
  label: string;
  secret: boolean;
  configured: boolean;
  /** Non-secret value; null for secrets (never sent by the backend). */
  value: string | null;
  masked: string | null;
}

export interface PaymentGateway {
  id: string;
  name: string;
  enabled: boolean;
  mode: 'sandbox' | 'live';
  configured: boolean;
  chargePercent: number;
  merchantId: string;
  callbackUrl: string;
  successRatePct: number | null;
  transactions30d: number;
  volume30d: number;
  todayVolume: number;
  lastSettlementAt: string | null;
  fields: GatewayField[];
  editable: boolean;
}

type Raw = Record<string, unknown>;

function mapGateway(r: Raw, editable = false): PaymentGateway {
  return {
    id: str(r.id),
    name: str(r.name),
    enabled: Boolean(r.enabled),
    mode: str(r.mode) === 'live' ? 'live' : 'sandbox',
    configured: Boolean(r.configured),
    chargePercent: num(r.charge_percent),
    merchantId: str(r.merchant_id),
    callbackUrl: str(r.callback_url),
    successRatePct: r.success_rate_pct === null || r.success_rate_pct === undefined ? null : num(r.success_rate_pct),
    transactions30d: num(r.transactions_30d),
    volume30d: num(r.volume_30d),
    todayVolume: num(r.today_volume),
    lastSettlementAt: r.last_settlement_at ? str(r.last_settlement_at) : null,
    fields: Array.isArray(r.fields)
      ? (r.fields as Raw[]).map((f) => ({
          key: str(f.key),
          label: str(f.label),
          secret: Boolean(f.secret),
          configured: Boolean(f.configured),
          value: f.value === null || f.value === undefined ? null : str(f.value),
          masked: f.masked ? str(f.masked) : null,
        }))
      : [],
    editable: r.editable === undefined ? editable : Boolean(r.editable),
  };
}

export const gatewayKeys = {
  list: ['admin', 'payment-gateways'] as const,
  detail: (id: string) => ['admin', 'payment-gateways', id] as const,
};

/** GET /v1/reseller/payment-gateways/{rid} — tenant gateways (secrets masked) + 30-day ledger figures. */
export function usePaymentGateways() {
  return useQuery({
    queryKey: gatewayKeys.list,
    queryFn: async () => {
      const raw = await http.get<{ items?: Raw[]; editable?: boolean }>(`/v1/reseller/payment-gateways/${getResellerId()}`);
      const editable = Boolean(raw?.editable);
      return { items: (raw?.items ?? []).map((g) => mapGateway(g, editable)), editable };
    },
  });
}

/** GET /v1/reseller/billing/gateways/{id} — one gateway with its credential fields. */
export function usePaymentGateway(id: string) {
  return useQuery({
    queryKey: gatewayKeys.detail(id),
    queryFn: async () => mapGateway(await http.get<Raw>(`/v1/reseller/billing/gateways/${id}`)),
    enabled: Boolean(id),
  });
}

export interface GatewayUpdate {
  enabled?: boolean;
  mode?: 'sandbox' | 'live';
  chargePercent?: number;
  credentials?: Record<string, string>;
}

/** PUT /v1/reseller/billing/gateways/{id} — empty secret values keep the stored secret. */
export function useUpdatePaymentGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, update }: { id: string; update: GatewayUpdate }) => {
      const body: Record<string, unknown> = {};
      if (update.enabled !== undefined) body.enabled = update.enabled;
      if (update.mode) body.mode = update.mode;
      if (update.chargePercent !== undefined) body.charge_percent = update.chargePercent;
      if (update.credentials) body.credentials = update.credentials;
      return mapGateway(await http.put<Raw>(`/v1/reseller/billing/gateways/${id}`, body));
    },
    onSuccess: (gw, { update }) => {
      qc.setQueryData(gatewayKeys.detail(gw.id), gw);
      qc.invalidateQueries({ queryKey: gatewayKeys.list });
      toast.success(
        update.enabled !== undefined && Object.keys(update).length === 1
          ? `${gw.name} ${gw.enabled ? 'enabled' : 'disabled'}`
          : `${gw.name} settings saved`,
      );
    },
  });
}

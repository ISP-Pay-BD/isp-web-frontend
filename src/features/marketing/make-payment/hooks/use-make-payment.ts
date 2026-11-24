'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { camelizeKeys, num, str } from '@/lib/api/case';
import type { PayGateway, PublicInvoice } from '../types';

type Raw = Record<string, unknown>;

function toInvoice(value: unknown): PublicInvoice {
  const r = camelizeKeys<Raw>(value) ?? {};
  const list = Array.isArray(r.gateways) ? (r.gateways as Raw[]) : [];
  return {
    paymentId: str(r.paymentId),
    amountBdt: num(r.amount),
    companyName: str(r.companyName),
    gateways: list.map((g): PayGateway => ({
      gateway: str(g.gateway),
      label: str(g.label) || str(g.gateway),
      chargePercent: num(g.chargePercent),
      amountBdt: num(g.amount),
      chargeBdt: num(g.charge),
      totalBdt: num(g.total),
    })),
  };
}

const path = (id: string, sig?: string) => {
  const base = `/v1/public/payments/make-payment/${encodeURIComponent(id)}`;
  return sig ? `${base}?sig=${encodeURIComponent(sig)}` : base;
};

/** GET /v1/public/payments/make-payment/{id} — 404 when the invoice is unknown, wrong signature, or no longer pending. */
export function usePublicInvoice(id: string, sig?: string) {
  return useQuery({
    queryKey: ['public', 'make-payment', id, sig],
    queryFn: async ({ signal }) => toInvoice(await http.get<unknown>(path(id, sig), undefined, signal)),
    enabled: /^\d+$/.test(id),
    retry: false,
    staleTime: 0,
  });
}

/** POST /v1/public/payments/make-payment/{id}/{gateway} → `{redirect_url}` (the hosted gateway page). */
export function useStartPayment(id: string, sig?: string) {
  return useMutation({
    mutationFn: async (gateway: string) => {
      const base = `${path(id, sig)}/${encodeURIComponent(gateway)}`;
      const url = sig ? `${base}?sig=${encodeURIComponent(sig)}` : base;
      const r = (await http.post<Raw>(url)) ?? {};
      return str(r.redirect_url);
    },
  });
}

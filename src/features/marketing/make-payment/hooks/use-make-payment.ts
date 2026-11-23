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

const path = (id: string) => `/v1/public/payments/make-payment/${encodeURIComponent(id)}`;

/** GET /v1/public/payments/make-payment/{id} — 404 when the invoice is unknown or no longer pending. */
export function usePublicInvoice(id: string) {
  return useQuery({
    queryKey: ['public', 'make-payment', id],
    queryFn: async ({ signal }) => toInvoice(await http.get<unknown>(path(id), undefined, signal)),
    enabled: /^\d+$/.test(id),
    retry: false,
    staleTime: 0,
  });
}

/** POST /v1/public/payments/make-payment/{id}/{gateway} → `{redirect_url}` (the hosted gateway page). */
export function useStartPayment(id: string) {
  return useMutation({
    mutationFn: async (gateway: string) => {
      const r = (await http.post<Raw>(`${path(id)}/${encodeURIComponent(gateway)}`)) ?? {};
      return str(r.redirect_url);
    },
  });
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { camelizeKeys, num, str } from '@/lib/api/case';
import type {
  CaptiveLocator,
  CaptivePayResult,
  CaptiveReconnectResult,
  CaptiveSession,
} from '../types';

type Raw = Record<string, unknown>;

function obj(value: unknown): Raw | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Raw) : null;
}

/** Only send what the MikroTik redirect gave us; the backend falls back to the request IP. */
function locatorParams({ rid, ip, mac }: CaptiveLocator) {
  return {
    ...(rid ? { rid } : {}),
    ...(ip ? { ip } : {}),
    ...(mac ? { mac } : {}),
  };
}

function toCaptiveSession(value: unknown): CaptiveSession {
  const r = camelizeKeys<Raw>(value) ?? {};
  const c = obj(r.customer);
  const isp = obj(r.isp);
  const p = obj(r.payment);
  return {
    found: r.found === true,
    customer: c
      ? {
          id: str(c.id),
          name: str(c.name),
          username: str(c.username),
          packageName: str(c.packageName),
          bandwidth: str(c.bandwidth),
          priceBdt: num(c.priceBdt),
          expiresAt: str(c.expiresAt) || null,
          expired: c.expired === true,
          subscriptionStatus: str(c.subscriptionStatus),
          connStatus: str(c.connStatus),
          dueBdt: num(c.dueBdt),
        }
      : null,
    isp: isp ? { name: str(isp.name), phone: str(isp.phone) } : null,
    payment: p
      ? { id: str(p.id), invoice: str(p.invoice), amountBdt: num(p.amountBdt), payUrl: str(p.payUrl) }
      : null,
    canReconnect: r.canReconnect === true,
  };
}

const sessionKey = (locator: CaptiveLocator) => ['captive', 'session', locator] as const;

/** GET /v1/public/captive/session — `found: false` (or a 404) means the connection was not identified. */
export function useCaptiveSession(locator: CaptiveLocator) {
  return useQuery({
    queryKey: sessionKey(locator),
    queryFn: async ({ signal }) =>
      toCaptiveSession(await http.get<unknown>('/v1/public/captive/session', locatorParams(locator), signal)),
    staleTime: 0,
  });
}

/** POST /v1/public/captive/pay → redirect target `pay_url`. */
export function useCaptivePay(locator: CaptiveLocator) {
  return useMutation({
    mutationFn: async (): Promise<CaptivePayResult> => {
      const r = camelizeKeys<Raw>(await http.post<unknown>('/v1/public/captive/pay', locatorParams(locator))) ?? {};
      return {
        paymentId: str(r.paymentId),
        invoice: str(r.invoice),
        amountBdt: num(r.amountBdt),
        payUrl: str(r.payUrl),
      };
    },
  });
}

/** POST /v1/public/captive/reconnect — 409 STILL_EXPIRED surfaces the backend message. */
export function useCaptiveReconnect(locator: CaptiveLocator) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<CaptiveReconnectResult> => {
      const r = camelizeKeys<Raw>(await http.post<unknown>('/v1/public/captive/reconnect', locatorParams(locator))) ?? {};
      return { status: str(r.status) === 'success' ? 'success' : 'pending', message: str(r.message) };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKey(locator) }),
  });
}

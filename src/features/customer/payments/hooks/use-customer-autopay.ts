'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

export interface AutoPayGateway {
  slug: string;
  name: string;
}

export interface AutoPayPreference {
  enabled: boolean;
  preferredGateway: string | null;
  notifyDaysBefore: number;
  notifyDaysMax: number;
  /** Gateways the customer's ISP has enabled. */
  gateways: AutoPayGateway[];
  updatedAt: string | null;
}

export interface AutoPayInput {
  enabled: boolean;
  preferredGateway: string | null;
  notifyDaysBefore: number;
}

export const autoPayKey = ['customer', 'autopay'] as const;

function mapAutoPay(raw: unknown): AutoPayPreference {
  const r = (raw ?? {}) as Record<string, unknown>;
  const gateways = Array.isArray(r.gateways) ? (r.gateways as Record<string, unknown>[]) : [];
  return {
    enabled: Boolean(r.enabled),
    preferredGateway: r.preferred_gateway ? str(r.preferred_gateway) : null,
    notifyDaysBefore: num(r.notify_days_before, 3),
    notifyDaysMax: num(r.notify_days_max, 30),
    gateways: gateways.map((g) => ({ slug: str(g.slug), name: str(g.name) })),
    updatedAt: r.updated_at ? str(r.updated_at) : null,
  };
}

/** GET /v1/customer/autopay — the JWT customer's auto-pay preference. */
export function useCustomerAutoPay() {
  return useQuery({
    queryKey: autoPayKey,
    queryFn: async () => mapAutoPay(await http.get<unknown>('/v1/customer/autopay')),
  });
}

/** PUT /v1/customer/autopay — stores the preference only; nothing is charged. */
export function useUpdateCustomerAutoPay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AutoPayInput) =>
      mapAutoPay(
        await http.put<unknown>('/v1/customer/autopay', {
          enabled: input.enabled,
          preferred_gateway: input.preferredGateway,
          notify_days_before: input.notifyDaysBefore,
        }),
      ),
    onSuccess: (data) => queryClient.setQueryData(autoPayKey, data),
  });
}

'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { mapFundingEntry, mapFundingSummary, mapPop } from '../types';

export type { PopReseller, PopFundingEntry, PopFundingSummary } from '../types';

export const popKeys = {
  all: ['admin', 'pops'] as const,
  list: (params: Record<string, unknown>) => ['admin', 'pops', 'list', params] as const,
  funding: (popId: string, params: Record<string, unknown>) => ['admin', 'pops', 'funding', popId, params] as const,
};

export interface PopListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: 'active' | 'inactive' | '';
}

/** GET /v1/pops — the tenant's POPs with real wallet balances (`fund`) and client counts. */
export function usePops({ page, pageSize, search, status }: PopListParams) {
  const params = { page, per_page: pageSize, search: search || undefined, status: status || undefined };
  return useQuery({
    queryKey: popKeys.list(params),
    queryFn: async () => {
      const res = await adminService.getPops(params);
      return { items: res.items.map(mapPop), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

export interface PopFundingParams {
  page: number;
  pageSize: number;
  type?: 'credit' | 'debit' | '';
}

/** GET /v1/pops/{id}/funding — paginated ledger + totals over the filtered set. */
export function usePopFunding(popId: string | null, { page, pageSize, type }: PopFundingParams) {
  const params = { page, per_page: pageSize, type: type || undefined };
  return useQuery({
    queryKey: popKeys.funding(popId ?? '', params),
    queryFn: async () => {
      const res = await adminService.getPopFunding(popId as string, params);
      return { items: res.items.map(mapFundingEntry), meta: res.meta, summary: mapFundingSummary(res.raw.summary) };
    },
    enabled: Boolean(popId),
    placeholderData: keepPreviousData,
  });
}

export interface PopFundingPayload {
  type: 'credit' | 'debit';
  amount: number;
  paid_via?: string;
  received_date?: string;
  invoice_number?: string;
  comments?: string;
  /** Idempotency key: a double-submitted form records one entry. */
  request_id: string;
}

/** POST /v1/pops/{id}/funding — moves the POP wallet balance (FundService). */
export function useCreatePopFunding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ popId, payload }: { popId: string; payload: PopFundingPayload }) =>
      adminService.createPopFunding(popId, { ...payload }),
    meta: { silent: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: popKeys.all }),
  });
}

/** POST /v1/pops — PopController::create (web Reseller::submit rules). */
export function useCreatePop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminService.createPop(payload),
    meta: { silent: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: popKeys.all }),
  });
}

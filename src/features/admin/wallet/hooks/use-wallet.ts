'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { invalidatePlatformBilling } from '@/features/admin/payment/hooks/use-platform-checkout';

export interface WalletAddon {
  key: string;
  label: string;
  priceBdt: number;
}

export interface TenantWalletData {
  balanceBdt: number;
  isPayg: boolean;
  willExpire: string | null;
  graceUntil: string | null;
  estimate: {
    baseFeeBdt: number;
    perUserRateBdt: number;
    totalUsers: number;
    usageCostBdt: number;
    addonTotalBdt: number;
    totalBdt: number;
    cycleDays: number;
  };
  addonCatalog: WalletAddon[];
  chosenAddons: string[];
  minTopupBdt: number;
  maxTopupBdt: number;
  providers: string[];
}

export interface WalletTransaction {
  id: string;
  type: string;
  amountBdt: number;
  balanceAfterBdt: number;
  reference: string;
  description: string;
  createdAt: string;
}

type Raw = Record<string, unknown>;

export const walletKeys = {
  all: ['admin', 'wallet'] as const,
  summary: ['admin', 'wallet', 'summary'] as const,
  tx: (f: object) => ['admin', 'wallet', 'transactions', f] as const,
};

/** GET /v1/wallet — balance, PAYG estimate, add-on catalog (tenant admin only). */
export function useWallet() {
  return useQuery({
    queryKey: walletKeys.summary,
    queryFn: async (): Promise<TenantWalletData> => {
      const r = await http.get<Raw>('/v1/wallet');
      const e = (r.estimate ?? {}) as Raw;
      return {
        balanceBdt: num(r.balance),
        isPayg: Boolean(r.is_payg),
        willExpire: r.will_expire ? str(r.will_expire) : null,
        graceUntil: r.grace_until ? str(r.grace_until) : null,
        estimate: {
          baseFeeBdt: num(e.base_fee),
          perUserRateBdt: num(e.per_user_rate),
          totalUsers: num(e.total_users),
          usageCostBdt: num(e.usage_cost),
          addonTotalBdt: num(e.addon_total),
          totalBdt: num(e.total),
          cycleDays: num(e.cycle_days),
        },
        addonCatalog: (Array.isArray(r.addon_catalog) ? (r.addon_catalog as Raw[]) : []).map((a) => ({
          key: str(a.key),
          label: str(a.label),
          priceBdt: num(a.price),
        })),
        chosenAddons: Array.isArray(r.chosen_addons) ? (r.chosen_addons as unknown[]).map((v) => str(v)) : [],
        minTopupBdt: num(r.min_topup),
        maxTopupBdt: num(r.max_topup),
        providers: Array.isArray(r.checkout_providers) ? (r.checkout_providers as unknown[]).map((v) => str(v)) : [],
      };
    },
  });
}

export interface WalletTxFilters {
  page: number;
  pageSize: number;
  type: 'all' | 'credit' | 'debit';
  search: string;
}

/** GET /v1/wallet/transactions — paginated ledger. */
export function useWalletTransactions(filters: WalletTxFilters) {
  return useQuery({
    queryKey: walletKeys.tx(filters),
    queryFn: async ({ signal }) => {
      const params: Record<string, unknown> = { page: filters.page, per_page: filters.pageSize };
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.search) params.search = filters.search;
      const res = await http.getPage<Raw>('/v1/wallet/transactions', params, { signal });
      return {
        meta: res.meta,
        items: res.items.map(
          (t): WalletTransaction => ({
            id: str(t.id),
            type: str(t.type),
            amountBdt: num(t.amount),
            balanceAfterBdt: num(t.balance_after),
            reference: str(t.reference),
            description: str(t.description),
            createdAt: str(t.created_at),
          }),
        ),
      };
    },
    placeholderData: keepPreviousData,
  });
}

/**
 * POST /v1/wallet/topup {amount, method} — pending top-up invoice + hosted
 * gateway checkout; the wallet is credited only after the gateway confirms.
 */
export function useWalletTopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { amountBdt: number; method: string }) =>
      http.post<Raw>('/v1/wallet/topup', { amount: input.amountBdt, method: input.method }),
    onSuccess: (data) => {
      invalidatePlatformBilling(qc);
      const url = str(data?.redirect_url);
      if (url) {
        toast.message('Top-up invoice created — redirecting to the payment gateway…');
        window.location.assign(url);
      } else {
        toast.error('The gateway did not return a checkout page. The top-up invoice is saved as pending.');
      }
    },
    onError: (err) => {
      // A pending invoice may exist even when the gateway refused to start.
      invalidatePlatformBilling(qc);
      toast.error(errorMessage(err, 'Top-up could not be started'));
    },
  });
}

/** PUT /v1/wallet/addons {addons} */
export function useWalletAddons() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (addons: string[]) => http.put<{ chosen_addons?: string[] }>('/v1/wallet/addons', { addons }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.summary });
      toast.success('Add-ons updated. They apply from your next monthly charge.');
    },
  });
}

/** POST /v1/wallet/switch-payg */
export function useSwitchPayg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => http.post<{ is_payg?: boolean; charged?: boolean | null }>('/v1/wallet/switch-payg'),
    onSuccess: () => {
      invalidatePlatformBilling(qc);
      toast.success('You are now on Pay-As-You-Go.');
    },
  });
}

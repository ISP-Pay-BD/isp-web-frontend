'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminService } from '@/lib/api/services/admin.service';
import { http } from '@/lib/api/client';
import { getResellerId } from '@/lib/api/auth-utils';
import {
  mapReferral,
  mapRewardConfig,
  mapRewardsReport,
  type ReferralStatus,
} from '../types';

export const rewardKeys = {
  all: ['admin', 'rewards'] as const,
  config: ['admin', 'rewards', 'config'] as const,
  report: ['admin', 'rewards', 'report'] as const,
  referrals: (params: Record<string, unknown>) => ['admin', 'rewards', 'referrals', params] as const,
};

/** GET /v1/reseller/rewards/{id}/config — resolved config for this tenant. */
export function useRewardsConfig() {
  return useQuery({
    queryKey: rewardKeys.config,
    queryFn: async () => mapRewardConfig(await adminService.getRewardsConfig()),
  });
}

/** GET /v1/reseller/rewards/{id}/report — counts, points, top referrers, 12-month series. */
export function useRewardsReport() {
  return useQuery({
    queryKey: rewardKeys.report,
    queryFn: async () => mapRewardsReport(await adminService.getRewardsReport()),
  });
}

export interface ReferralListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: ReferralStatus | '';
}

/** GET /v1/reseller/referrals/{id} — server-paginated, searchable, status filter. */
export function useReferrals({ page, pageSize, search, status }: ReferralListParams) {
  const params = { page, per_page: pageSize, search: search || undefined, status: status || undefined };
  return useQuery({
    queryKey: rewardKeys.referrals(params),
    queryFn: async () => {
      const res = await adminService.getReferrals(params);
      return { items: res.items.map(mapReferral), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** PUT /v1/reseller/rewards/{id}/config — keys per RewardConfigService::SPEC_DEFAULTS. */
export function useSaveRewardsConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Record<string, number>) => adminService.updateRewardsConfig(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rewardKeys.config });
      qc.invalidateQueries({ queryKey: rewardKeys.report });
    },
  });
}

/** POST /v1/reseller/referrals/{id}/{referralId}/approve — activates the referee + awards points. */
export function useApproveReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (referralId: string) => adminService.approveReferral(referralId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rewardKeys.all });
      toast.success('Referral approved and points credited');
    },
  });
}

/** POST /v1/reseller/referrals/{id}/{referralId}/reject — body { reason }. */
export function useRejectReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ referralId, reason }: { referralId: string; reason: string }) =>
      adminService.rejectReferral(referralId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rewardKeys.all });
      toast.success('Referral rejected');
    },
  });
}

/**
 * POST /v1/reseller/rewards/{rid}/bonus — staff grant (+) or deduction (−) of
 * points for one customer. `requestId` makes a retried submit idempotent.
 */
export function useGrantRewardPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { customerId: string; points: number; note: string; requestId: string }) =>
      http.post<{ posted: boolean; duplicate: boolean; balance: number; available: number }>(
        `/v1/reseller/rewards/${getResellerId()}/bonus`,
        { customer_id: Number(input.customerId), points: input.points, note: input.note, request_id: input.requestId },
      ),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: rewardKeys.all });
      toast.success(res.duplicate ? 'Already applied' : `Points updated — balance ${res.balance.toLocaleString()} pts`);
    },
  });
}

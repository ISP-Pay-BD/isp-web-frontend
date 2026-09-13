'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { toast } from 'sonner';
import type { ReferralTransaction, RewardConfig, TopReferrer } from '@/data/admin/rewards.data';

/**
 * Adapts the backend rewards payloads to the shape the rewards screen expects.
 *
 * Backend surfaces used:
 *  - `GET /v1/reseller/rewards/{id}/config`  → { owner_id, config, global, defaults }
 *  - `GET /v1/reseller/referrals/{id}`       → { items: [...], pagination }
 *  - `GET /v1/reseller/rewards/{id}/report`  → { referrals, rewards, top_referrers }
 */
export function useRewards() {
  const queryClient = useQueryClient();

  const configQuery = useQuery({
    queryKey: ['admin', 'domain', 'rewards', 'config'],
    queryFn: () => adminService.getRewardsConfig(),
  });

  const referralsQuery = useQuery({
    queryKey: ['admin', 'domain', 'rewards', 'referrals'],
    queryFn: () => adminService.getReferrals(),
  });

  const reportQuery = useQuery({
    queryKey: ['admin', 'domain', 'rewards', 'report'],
    queryFn: () => adminService.getRewardsReport(),
  });

  const data = useMemo(() => {
    const cfg = (configQuery.data ?? {}) as Record<string, unknown>;
    const configObj = (cfg.config ?? {}) as Record<string, unknown>;
    const referralsRaw = (referralsQuery.data ?? { items: [] }) as { items?: Record<string, unknown>[] };
    const report = (reportQuery.data ?? {}) as Record<string, unknown>;
    const reportReferrals = (report.referrals ?? {}) as Record<string, unknown>;
    const reportRewards = (report.rewards ?? {}) as Record<string, unknown>;
    const topRaw = Array.isArray(report.top_referrers) ? report.top_referrers : [];

    const rewardConfig: RewardConfig = {
      pointsPerReferral: Number(configObj.referral_points ?? 0),
      pointsToBdtRatio: Number(configObj.point_value_bdt ?? 1),
      minPointsToRedeem: Number(configObj.max_redeem_percent ?? 0),
      programEnabled: Number(configObj.referral_enabled ?? 1) === 1,
    };

    const transactions: ReferralTransaction[] = (referralsRaw.items ?? []).map((r) => {
      const status = String(r.status ?? 'pending').toLowerCase();
      return {
        id: String(r.id ?? ''),
        referrerName: String(r.referrer_name ?? ''),
        referrerPhone: '',
        refereeName: String(r.referee_name ?? ''),
        refereePhone: String(r.referee_mobile ?? ''),
        packageSubscribed: String(r.package_id ?? ''),
        pointsEarned: Number(r.points_awarded ?? 0),
        status: status === 'verified' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
        date: String(r.registered_at ?? ''),
      };
    });

    const topReferrers: TopReferrer[] = topRaw.map((t) => {
      const row = t as Record<string, unknown>;
      return {
        id: String(row.referrer_id ?? ''),
        name: String(row.referrer_name ?? ''),
        phone: '',
        totalReferrals: Number(row.verified ?? 0),
        totalPoints: 0,
        convertedCount: Number(row.verified ?? 0),
      };
    });

    return {
      config: rewardConfig,
      transactions,
      topReferrers,
      rawConfig: cfg,
      summary: {
        totalReferrals: Number(reportReferrals.total ?? 0),
        verifiedReferrals: Number(reportReferrals.verified ?? 0),
        pendingReferrals: Number(reportReferrals.pending ?? 0),
        pointsIssued: Number(reportRewards.points_issued ?? 0),
        pointsRedeemed: Number(reportRewards.points_redeemed ?? 0),
        rewardCostBdt: Number(reportRewards.reward_cost_bdt ?? 0),
      },
    };
  }, [configQuery.data, referralsQuery.data, reportQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'domain', 'rewards'] });
  };

  /** PUT /v1/reseller/rewards/{id}/config — keys per RewardSources::SPEC_DEFAULTS. */
  const saveConfigMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => adminService.updateRewardsConfig(values),
    onSuccess: () => {
      invalidate();
      toast.success('Referral program configuration updated successfully!');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update configuration'),
  });

  /** POST /v1/reseller/referrals/{id}/{referralId}/approve */
  const approveMutation = useMutation({
    mutationFn: (referralId: string) => adminService.approveReferral(referralId),
    onSuccess: () => {
      invalidate();
      toast.success('Referral approved & points credited');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to approve referral'),
  });

  /** POST /v1/reseller/referrals/{id}/{referralId}/reject */
  const rejectMutation = useMutation({
    mutationFn: (vars: { referralId: string; reason?: string }) =>
      adminService.rejectReferral(vars.referralId, vars.reason ?? ''),
    onSuccess: () => {
      invalidate();
      toast.success('Referral rejected');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to reject referral'),
  });

  const isLoading = configQuery.isLoading || referralsQuery.isLoading || reportQuery.isLoading;
  const isError = configQuery.isError || referralsQuery.isError || reportQuery.isError;
  const refetch = () => {
    configQuery.refetch();
    referralsQuery.refetch();
    reportQuery.refetch();
  };

  return {
    data,
    isLoading,
    isError,
    refetch,
    saveConfigMutation,
    approveMutation,
    rejectMutation,
  };
}

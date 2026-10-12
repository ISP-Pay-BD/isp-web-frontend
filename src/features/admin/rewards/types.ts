import { num, str } from '@/lib/api/case';

/**
 * Admin rewards / referral types, mapped once from the zapi payloads:
 *  - GET /v1/reseller/rewards/{id}/config → { config: {referral_points, point_value_bdt, max_redeem_percent, referral_enabled, …} }
 *  - GET /v1/reseller/referrals/{id}      → { items: [...], pagination }
 *  - GET /v1/reseller/rewards/{id}/report → { referrals, rewards, top_referrers, monthly }
 */

export type ReferralStatus = 'pending' | 'verified' | 'rejected' | 'flagged';

export const REFERRAL_STATUSES: ReferralStatus[] = ['pending', 'verified', 'rejected', 'flagged'];

export interface RewardConfig {
  pointsPerReferral: number;
  pointValueBdt: number;
  /** Cap on how much of a bill points may pay, in % (backend `max_redeem_percent`). */
  maxRedeemPercent: number;
  referralEnabled: boolean;
}

export interface ReferralRow {
  id: string;
  referrerId: string;
  referrerName: string;
  refereeName: string;
  refereeMobile: string;
  referralCode: string;
  packageName: string;
  status: ReferralStatus;
  pointsAwarded: number;
  registeredAt: string;
  fraudReason: string;
}

export interface TopReferrer {
  id: string;
  name: string;
  totalReferrals: number;
  verified: number;
  points: number;
}

export interface MonthlyReferrals {
  month: string;
  total: number;
  verified: number;
  rejected: number;
  points: number;
}

export interface RewardsReport {
  referrals: {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
    flagged: number;
    conversionRate: number;
  };
  rewards: {
    pointsIssued: number;
    pointsRedeemed: number;
    rewardCostBdt: number;
    pointValueBdt: number;
  };
  topReferrers: TopReferrer[];
  monthly: MonthlyReferrals[];
}

type Raw = Record<string, unknown>;

const asRecord = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});

export function mapRewardConfig(raw: unknown): RewardConfig {
  const config = asRecord(asRecord(raw).config);
  return {
    pointsPerReferral: num(config.referral_points),
    pointValueBdt: num(config.point_value_bdt),
    maxRedeemPercent: num(config.max_redeem_percent),
    referralEnabled: num(config.referral_enabled) === 1,
  };
}

function toStatus(v: unknown): ReferralStatus {
  const s = str(v).toLowerCase();
  return (REFERRAL_STATUSES as string[]).includes(s) ? (s as ReferralStatus) : 'pending';
}

export function mapReferral(raw: Raw): ReferralRow {
  return {
    id: str(raw.id),
    referrerId: str(raw.referrer_id),
    referrerName: str(raw.referrer_name),
    refereeName: str(raw.referee_name),
    refereeMobile: str(raw.referee_mobile),
    referralCode: str(raw.referral_code),
    packageName: str(raw.package_name),
    status: toStatus(raw.status),
    pointsAwarded: num(raw.points_awarded),
    registeredAt: str(raw.registered_at),
    fraudReason: str(raw.fraud_reason),
  };
}

export function mapRewardsReport(raw: unknown): RewardsReport {
  const r = asRecord(raw);
  const referrals = asRecord(r.referrals);
  const rewards = asRecord(r.rewards);
  return {
    referrals: {
      total: num(referrals.total),
      pending: num(referrals.pending),
      verified: num(referrals.verified),
      rejected: num(referrals.rejected),
      flagged: num(referrals.flagged),
      conversionRate: num(referrals.conversion_rate),
    },
    rewards: {
      pointsIssued: num(rewards.points_issued),
      pointsRedeemed: num(rewards.points_redeemed),
      rewardCostBdt: num(rewards.reward_cost_bdt),
      pointValueBdt: num(rewards.point_value_bdt),
    },
    topReferrers: (Array.isArray(r.top_referrers) ? r.top_referrers : []).map((t) => {
      const row = asRecord(t);
      return {
        id: str(row.referrer_id),
        name: str(row.referrer_name),
        totalReferrals: num(row.total),
        verified: num(row.verified),
        points: num(row.points),
      };
    }),
    monthly: (Array.isArray(r.monthly) ? r.monthly : []).map((m) => {
      const row = asRecord(m);
      return {
        month: str(row.month),
        total: num(row.total),
        verified: num(row.verified),
        rejected: num(row.rejected),
        points: num(row.points),
      };
    }),
  };
}


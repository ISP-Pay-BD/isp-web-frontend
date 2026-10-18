'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

import { formatCount } from '@/lib/format';
export type FeatureValue = string | boolean;

export interface PricingTier {
  id: string;
  name: string;
  priceBdt: number;
  /** Billing period label derived from the package's period in days */
  period: string;
  /** Subscriber cap; null = unlimited */
  customers: number | null;
  trialDays: number;
  features: string[];
}

export interface PaygPricing {
  name: string;
  baseFeeBdt: number;
  pricePerCustomerBdt: number;
  minTopupBdt: number;
  trialDays: number;
  addons: { key: string; name: string; priceBdt: number }[];
}

export interface ComparisonPlan {
  id: string;
  name: string;
  subtitle: string;
  priceBdt: number | null;
  period: string;
  highlighted?: boolean;
  cta: string;
}

export interface ComparisonGroup {
  title: string;
  features: { label: string; values: FeatureValue[] }[];
}

type RawPlan = {
  id: number;
  name: string;
  price_bdt: number;
  preview_days: number;
  free_days?: number;
  pricing_type: string;
  max_customers: number;
  trial_days: number;
  features: string[] | null;
};
type RawPayg = {
  name: string;
  base_fee: number;
  per_user_rate: number;
  min_topup: number;
  trial_days: number;
  addons: { key: string; name: string; price: number }[];
} | null;

/** admin_packages.pricing_type → the renewal period shown next to the price. */
function periodLabel(pricingType: string): string {
  if (pricingType === 'yearly') return 'year';
  if (pricingType === 'weekly') return 'week';
  return 'month';
}

/**
 * Public plan tiers + PAYG rates from GET /api/v1/public/registration/plans
 * (the same admin packages the signup flow sells). The comparison matrix is
 * built from each plan's own feature list, so it can't drift from the plans.
 */
export function useMarketingPricing() {
  return useQuery({
    queryKey: ['marketing', 'pricing'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const raw = await http.get<{ plans: RawPlan[]; payg: RawPayg }>('/v1/public/registration/plans');

      const tiers: PricingTier[] = (raw.plans ?? []).map((p) => ({
        id: String(p.id),
        name: str(p.name),
        priceBdt: num(p.price_bdt),
        period: periodLabel(str(p.pricing_type)),
        customers: num(p.max_customers) > 0 ? num(p.max_customers) : null,
        // Free days for a new signup: trial_days, else the plan's preview days (web signup rule).
        trialDays: num(p.free_days, num(p.trial_days) > 0 ? num(p.trial_days) : num(p.preview_days)),
        features: Array.isArray(p.features) ? p.features.map((f) => str(f)).filter(Boolean) : [],
      }));

      const payg: PaygPricing | null = raw.payg
        ? {
            name: str(raw.payg.name, 'Pay As You Go'),
            baseFeeBdt: num(raw.payg.base_fee),
            pricePerCustomerBdt: num(raw.payg.per_user_rate),
            minTopupBdt: num(raw.payg.min_topup),
            trialDays: num(raw.payg.trial_days),
            addons: (raw.payg.addons ?? []).map((a) => ({ key: str(a.key), name: str(a.name), priceBdt: num(a.price) })),
          }
        : null;

      const comparisonPlans: ComparisonPlan[] = tiers.map((t) => ({
        id: t.id,
        name: t.name,
        subtitle: t.customers ? `Up to ${formatCount(t.customers)} subscribers` : 'Unlimited subscribers',
        priceBdt: t.priceBdt,
        period: `/${t.period === 'month' ? 'mo' : t.period}`,
        cta: t.trialDays > 0 ? 'Start Free Trial' : 'Get Started',
      }));

      const allFeatures = Array.from(new Set(tiers.flatMap((t) => t.features)));
      const comparisonGroups: ComparisonGroup[] = [
        {
          title: 'Plan limits',
          features: [
            { label: 'Subscribers', values: tiers.map((t) => (t.customers ? formatCount(t.customers) : 'Unlimited')) },
            { label: 'Free trial', values: tiers.map((t) => (t.trialDays > 0 ? `${t.trialDays} days` : false)) },
          ],
        },
        ...(allFeatures.length
          ? [{ title: 'Included features', features: allFeatures.map((label) => ({ label, values: tiers.map((t) => t.features.includes(label)) })) }]
          : []),
      ];

      const trialDays = Math.max(0, ...tiers.map((t) => t.trialDays), payg?.trialDays ?? 0);

      return { tiers, payg, comparisonPlans, comparisonGroups, trialDays };
    },
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { pricingPlans } from '@/data/marketing/landing.data';
import { pricingTiers, paygCalculator, calculatePaygMonthly, comparisonGroups, comparisonPlans } from '@/data/marketing/pricing.data';

/**
 * Marketing pricing is site content, not tenant data: the only backend
 * endpoint in this domain (`GET /v1/platform/subscriptions`) returns
 * *platform-tenant billing rows* (admin surface), not the public plan
 * tiers, so calling it here would be semantically wrong. Served from the
 * static pricing dataset (imported directly — no mock API layer, no
 * network round trip); swap for a real marketing-content endpoint when
 * the backend grows one.
 */
export function useMarketingPricing() {
  return useQuery({
    queryKey: ['marketing', 'pricing'],
    queryFn: async () => ({
      plans: pricingPlans,
      tiers: pricingTiers,
      payg: paygCalculator,
      calculatePayg: calculatePaygMonthly,
      comparisonGroups,
      comparisonPlans,
    }),
  });
}

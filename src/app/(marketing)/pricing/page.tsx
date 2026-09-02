import type { Metadata } from 'next';
import { PricingPage } from '@/features/marketing/pricing';

export const metadata: Metadata = {
  title: 'Pricing & Plans — Transparent Billing for ISPs',
  description:
    'Predictable fixed plans or Pay-As-You-Grow wallet billing starting from ৳1.5 per subscriber. No router limits, no per-seat fees.',
};

export default function PricingRoute() {
  return <PricingPage />;
}

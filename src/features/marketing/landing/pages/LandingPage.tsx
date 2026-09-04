'use client';

import { useLandingData } from '../hooks/use-landing-data';
import {
  HeroSection,
  StatsBand,
  HowItWorks,
  ProductPreview,
  AutoReconcile,
  PricingSection,
  FAQSection,
  CTASection,
} from '../components';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function LandingPage() {
  const { data, loading, error, refetch } = useLandingData();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 space-y-10">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="h-56 rounded-xl bg-white/[0.04] lg:col-span-5" />
          <div className="h-56 rounded-xl bg-white/[0.04] lg:col-span-7" />
        </div>
        <div className="h-16 rounded-lg bg-white/[0.03]" />
        <div className="h-72 rounded-xl bg-white/[0.03]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h2 className="font-landing-display text-xl font-semibold text-white">
          Failed to load landing page
        </h2>
        <p className="mt-2 text-sm text-white/55">
          {error?.message ?? 'Could not fetch page data.'}
        </p>
        <Button
          onClick={() => refetch()}
          className="mt-6 bg-landing-cta hover:bg-landing-cta-hover text-white inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <HeroSection data={data.hero} />
      <StatsBand stats={data.stats} />
      <AutoReconcile steps={data.reconciliation} />
      <ProductPreview tabs={data.productPreview} />
      <HowItWorks steps={data.howItWorks} />
      <PricingSection plans={data.pricing.plans} payg={data.pricing.payg} />
      <FAQSection faq={data.faq} />
      <CTASection />
    </div>
  );
}

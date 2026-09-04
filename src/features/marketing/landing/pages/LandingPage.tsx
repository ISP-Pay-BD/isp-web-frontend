'use client';

import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';
import { ComparisonBlock } from '@/features/marketing/pricing';
import {
  HeroSection,
  StatsBand,
  HowItWorks,
  ProductPreview,
  AutoReconcile,
  PricingSection,
  Testimonials,
  FAQSection,
  ContactSection,
  CTASection,
} from '../components';

/** Marketing landing — static content, no client fetch / skeleton flash. */
export function LandingPage() {
  const data = landingSectionsAData;

  return (
    <div className="relative overflow-hidden">
      {/* Global subtle atmospheric background lights */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Soft mid-page ambient flare */}
        <div className="absolute top-[1800px] -left-48 h-[600px] w-[600px] rounded-full bg-landing-cta/[0.04] blur-[150px]" />
        {/* Soft lower-page azure flare */}
        <div className="absolute top-[3200px] -right-48 h-[600px] w-[600px] rounded-full bg-landing-accent/[0.04] blur-[150px]" />
      </div>

      <div className="relative z-10">
        <HeroSection data={data.hero} />
        <StatsBand stats={data.stats} />
        <AutoReconcile steps={data.reconciliation} />
        <ProductPreview tabs={data.productPreview} />
        <HowItWorks steps={data.howItWorks} />
        <PricingSection plans={data.pricing.plans} payg={data.pricing.payg} />
        <ComparisonBlock />
        <Testimonials testimonials={data.testimonials} />
        <FAQSection faq={data.faq} />
        <ContactSection />
        <CTASection />
      </div>
    </div>
  );
}

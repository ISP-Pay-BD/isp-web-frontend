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
    <div className="relative">
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
  );
}

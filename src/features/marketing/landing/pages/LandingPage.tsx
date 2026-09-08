'use client';

import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';
import { Reveal } from '@/components/motion/Reveal';
import {
  HeroSection,
  FeaturesGrid,
  HowItWorks,
  DesirePinSection,
  AutoReconcile,
  PricingSection,
  Testimonials,
  FAQSection,
  PartnersLogos,
  ContactSection,
  CTASection,
} from '../components';

/** Marketing landing — AIDA chapters with cinematic spacing (gpt-taste). */
export function LandingPage() {
  const data = landingSectionsAData;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <HeroSection data={data.hero} />
      <FeaturesGrid features={data.features} />
      <DesirePinSection />
      <HowItWorks steps={data.howItWorks} />
      <PartnersLogos partners={data.partners} />
      <AutoReconcile steps={data.reconciliation} />
      <PricingSection plans={data.pricing.plans} payg={data.pricing.payg} />
      <Reveal>
        <Testimonials testimonials={data.testimonials} />
      </Reveal>
      <FAQSection faq={data.faq} />
      <ContactSection />
      <CTASection />
    </div>
  );
}

'use client';

import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';
import { Reveal } from '@/components/motion/Reveal';
import {
  LandingAtmosphere,
  ScrollProgress,
  HeroSection,
  AutoReconcile,
  BenefitsSection,
  ProductPreview,
  FeaturesGrid,
  DesirePinSection,
  HowItWorks,
  TryItSection,
  MobileAppPromo,
  ComparisonTable,
  IntegrationsOrbit,
  PluginsHighlight,
  ProofBand,
  PartnersLogos,
  PricingSection,
  Testimonials,
  FAQSection,
  ContactSection,
  CTASection,
} from '../components';

/**
 * Modern ISP landing — isppaybd.com narrative + unique motion (Framer + GSAP desire)
 * on ISP dark tokens.
 */
export function LandingPage() {
  const data = landingSectionsAData;
  const copy = data.sectionCopy;

  return (
    <main className="relative w-full max-w-full overflow-x-hidden">
      <ScrollProgress />
      <LandingAtmosphere />

      <HeroSection data={data.hero} stats={data.stats} />

      <Reveal>
        <AutoReconcile steps={data.reconciliation} />
      </Reveal>

      <BenefitsSection benefits={data.benefits} />

      <Reveal>
        <ProductPreview tabs={data.productPreview} />
      </Reveal>

      <FeaturesGrid
        features={data.features}
        title={copy.featuresTitle}
        subtitle={copy.featuresSubtitle}
      />

      <DesirePinSection
        scrubLine={data.desire.scrubLine}
        title={data.desire.title}
        subtitle={data.desire.subtitle}
        items={data.desire.items}
      />

      <Reveal>
        <HowItWorks steps={data.howItWorks} />
      </Reveal>

      <Reveal>
        <TryItSection />
      </Reveal>

      <Reveal>
        <MobileAppPromo data={data.mobileApp} />
      </Reveal>

      <Reveal>
        <ComparisonTable comparison={data.comparison} />
      </Reveal>

      <IntegrationsOrbit integrations={data.integrations} />

      <Reveal>
        <PluginsHighlight plugins={data.pluginsList} />
      </Reveal>

      <ProofBand stats={data.stats} />

      <PartnersLogos
        partners={data.partners}
        title={copy.partnersTitle}
        subtitle={copy.partnersSubtitle}
      />

      <Reveal>
        <PricingSection
          plans={data.pricing.plans}
          payg={data.pricing.payg}
          title={copy.pricingTitle}
          subtitle={copy.pricingSubtitle}
        />
      </Reveal>

      <Reveal>
        <Testimonials
          testimonials={data.testimonials}
          title={copy.testimonialsTitle}
          subtitle={copy.testimonialsSubtitle}
        />
      </Reveal>

      <Reveal>
        <FAQSection faq={data.faq} title={copy.faqTitle} subtitle={copy.faqSubtitle} />
      </Reveal>

      <Reveal>
        <ContactSection />
      </Reveal>

      <CTASection />
    </main>
  );
}

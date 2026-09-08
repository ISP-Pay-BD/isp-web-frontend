'use client';

import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';
import { Reveal } from '@/components/motion/Reveal';
import {
  HeroSection,
  StatsBand,
  FeaturesGrid,
  BenefitsSection,
  WhyChooseSection,
  HowItWorks,
  ProductPreview,
  AutoReconcile,
  RoiSection,
  PricingSection,
  ComparisonTable,
  Testimonials,
  FAQSection,
  IntegrationsOrbit,
  PluginsHighlight,
  MobileAppPromo,
  ResellerHierarchy,
  RolesAccess,
  PermissionsMatrix,
  CaseStudy,
  PartnersLogos,
  TrustBadges,
  ProofBand,
  ConnectsSection,
  TryItSection,
  ContactSection,
  CTASection,
} from '../components';

/** Marketing landing — static mock sections. Scroll reveal once per band (Hero owns its own motion). */
export function LandingPage() {
  const data = landingSectionsAData;

  return (
    <div>
      <HeroSection data={data.hero} />
      <Reveal>
        <StatsBand stats={data.stats} />
      </Reveal>
      <Reveal>
        <FeaturesGrid features={data.features} />
      </Reveal>
      <Reveal>
        <BenefitsSection benefits={data.benefits} />
      </Reveal>
      <Reveal>
        <WhyChooseSection items={data.whyChoose} />
      </Reveal>
      {/* HowItWorks / AutoReconcile / Pricing / FAQ / Contact already Reveal internally */}
      <HowItWorks steps={data.howItWorks} />
      <Reveal>
        <ProductPreview tabs={data.productPreview} />
      </Reveal>
      <AutoReconcile steps={data.reconciliation} />
      <Reveal>
        <RoiSection roi={data.roi} />
      </Reveal>
      <PricingSection plans={data.pricing.plans} payg={data.pricing.payg} />
      <Reveal>
        <ComparisonTable comparison={data.comparison} />
      </Reveal>
      <Reveal>
        <Testimonials testimonials={data.testimonials} />
      </Reveal>
      <FAQSection faq={data.faq} />
      <Reveal>
        <IntegrationsOrbit integrations={data.integrations} />
      </Reveal>
      <Reveal>
        <PluginsHighlight plugins={data.pluginsList} />
      </Reveal>
      <Reveal>
        <MobileAppPromo data={data.mobileApp} />
      </Reveal>
      <Reveal>
        <ResellerHierarchy data={data.resellerHierarchy} />
      </Reveal>
      <Reveal>
        <RolesAccess roles={data.rolesAccess} />
      </Reveal>
      <Reveal>
        <PermissionsMatrix matrix={data.permissionsMatrix} />
      </Reveal>
      <Reveal>
        <CaseStudy data={data.caseStudy} />
      </Reveal>
      <Reveal>
        <PartnersLogos partners={data.partners} />
      </Reveal>
      <Reveal>
        <TrustBadges badges={data.trustBadges} />
      </Reveal>
      <Reveal>
        <ProofBand stats={data.stats} />
      </Reveal>
      <Reveal>
        <ConnectsSection connects={data.connects} />
      </Reveal>
      <Reveal>
        <TryItSection />
      </Reveal>
      <ContactSection />
      <Reveal>
        <CTASection />
      </Reveal>
    </div>
  );
}

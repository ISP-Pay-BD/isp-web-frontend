'use client';

import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';
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

/** Marketing landing — static mock sections. */
export function LandingPage() {
  const data = landingSectionsAData;

  return (
    <div>
      <HeroSection data={data.hero} />
      <StatsBand stats={data.stats} />
      <FeaturesGrid features={data.features} />
      <BenefitsSection benefits={data.benefits} />
      <WhyChooseSection items={data.whyChoose} />
      <HowItWorks steps={data.howItWorks} />
      <ProductPreview tabs={data.productPreview} />
      <AutoReconcile steps={data.reconciliation} />
      <RoiSection roi={data.roi} />
      <PricingSection plans={data.pricing.plans} payg={data.pricing.payg} />
      <ComparisonTable comparison={data.comparison} />
      <Testimonials testimonials={data.testimonials} />
      <FAQSection faq={data.faq} />
      <IntegrationsOrbit integrations={data.integrations} />
      <PluginsHighlight plugins={data.pluginsList} />
      <MobileAppPromo data={data.mobileApp} />
      <ResellerHierarchy data={data.resellerHierarchy} />
      <RolesAccess roles={data.rolesAccess} />
      <PermissionsMatrix matrix={data.permissionsMatrix} />
      <CaseStudy data={data.caseStudy} />
      <PartnersLogos partners={data.partners} />
      <TrustBadges badges={data.trustBadges} />
      <ProofBand stats={data.stats} />
      <ConnectsSection connects={data.connects} />
      <TryItSection />
      <ContactSection />
      <CTASection />
    </div>
  );
}

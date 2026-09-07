'use client';

import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';
import { ComparisonBlock } from '@/features/marketing/pricing';
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

/** Marketing landing — all 28 sections, static content, no client fetch / skeleton flash. */
export function LandingPage() {
  const data = landingSectionsAData;

  return (
    <div>
        {/* 1. Hero */}
        <HeroSection data={data.hero} />
        {/* 2. Stats */}
        <StatsBand stats={data.stats} />
        {/* 3. Features Grid */}
        <FeaturesGrid features={data.features} />
        {/* 4. Benefits */}
        <BenefitsSection benefits={data.benefits} />
        {/* 5. Why Choose */}
        <WhyChooseSection items={data.whyChoose} />
        {/* 6. How It Works */}
        <HowItWorks steps={data.howItWorks} />
        {/* 7. Product Preview */}
        <ProductPreview tabs={data.productPreview} />
        {/* 8. Auto Reconcile */}
        <AutoReconcile steps={data.reconciliation} />
        {/* 9. ROI Calculator */}
        <RoiSection roi={data.roi} />
        {/* 10. Pricing */}
        <PricingSection plans={data.pricing.plans} payg={data.pricing.payg} />
        {/* 11. Comparison Table */}
        <ComparisonTable comparison={data.comparison} />
        {/* 12. Comparison Block (pricing feature) */}
        <ComparisonBlock />
        {/* 13. Testimonials */}
        <Testimonials testimonials={data.testimonials} />
        {/* 14. FAQ */}
        <FAQSection faq={data.faq} />
        {/* 15. Integrations */}
        <IntegrationsOrbit integrations={data.integrations} />
        {/* 16. Plugins Highlight */}
        <PluginsHighlight plugins={data.pluginsList} />
        {/* 17. Mobile App */}
        <MobileAppPromo data={data.mobileApp} />
        {/* 18. Reseller Hierarchy */}
        <ResellerHierarchy data={data.resellerHierarchy} />
        {/* 19. Roles & Access */}
        <RolesAccess roles={data.rolesAccess} />
        {/* 20. Permissions Matrix */}
        <PermissionsMatrix matrix={data.permissionsMatrix} />
        {/* 21. Case Study */}
        <CaseStudy data={data.caseStudy} />
        {/* 22. Partners */}
        <PartnersLogos partners={data.partners} />
        {/* 23. Trust Badges */}
        <TrustBadges badges={data.trustBadges} />
        {/* 24. Proof Band */}
        <ProofBand stats={data.stats} />
        {/* 25. Connects */}
        <ConnectsSection connects={data.connects} />
        {/* 26. Try It */}
        <TryItSection />
        {/* 27. Contact */}
        <ContactSection />
        {/* 28. CTA */}
        <CTASection />
    </div>
  );
}

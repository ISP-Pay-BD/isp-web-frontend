'use client';

import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';
import { Reveal } from '@/components/motion/Reveal';
import {
  LandingAtmosphere,
  ScrollProgress,
  HeroSection,
  StatsBand,
  TrustBadges,
  AutoReconcile,
  BenefitsSection,
  WhyChooseSection,
  ProductPreview,
  FeaturesGrid,
  DesirePinSection,
  HowItWorks,
  RoiSection,
  TryItSection,
  MobileAppPromo,
  ResellerHierarchy,
  RolesAccess,
  PermissionsMatrix,
  CaseStudy,
  ComparisonTable,
  IntegrationsOrbit,
  ConnectsSection,
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
 * Modern ISP landing — full isppaybd.com narrative + high-density feature parity
 * on ISP dark tokens.
 */
export function LandingPage() {
  const data = landingSectionsAData;
  const copy = data.sectionCopy;

  return (
    <main className="relative w-full max-w-full overflow-x-hidden">
      <ScrollProgress />
      <LandingAtmosphere />

      {/* Hero & Orbit */}
      <HeroSection data={data.hero} stats={data.stats} />

      {/* Quick KPI stats strip */}
      <StatsBand stats={data.stats} />

      {/* Auto-reconciliation workflow */}
      <Reveal>
        <AutoReconcile steps={data.reconciliation} />
      </Reveal>

      {/* Benefits Overview */}
      <BenefitsSection benefits={data.benefits} />

      {/* Why Choose ISP Pay BD */}
      <WhyChooseSection items={data.whyChoose} />

      {/* Interactive Product Preview & Modules Showcase */}
      <Reveal>
        <ProductPreview tabs={data.productPreview} />
      </Reveal>

      {/* Full 12-Module Features Grid */}
      <FeaturesGrid
        features={data.features}
        title={copy.featuresTitle}
        subtitle={copy.featuresSubtitle}
      />

      {/* Horizontal / Pinned Narrative Section */}
      <DesirePinSection
        scrubLine={data.desire.scrubLine}
        title={data.desire.title}
        subtitle={data.desire.subtitle}
        items={data.desire.items}
      />

      {/* Step-by-Step Onboarding */}
      <Reveal>
        <HowItWorks steps={data.howItWorks} />
      </Reveal>

      {/* Interactive Operational ROI Calculator */}
      <Reveal>
        <RoiSection roi={data.roi} />
      </Reveal>

      {/* Live Sandbox / Try It */}
      <Reveal>
        <TryItSection />
      </Reveal>

      {/* Branded Mobile App Promo */}
      <Reveal>
        <MobileAppPromo data={data.mobileApp} />
      </Reveal>

      {/* Reseller & POP Hierarchy */}
      <Reveal>
        <ResellerHierarchy data={data.resellerHierarchy} />
      </Reveal>

      {/* 5-Tier Roles & Access Guard */}
      <Reveal>
        <RolesAccess roles={data.rolesAccess} />
      </Reveal>

      {/* Granular Permission Matrix */}
      <Reveal>
        <PermissionsMatrix matrix={data.permissionsMatrix} />
      </Reveal>

      {/* Operator Case Study */}
      <Reveal>
        <CaseStudy data={data.caseStudy} />
      </Reveal>

      {/* Feature vs Legacy Comparison */}
      <Reveal>
        <ComparisonTable comparison={data.comparison} />
      </Reveal>

      {/* Native Integrations Orbit */}
      <IntegrationsOrbit integrations={data.integrations} />

      {/* Developer API & Webhooks Rails */}
      <Reveal>
        <ConnectsSection connects={data.connects} />
      </Reveal>

      {/* Add-on Plugins Marketplace Highlight */}
      <Reveal>
        <PluginsHighlight plugins={data.pluginsList} />
      </Reveal>

      {/* Social Proof & Metrics Band */}
      <ProofBand stats={data.stats} />

      {/* Trust Badges */}
      <TrustBadges badges={data.trustBadges} />

      {/* Network Operator Partners */}
      <PartnersLogos
        partners={data.partners}
        title={copy.partnersTitle}
        subtitle={copy.partnersSubtitle}
      />

      {/* Complete 6-Tier Pricing Plans & PAYG Calculator */}
      <Reveal>
        <PricingSection
          plans={data.pricing.plans}
          payg={data.pricing.payg}
          title={copy.pricingTitle}
          subtitle={copy.pricingSubtitle}
        />
      </Reveal>

      {/* Operator Testimonials */}
      <Reveal>
        <Testimonials
          testimonials={data.testimonials}
          title={copy.testimonialsTitle}
          subtitle={copy.testimonialsSubtitle}
        />
      </Reveal>

      {/* Frequently Asked Questions */}
      <Reveal>
        <FAQSection faq={data.faq} title={copy.faqTitle} subtitle={copy.faqSubtitle} />
      </Reveal>

      {/* Contact & Consultation Form */}
      <Reveal>
        <ContactSection />
      </Reveal>

      {/* Global Call to Action */}
      <CTASection />
    </main>
  );
}

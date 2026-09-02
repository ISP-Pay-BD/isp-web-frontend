'use client';

import { useLandingData } from '../hooks/use-landing-data';
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
  CTASection,
} from '../components';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function LandingPage() {
  const { data, loading, error, refetch } = useLandingData();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 space-y-12 animate-pulse">
        <div className="h-64 rounded-3xl bg-white/5 border border-white/10" />
        <div className="grid grid-cols-4 gap-4 h-28">
          <div className="rounded-2xl bg-white/5" />
          <div className="rounded-2xl bg-white/5" />
          <div className="rounded-2xl bg-white/5" />
          <div className="rounded-2xl bg-white/5" />
        </div>
        <div className="grid grid-cols-3 gap-6 h-80">
          <div className="rounded-2xl bg-white/5" />
          <div className="rounded-2xl bg-white/5" />
          <div className="rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="font-landing-display text-xl font-bold text-white">
          Failed to load landing page data
        </h2>
        <p className="mt-2 text-sm text-white/60">
          {error?.message ?? 'An unexpected error occurred while fetching mock-api data.'}
        </p>
        <Button
          onClick={() => refetch()}
          className="mt-6 bg-landing-cta hover:bg-landing-cta-hover text-white inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 01. Hero + Orbital */}
      <HeroSection data={data.hero} />

      {/* 02. Stats Band */}
      <StatsBand stats={data.stats} />

      {/* 03. Core Features Grid */}
      <FeaturesGrid features={data.features} />

      {/* 04. Benefits Section */}
      <BenefitsSection benefits={data.benefits} />

      {/* 05. Why Choose Section */}
      <WhyChooseSection items={data.whyChoose} />

      {/* 06. How It Works Timeline */}
      <HowItWorks steps={data.howItWorks} />

      {/* 07. Product Preview Tabs */}
      <ProductPreview tabs={data.productPreview} />

      {/* 08. Auto Reconciliation Flow */}
      <AutoReconcile steps={data.reconciliation} />

      {/* 09. ROI Calculator */}
      <RoiSection roi={data.roi} />

      {/* 10. Pricing & PAYG */}
      <PricingSection plans={data.pricing.plans} payg={data.pricing.payg} />

      {/* 11. Comparison Table */}
      <ComparisonTable comparison={data.comparison} />

      {/* 12. Operator Testimonials */}
      <Testimonials testimonials={data.testimonials} />

      {/* 13. FAQ Accordion */}
      <FAQSection faq={data.faq} />

      {/* 14. Integrations Orbit & BD Payment Rails */}
      <IntegrationsOrbit integrations={data.integrations} />

      {/* 15. Plugins Marketplace Highlight */}
      <PluginsHighlight plugins={data.pluginsList} />

      {/* 16. Mobile Customer App Promo */}
      <MobileAppPromo data={data.mobileApp} />

      {/* 17. Reseller Hierarchy Flow */}
      <ResellerHierarchy data={data.resellerHierarchy} />

      {/* 18. Roles & Scoped Access */}
      <RolesAccess roles={data.rolesAccess} />

      {/* 19. Permissions Matrix */}
      <PermissionsMatrix matrix={data.permissionsMatrix} />

      {/* 20. Case Study */}
      <CaseStudy data={data.caseStudy} />

      {/* 21. Partners Logos Marquee */}
      <PartnersLogos partners={data.partners} />

      {/* 22. Trust Badges */}
      <TrustBadges badges={data.trustBadges} />

      {/* 23. Proof Band */}
      <ProofBand stats={data.stats} />

      {/* 24. Connects (APIs & Webhooks) */}
      <ConnectsSection connects={data.connects} />

      {/* 25. Try It Before You Buy It */}
      <TryItSection />

      {/* 26. Final Conversion CTA */}
      <CTASection />
    </div>
  );
}


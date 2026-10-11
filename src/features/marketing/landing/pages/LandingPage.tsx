import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';
import {
  LandingAtmosphere,
  ScrollProgress,
  HeroSection,
  ProofStrip,
  PaymentJourney,
  ProductPreview,
  ResellerHierarchy,
  MobileAppPromo,
  IntegrationsOrbit,
  TryItSection,
  PricingSection,
  RoiSection,
  FAQSection,
  CTASection,
} from '../components';

/**
 * ISP landing: one story in eleven sections. Promise and product → proof → follow one payment →
 * modules → who sees what → subscriber app → integrations → try the demo → price → questions → act.
 * A server component: each section hydrates on its own, and content never waits on JS to appear.
 */
export function LandingPage() {
  const data = landingSectionsAData;
  const featuredPayment = data.heroStage.payments[0];

  return (
    <div className="relative w-full max-w-full overflow-x-hidden">
      <ScrollProgress />
      <LandingAtmosphere />

      <HeroSection stats={data.stats} stage={data.heroStage} />
      <ProofStrip stats={data.stats} />
      {featuredPayment ? (
        <PaymentJourney steps={data.reconciliation} payment={featuredPayment} />
      ) : null}
      <ProductPreview />
      <ResellerHierarchy data={data.resellerHierarchy} matrix={data.permissionsMatrix} />
      <MobileAppPromo data={data.mobileApp} subscriber={data.heroStage.subscriber} />
      <IntegrationsOrbit integrations={data.integrations} plugins={data.pluginsList} />
      <TryItSection />
      <PricingSection plans={data.pricing.plans} payg={data.pricing.payg} />
      <RoiSection roi={data.roi} />
      <FAQSection faq={data.faq} />
      <CTASection />
    </div>
  );
}

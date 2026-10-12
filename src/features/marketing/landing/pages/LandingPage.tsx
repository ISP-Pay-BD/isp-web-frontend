import { landingSectionsAData } from '@/data/marketing/landing-sections-a.data';
import { num } from '@/lib/api/case';
import { API_BASE_URL } from '@/lib/api/client';
import type { StatsData } from '../types';
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

type LiveStats = { isps: number; subscribers: number; payments: number };

/**
 * Live platform totals (GET /api/v1/public/stats), re-fetched at most every 10 minutes. null when the
 * API is unreachable — the proof figures are then left out rather than invented.
 */
async function liveStats(): Promise<LiveStats | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/public/stats`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const d = ((await res.json()) as { data?: Record<string, unknown> }).data;
    return d ? { isps: num(d.isps), subscribers: num(d.subscribers), payments: num(d.payments) } : null;
  } catch {
    return null;
  }
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

/**
 * ISP landing: one story in eleven sections. Promise and product → proof → follow one payment →
 * modules → who sees what → subscriber app → integrations → try the demo → price → questions → act.
 * A server component: each section hydrates on its own, and content never waits on JS to appear.
 */
export async function LandingPage() {
  const data = landingSectionsAData;
  const featuredPayment = data.heroStage.payments[0];
  const live = await liveStats();
  const stats: StatsData = {
    trustedIsps: live?.isps ?? 0,
    activeUsers: live?.subscribers ?? 0,
    paymentsReconciled: live && live.payments > 0 ? `${compact.format(live.payments)}+` : '',
    uptimeSla: data.stats.uptimeSla,
  };

  return (
    <div className="relative w-full max-w-full overflow-x-clip">
      <ScrollProgress />
      <LandingAtmosphere />

      <HeroSection stats={stats} stage={data.heroStage} />
      <ProofStrip stats={stats} />
      {featuredPayment ? (
        <PaymentJourney steps={data.reconciliation} payment={featuredPayment} />
      ) : null}
      <ProductPreview />
      <ResellerHierarchy data={data.resellerHierarchy} matrix={data.permissionsMatrix} />
      <MobileAppPromo data={data.mobileApp} />
      <IntegrationsOrbit integrations={data.integrations} plugins={data.pluginsList} />
      <TryItSection />
      <PricingSection />
      <RoiSection roi={data.roi} />
      <FAQSection faq={data.faq} />
      <CTASection />
    </div>
  );
}

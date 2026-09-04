export interface HeroData {
  badge: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface StatsData {
  trustedIsps: number;
  activeUsers: number;
  activeAdmins: number;
  paymentsReconciled: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  titleBn: string;
  desc: string;
  descBn: string;
  icon: string;
  badge?: string;
  bullets?: string[];
}

export interface BenefitItem {
  title: string;
  desc: string;
  stats?: Array<{ label: string; value: string }>;
}

export interface WhyChooseItem {
  title: string;
  desc: string;
  icon: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  desc: string;
}

export interface ProductPreviewTab {
  id: string;
  label: string;
  bullets: string[];
  metrics: Array<{ label: string; val: string }>;
}

export interface ReconcileStep {
  step: string;
  title: string;
  desc: string;
  metric: string;
  metricHighlight?: string;
}

export interface RoiData {
  hoursSavedPerDay: number;
  reconciliationMinutes: number;
  manualMinutes: number;
  monthlySavingsBdt: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  priceBdt: number;
  period: string;
  customers: string;
  features: string[];
  highlighted: boolean;
}

export interface PaygCalculatorData {
  labelEn: string;
  minCustomers: number;
  maxCustomers: number;
  step: number;
  defaultCustomers: number;
  pricePerCustomerBdt: number;
  baseFeeBdt: number;
  currency: string;
}

export interface ComparisonRow {
  capability: string;
  us: boolean | string;
  legacy: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
  rating?: number;
  image?: string;
}

export interface FaqItem {
  q: string;
  a: string;
  qBn?: string;
  aBn?: string;
}

export interface IntegrationItem {
  name: string;
  category: string;
  icon?: string;
}

export interface PluginItem {
  id: string;
  name: string;
  category: string;
  priceBdt: number;
  period?: string;
  installed: boolean;
  rating?: number;
  installs?: number;
  desc?: string;
}

export interface MobileAppData {
  title: string;
  features: string[];
  stores: { android: string; ios: string };
}

export interface ResellerHierarchyData {
  levels: string[];
  description: string;
}

export interface RoleAccessItem {
  role: string;
  access: string;
}

export interface CaseStudyData {
  company: string;
  location: string;
  customers: number;
  quote: string;
  results: Array<{ metric: string; label: string }>;
}

export interface TrustBadgeItem {
  label: string;
  sub: string;
}

export interface ConnectItem {
  name: string;
  desc: string;
}

export interface PermissionMatrixRow {
  module: string;
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface LandingSectionsData {
  hero: HeroData;
  stats: StatsData;
  features: FeatureItem[];
  benefits: BenefitItem[];
  whyChoose: WhyChooseItem[];
  howItWorks: HowItWorksStep[];
  productPreview: ProductPreviewTab[];
  reconciliation: ReconcileStep[];
  roi: RoiData;
  pricing: {
    plans: PricingPlan[];
    payg: PaygCalculatorData;
  };
  comparison: {
    headers: string[];
    rows: ComparisonRow[];
  };
  testimonials: TestimonialItem[];
  faq: FaqItem[];
  integrations: IntegrationItem[];
  // Sections 15–28
  pluginsList: PluginItem[];
  mobileApp: MobileAppData;
  resellerHierarchy: ResellerHierarchyData;
  rolesAccess: RoleAccessItem[];
  caseStudy: CaseStudyData;
  partners: string[];
  trustBadges: TrustBadgeItem[];
  connects: ConnectItem[];
  permissionsMatrix: PermissionMatrixRow[];
}

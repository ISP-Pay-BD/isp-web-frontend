/**
 * Super-admin platform portal — UI types (camelCase). The backend answers in
 * snake_case; `src/lib/api/services/platform.service.ts` maps every payload
 * onto these shapes in one place.
 */

export type TenantStatus = 'active' | 'suspended';
export type TenantAccountStatus = 'active' | 'trial' | 'suspended';
export type Tone = 'ok' | 'warn' | 'bad';

export interface PageResultOf<T, S = undefined> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  summary: S;
}

export interface PlatformContact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  inquiryType?: string;
  pluginSlug?: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  message: string;
  createdAt: string;
}

export interface ContactSummary {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  won: number;
  lost: number;
}

export interface DashboardTopTenant {
  adminId: number;
  tenantId: number | null;
  name: string;
  ownerName: string;
  slug: string | null;
  domain: string | null;
  primaryColor: string | null;
  status: TenantAccountStatus;
  customers: number;
  revenueBdt: number;
}

export interface RevenuePoint {
  month: string;
  label: string;
  revenue: number;
  payments: number;
}

export interface PlatformDashboardStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  portalsTotal: number;
  totalRevenue: number;
  monthRevenue: number;
  lastMonthRevenue: number;
  growthPercentage: number | null;
  openTickets: number;
  totalActiveEndUsers: number;
  chartData: RevenuePoint[];
  topTenants: DashboardTopTenant[];
  recentContacts: PlatformContact[];
  systemStatus: string;
  generatedAt: string;
}

export interface PlatformTenant {
  id: string;
  name: string;
  slug: string;
  domain: string;
  portalUrl: string;
  plan: string | null;
  status: TenantStatus;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  notes: string | null;
  ownerUserId: number | null;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  ownerSubscriptionStatus: string | null;
  customers: number;
  monthRevenue: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PlatformTenantDetail extends PlatformTenant {
  resellers: number;
  employees: number;
  ownerWillExpire: string | null;
  organizationName: string | null;
}

export interface TenantTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

export interface TenantListSummary {
  total: number;
  active: number;
  suspended: number;
}

export interface TenantFormOptions {
  owners: Array<{ id: number; name: string; email: string; mobile: string; subscriptionStatus: string }>;
  packages: Array<{ id: number; name: string; priceBdt: number; planType: string }>;
  baseDomain: string;
}

export interface TenantHealth {
  tenantId: string;
  tenantName: string;
  slug: string;
  score: number;
  grade: 'healthy' | 'watch' | 'at_risk';
  factors: Array<{ key: string; label: string; value: string; tone: Tone }>;
  lastCheckedAt: string;
}

export interface PlatformAdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'inactive';
  organizationName: string | null;
  tenantId: string | null;
  tenantSlug: string | null;
  packageId: number | null;
  packageName: string | null;
  planType: string | null;
  subscriptionStatus: string | null;
  willExpire: string | null;
  trialEndsAt: string | null;
  lastLoginAt: string | null;
  createdAt: string | null;
}

export interface AdminListSummary {
  total: number;
  active: number;
  superAdmins: number;
  linked: number;
}

export interface PackageFeature {
  label: string;
  included: boolean;
}

export interface AdminPackageTier {
  id: string;
  name: string;
  priceBdt: number;
  pricingType: 'weekly' | 'monthly' | 'yearly';
  planType: 'fixed' | 'payg' | 'custom';
  maxCustomers: number;
  /** Free preview days a new signup gets when trialDays is 0 (admin_packages.preview). */
  previewDays: number;
  baseFee: number;
  perUserRate: number;
  minTopup: number;
  trialDays: number;
  isPublic: boolean;
  isActive: boolean;
  sortOrder: number;
  assignedUserId: number | null;
  features: PackageFeature[];
  featuresText: string;
  tenantCount: number;
}

export interface AdminPackagesPayload {
  items: AdminPackageTier[];
  total: number;
  yearlyDiscountMonths: number;
  yearlyDiscountPercent: number;
}

export interface AdminPackageInput {
  name: string;
  price: number;
  pricing_type: 'weekly' | 'monthly' | 'yearly';
  plan_type: 'fixed' | 'payg' | 'custom';
  max_customers: number;
  preview_days: number;
  base_fee: number;
  per_user_rate: number;
  min_topup: number;
  trial_days: number;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
  features_text: string;
  assigned_user_id?: number | null;
}

export interface BillingPackageOption {
  id: number;
  name: string;
  planType: string;
  priceBdt: number;
  pricingType: string;
  /** Free preview days a new signup gets when trialDays is 0 (admin_packages.preview). */
  previewDays: number;
}

export interface AdminBilling {
  adminId: string;
  name: string;
  email: string;
  organizationName: string | null;
  mode: 'fixed' | 'payg' | 'custom' | 'none';
  package: BillingPackageOption | null;
  billingType: string | null;
  subscriptionStatus: string | null;
  willExpire: string | null;
  trialEndsAt: string | null;
  wallet: { balanceBdt: number; graceUntil: string | null } | null;
  paygEstimate: {
    baseFee: number;
    perUserRate: number;
    customers: number;
    usageCost: number;
    monthlyTotal: number;
    minTopup: number;
  } | null;
  availablePackages: BillingPackageOption[];
}

export interface ImpersonationResult {
  user_id: number | string;
  name?: string;
  email?: string;
  mobile?: string;
  role: string;
  status?: string;
  tenant_id?: number | string | null;
  permissions?: number[];
  access_token: string;
  expires_in: number;
}

export interface PlatformRole {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
  modules: number | null;
}

export interface SupportTicketRow {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'opened' | 'processing' | 'closed';
  viewed: boolean;
  createdAt: string;
  requesterId: string | null;
  requesterName: string | null;
  requesterRole: string | null;
  tenantName: string | null;
  tenantId: string | null;
  tenantSlug: string | null;
}

export interface SupportTicketSummary {
  total: number;
  opened: number;
  processing: number;
  closed: number;
  high: number;
}

export interface SupportTicketDetail extends SupportTicketRow {
  requesterEmail: string | null;
  requesterPhone: string | null;
  remarks: string | null;
  messages: Array<{
    id: string;
    senderId: string | null;
    senderName: string;
    senderRole: 'platform' | 'requester' | 'staff';
    body: string;
    sentAt: string;
  }>;
}

export interface PlatformSoftwareSettings {
  appName: string;
  supportEmail: string;
  supportPhone: string;
  yearlyDiscountMonths: number;
  yearlyDiscountPercent: number;
  primaryBrandColor: string;
  sessionTimeoutMinutes: number;
  allowSelfRegistration: boolean;
  notificationWebhookUrl: string;
  /** Public /privacy and /terms text; a page is published once it has text. */
  privacyPolicy: string;
  termsOfService: string;
  maintenanceMode: boolean;
  maintenanceAllowIps: string[];
  baseDomain: string;
}

export interface PlatformPluginItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string | null;
  priceBdt: number;
  priceType: string | null;
  billingCycle: string | null;
  published: boolean;
  installs: number;
  createdAt: string;
}

export interface PluginSummary {
  total: number;
  published: number;
  installs: number;
}

export interface PluginInput {
  name: string;
  slug?: string;
  category: string;
  description?: string;
  price: number;
  price_type?: string;
  billing_cycle?: string;
  image?: string;
  status: 0 | 1;
}

/** Kept compatible with the admin product-showcase screen (title/subtitle/views…). */
export interface ProductShowcaseItem {
  id: string;
  title: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  bullets: string[];
  target: 'website' | 'mobile';
  category: string;
  status: 'active' | 'inactive';
  featured: boolean;
  sortOrder: number;
  imageCount: number;
  images: Array<{ id: string; url: string | null; caption: string }>;
  thumbnailUrl: string;
  videoUrl: string;
  /** Not tracked by the backend — always 0. */
  views: number;
  createdAt: string;
}

export interface ShowcaseInput {
  name: string;
  target: 'website' | 'mobile';
  bullets: string;
  sort_order: number;
  status: 'active' | 'inactive';
}

export interface PlatformRevenue {
  totalRevenue: number;
  monthRevenue: number;
  lastMonthRevenue: number;
  growthPercentage: number | null;
  activeAdmins: number;
  mrrBdt: number;
  arrBdt: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  averageRevenuePerTenant: number;
  chartData: RevenuePoint[];
  methodBreakdown: Array<{ method: string; amountBdt: number; percentage: number }>;
  methodWindowMonths: number;
  tierBreakdown: Array<{ plan: string; planType: string | null; tenants: number; mrrBdt: number }>;
}

export interface MeteringRow {
  adminId: string;
  tenantId: string | null;
  tenantSlug: string | null;
  domain: string | null;
  name: string;
  customers: number;
  resellers: number;
  routers: number;
  smsSent: number;
  paymentsCount: number;
  paymentsAmountBdt: number;
  period: string;
}

export interface MeteringSummary {
  tenants: number;
  customers: number;
  routers: number;
  smsSent: number;
  period: string;
}

export interface SlaRow {
  adminId: string;
  tenantId: string | null;
  tenantSlug: string | null;
  name: string;
  routersTotal: number;
  routersActive: number;
  routerAvailabilityPct: number | null;
  openTickets: number;
  severity: 'ok' | 'watch' | 'critical';
  targetPct: number;
}

export interface PlatformFileItem {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'file';
  size: number | null;
  ext?: string;
  modifiedAt: string;
}

export interface PlatformLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  channel: 'redis' | 'auth' | 'billing' | 'mikrotik' | 'system';
  message: string;
}

export interface PlatformLogsPayload {
  logs: PlatformLogEntry[];
  stats: {
    redisMemoryMb: number;
    redisKeysTotal: number;
    uptimeDays: number;
  };
}

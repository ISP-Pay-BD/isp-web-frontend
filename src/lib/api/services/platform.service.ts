import { http } from '../client';
import { camelizeKeys, num, str } from '../case';
import type {
  AdminBilling,
  AdminListSummary,
  AdminPackageInput,
  AdminPackageTier,
  AdminPackagesPayload,
  BillingPackageOption,
  ContactSummary,
  ImpersonationResult,
  MeteringRow,
  MeteringSummary,
  PageResultOf,
  PlatformAdminUser,
  PlatformContact,
  PlatformDashboardStats,
  PlatformFileItem,
  PlatformLogsPayload,
  PlatformPluginItem,
  PlatformRevenue,
  PlatformRole,
  PlatformSoftwareSettings,
  PlatformTenant,
  PlatformTenantDetail,
  PluginInput,
  PluginSummary,
  ProductShowcaseItem,
  ShowcaseInput,
  SlaRow,
  SupportTicketDetail,
  SupportTicketRow,
  SupportTicketSummary,
  TenantFormOptions,
  TenantHealth,
  TenantListSummary,
  TenantTicket,
} from '@/features/platform/types';

export type {
  PlatformPluginItem,
  PlatformRevenue,
  PlatformLogsPayload,
} from '@/features/platform/types';

type Raw = Record<string, unknown>;

/** Card shape of the admin product-showcase screen (kept for that screen). */
export interface LegacyShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: 'Billing' | 'MikroTik' | 'Customer Portal' | 'Reporting';
  featured: boolean;
  views: number;
  createdAt: string;
}

/** Sidebar pin row shape. */
export interface SidebarPin {
  id: string;
  label: string;
  href: string;
  icon: string;
  order: number;
}

export interface ListParams {
  page?: number;
  perPage?: number;
  search?: string;
  [key: string]: string | number | undefined;
}

function query(params?: ListParams): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const { perPage, search, ...rest } = params;
  const out: Record<string, unknown> = { ...rest };
  if (perPage) out.per_page = perPage;
  if (search) out.search = search;
  for (const k of Object.keys(out)) if (out[k] === '' || out[k] === undefined) delete out[k];
  return out;
}

async function page<T, S>(
  url: string,
  params: ListParams | undefined,
  mapItem: (row: Raw) => T,
  mapSummary: (raw: Raw) => S,
): Promise<PageResultOf<T, S>> {
  const res = await http.getPage<Raw>(url, query(params));
  return {
    items: res.items.map(mapItem),
    total: res.meta.total,
    page: res.meta.page,
    perPage: res.meta.perPage,
    totalPages: res.meta.totalPages,
    summary: mapSummary((res.raw ?? {}) as Raw),
  };
}

const nullableStr = (v: unknown): string | null => (v === null || v === undefined || v === '' ? null : String(v));
const nullableNum = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : num(v));

// ---------------------------------------------------------------- mappers

function mapContact(r: Raw): PlatformContact {
  const c = camelizeKeys<Raw>(r);
  return {
    id: str(c.id),
    name: str(c.name),
    company: str(c.company),
    email: str(c.email),
    phone: str(c.phone),
    source: str(c.source),
    inquiryType: str(c.inquiryType),
    pluginSlug: nullableStr(c.pluginSlug),
    status: (str(c.status, 'new') as PlatformContact['status']) || 'new',
    message: str(c.message),
    createdAt: str(c.createdAt),
  };
}

function mapTenant(r: Raw): PlatformTenantDetail {
  const t = camelizeKeys<Raw>(r);
  return {
    id: str(t.id),
    name: str(t.name),
    slug: str(t.slug),
    domain: str(t.domain),
    portalUrl: str(t.portalUrl),
    plan: nullableStr(t.plan),
    status: str(t.status) === 'suspended' ? 'suspended' : 'active',
    primaryColor: nullableStr(t.primaryColor),
    secondaryColor: nullableStr(t.secondaryColor),
    logoUrl: nullableStr(t.logoUrl),
    notes: nullableStr(t.notes),
    ownerUserId: nullableNum(t.ownerUserId),
    ownerName: nullableStr(t.ownerName),
    ownerEmail: nullableStr(t.ownerEmail),
    ownerPhone: nullableStr(t.ownerPhone),
    ownerSubscriptionStatus: nullableStr(t.ownerSubscriptionStatus),
    customers: num(t.customers),
    monthRevenue: num(t.monthRevenue),
    createdAt: nullableStr(t.createdAt),
    updatedAt: nullableStr(t.updatedAt),
    resellers: num(t.resellers),
    employees: num(t.employees),
    ownerWillExpire: nullableStr(t.ownerWillExpire),
    organizationName: nullableStr(t.organizationName),
  };
}

function mapAdmin(r: Raw): PlatformAdminUser {
  const a = camelizeKeys<Raw>(r);
  return {
    id: str(a.id),
    name: str(a.name),
    email: str(a.email),
    phone: str(a.phone),
    role: str(a.role) === 'super_admin' ? 'super_admin' : 'admin',
    status: str(a.status) === 'active' ? 'active' : 'inactive',
    organizationName: nullableStr(a.organizationName),
    tenantId: nullableStr(a.tenantId),
    tenantSlug: nullableStr(a.tenantSlug),
    packageId: nullableNum(a.packageId),
    packageName: nullableStr(a.packageName),
    planType: nullableStr(a.planType),
    subscriptionStatus: nullableStr(a.subscriptionStatus),
    willExpire: nullableStr(a.willExpire),
    trialEndsAt: nullableStr(a.trialEndsAt),
    lastLoginAt: nullableStr(a.lastLoginAt),
    createdAt: nullableStr(a.createdAt),
  };
}

function mapPackage(r: Raw): AdminPackageTier {
  const p = camelizeKeys<Raw>(r);
  const features = Array.isArray(p.features) ? (p.features as Raw[]) : [];
  return {
    id: str(p.id),
    name: str(p.name),
    priceBdt: num(p.priceBdt),
    pricingType: (str(p.pricingType, 'monthly') as AdminPackageTier['pricingType']) || 'monthly',
    planType: (str(p.planType, 'fixed') as AdminPackageTier['planType']) || 'fixed',
    maxCustomers: num(p.maxCustomers),
    previewDays: num(p.previewDays),
    baseFee: num(p.baseFee),
    perUserRate: num(p.perUserRate),
    minTopup: num(p.minTopup),
    trialDays: num(p.trialDays),
    isPublic: Boolean(p.isPublic),
    isActive: Boolean(p.isActive),
    sortOrder: num(p.sortOrder),
    assignedUserId: nullableNum(p.assignedUserId),
    features: features.map((f) => ({ label: str(f.label), included: Boolean(f.included) })),
    featuresText: str(p.featuresText),
    tenantCount: num(p.tenantCount),
  };
}

function mapBillingOption(r: unknown): BillingPackageOption {
  const p = camelizeKeys<Raw>(r);
  return {
    id: num(p.id),
    name: str(p.name),
    planType: str(p.planType, 'fixed'),
    priceBdt: num(p.priceBdt),
    pricingType: str(p.pricingType, 'monthly'),
    previewDays: num(p.previewDays),
  };
}

function mapBilling(r: Raw): AdminBilling {
  const b = camelizeKeys<Raw>(r);
  const wallet = b.wallet as Raw | null;
  const est = b.paygEstimate as Raw | null;
  return {
    adminId: str(b.adminId),
    name: str(b.name),
    email: str(b.email),
    organizationName: nullableStr(b.organizationName),
    mode: (str(b.mode, 'none') as AdminBilling['mode']) || 'none',
    package: b.package ? mapBillingOption(b.package) : null,
    billingType: nullableStr(b.billingType),
    subscriptionStatus: nullableStr(b.subscriptionStatus),
    willExpire: nullableStr(b.willExpire),
    trialEndsAt: nullableStr(b.trialEndsAt),
    wallet: wallet ? { balanceBdt: num(wallet.balanceBdt), graceUntil: nullableStr(wallet.graceUntil) } : null,
    paygEstimate: est
      ? {
          baseFee: num(est.baseFee),
          perUserRate: num(est.perUserRate),
          customers: num(est.customers),
          usageCost: num(est.usageCost),
          monthlyTotal: num(est.monthlyTotal),
          minTopup: num(est.minTopup),
        }
      : null,
    availablePackages: Array.isArray(b.availablePackages) ? b.availablePackages.map(mapBillingOption) : [],
  };
}

function mapTicketRow(r: Raw): SupportTicketRow {
  const t = camelizeKeys<Raw>(r);
  return {
    id: str(t.id),
    subject: str(t.subject),
    category: str(t.category),
    priority: (str(t.priority, 'low') as SupportTicketRow['priority']) || 'low',
    status: (str(t.status, 'opened') as SupportTicketRow['status']) || 'opened',
    viewed: Boolean(t.viewed),
    createdAt: str(t.createdAt),
    requesterId: nullableStr(t.requesterId),
    requesterName: nullableStr(t.requesterName),
    requesterRole: nullableStr(t.requesterRole),
    tenantName: nullableStr(t.tenantName),
    tenantId: nullableStr(t.tenantId),
    tenantSlug: nullableStr(t.tenantSlug),
  };
}

function mapTicketDetail(r: Raw): SupportTicketDetail {
  const t = camelizeKeys<Raw>(r);
  const messages = Array.isArray(t.messages) ? (t.messages as Raw[]) : [];
  return {
    ...mapTicketRow(r),
    requesterEmail: nullableStr(t.requesterEmail),
    requesterPhone: nullableStr(t.requesterPhone),
    remarks: nullableStr(t.remarks),
    messages: messages.map((m) => ({
      id: str(m.id),
      senderId: nullableStr(m.senderId),
      senderName: str(m.senderName),
      senderRole: (str(m.senderRole, 'staff') as SupportTicketDetail['messages'][number]['senderRole']) || 'staff',
      body: str(m.body),
      sentAt: str(m.sentAt),
    })),
  };
}

function mapSettings(r: Raw): PlatformSoftwareSettings {
  const s = camelizeKeys<Raw>(r);
  return {
    appName: str(s.appName),
    supportEmail: str(s.supportEmail),
    supportPhone: str(s.supportPhone),
    yearlyDiscountMonths: num(s.yearlyDiscountMonths),
    yearlyDiscountPercent: num(s.yearlyDiscountPercent),
    primaryBrandColor: str(s.primaryBrandColor),
    sessionTimeoutMinutes: num(s.sessionTimeoutMinutes),
    allowSelfRegistration: Boolean(s.allowSelfRegistration),
    notificationWebhookUrl: str(s.notificationWebhookUrl),
    privacyPolicy: str(s.privacyPolicy),
    termsOfService: str(s.termsOfService),
    maintenanceMode: Boolean(s.maintenanceMode),
    maintenanceAllowIps: Array.isArray(s.maintenanceAllowIps) ? s.maintenanceAllowIps.map((v) => str(v)) : [],
    baseDomain: str(s.baseDomain),
  };
}

function mapPlugin(r: Raw): PlatformPluginItem {
  const p = camelizeKeys<Raw>(r);
  return {
    id: str(p.id),
    slug: str(p.slug),
    name: str(p.name),
    category: str(p.category, 'General'),
    description: str(p.description),
    imageUrl: nullableStr(p.imageUrl),
    priceBdt: num(p.priceBdt),
    priceType: nullableStr(p.priceType),
    billingCycle: nullableStr(p.billingCycle),
    published: Boolean(p.published),
    installs: num(p.installs),
    createdAt: str(p.createdAt),
  };
}

function mapShowcase(r: Raw): ProductShowcaseItem {
  const s = camelizeKeys<Raw>(r);
  const images = Array.isArray(s.images) ? (s.images as Raw[]) : [];
  return {
    id: str(s.id),
    title: str(s.title),
    name: str(s.name ?? s.title),
    slug: str(s.slug),
    subtitle: str(s.subtitle),
    description: str(s.description),
    bullets: Array.isArray(s.bullets) ? s.bullets.map((b) => str(b)) : [],
    target: str(s.target) === 'mobile' ? 'mobile' : 'website',
    category: str(s.category),
    status: str(s.status) === 'inactive' ? 'inactive' : 'active',
    featured: Boolean(s.featured),
    sortOrder: num(s.sortOrder),
    imageCount: num(s.imageCount),
    images: images.map((i) => ({ id: str(i.id), url: nullableStr(i.url), caption: str(i.caption) })),
    thumbnailUrl: str(s.thumbnailUrl),
    videoUrl: str(s.videoUrl),
    views: 0,
    createdAt: str(s.createdAt),
  };
}

function mapPoint(r: unknown) {
  const p = camelizeKeys<Raw>(r);
  return { month: str(p.month), label: str(p.label), revenue: num(p.revenue), payments: num(p.payments) };
}

// ---------------------------------------------------------------- service

export const platformService = {
  // Dashboard ------------------------------------------------------------
  getDashboard: async (): Promise<PlatformDashboardStats> => {
    const d = camelizeKeys<Raw>(await http.get<Raw>('/v1/platform/stats'));
    const top = Array.isArray(d.topTenants) ? (d.topTenants as Raw[]) : [];
    return {
      totalTenants: num(d.totalTenants),
      activeTenants: num(d.activeTenants),
      trialTenants: num(d.trialTenants),
      suspendedTenants: num(d.suspendedTenants),
      portalsTotal: num(d.portalsTotal),
      totalRevenue: num(d.totalRevenue),
      monthRevenue: num(d.monthRevenue),
      lastMonthRevenue: num(d.lastMonthRevenue),
      growthPercentage: nullableNum(d.growthPercentage),
      openTickets: num(d.openTickets),
      totalActiveEndUsers: num(d.totalActiveEndUsers),
      chartData: Array.isArray(d.chartData) ? d.chartData.map(mapPoint) : [],
      topTenants: top.map((t) => ({
        adminId: num(t.adminId),
        tenantId: nullableNum(t.tenantId),
        name: str(t.name),
        ownerName: str(t.ownerName),
        slug: nullableStr(t.slug),
        domain: nullableStr(t.domain),
        primaryColor: nullableStr(t.primaryColor),
        status: (str(t.status, 'active') as PlatformDashboardStats['topTenants'][number]['status']) || 'active',
        customers: num(t.customers),
        revenueBdt: num(t.revenueBdt),
      })),
      // recent contacts were camelized already — map from snake keys again is a no-op
      recentContacts: Array.isArray(d.recentContacts) ? (d.recentContacts as Raw[]).map(mapContact) : [],
      systemStatus: str(d.systemStatus),
      generatedAt: str(d.generatedAt),
    };
  },

  // Tenants --------------------------------------------------------------
  getTenants: (params?: ListParams & { status?: string }) =>
    page<PlatformTenant, TenantListSummary>('/v1/platform/tenants', params, mapTenant, (raw) => {
      const s = (raw.summary ?? {}) as Raw;
      return { total: num(s.total), active: num(s.active), suspended: num(s.suspended) };
    }),

  getTenantById: async (id: string): Promise<{ tenant: PlatformTenantDetail; tickets: TenantTicket[] }> => {
    const raw = await http.get<Raw>(`/v1/platform/tenants/${id}`);
    const tickets = Array.isArray(raw.tickets) ? (raw.tickets as Raw[]) : [];
    return {
      tenant: mapTenant((raw.tenant ?? {}) as Raw),
      tickets: tickets.map((t) => {
        const c = camelizeKeys<Raw>(t);
        return {
          id: str(c.id),
          subject: str(c.subject),
          category: str(c.category),
          priority: str(c.priority),
          status: str(c.status),
          createdAt: str(c.createdAt),
        };
      }),
    };
  },

  getTenantFormOptions: async (search?: string): Promise<TenantFormOptions> => {
    const d = camelizeKeys<Raw>(await http.get<Raw>('/v1/platform/tenant-options', search ? { search } : undefined));
    return {
      owners: (Array.isArray(d.owners) ? (d.owners as Raw[]) : []).map((o) => ({
        id: num(o.id),
        name: str(o.name),
        email: str(o.email),
        mobile: str(o.mobile),
        subscriptionStatus: str(o.subscriptionStatus),
      })),
      packages: (Array.isArray(d.packages) ? (d.packages as Raw[]) : []).map((p) => ({
        id: num(p.id),
        name: str(p.name),
        priceBdt: num(p.priceBdt),
        planType: str(p.planType, 'fixed'),
      })),
      baseDomain: str(d.baseDomain),
    };
  },

  createTenant: (payload: Record<string, unknown>) =>
    http.post<{ id: string; slug: string; portal_url: string }>('/v1/platform/tenants', payload),

  updateTenant: (id: string, payload: Record<string, unknown>) =>
    http.put<{ id: string; slug: string; portal_url: string }>(`/v1/platform/tenants/${id}`, payload),

  setTenantStatus: (id: string, status: 'active' | 'suspended') =>
    http.patch(`/v1/platform/tenants/${id}/status`, { status }),

  deleteTenant: (id: string) => http.delete(`/v1/platform/tenants/${id}`),

  getTenantHealth: async (tenantId: string): Promise<TenantHealth> => {
    const h = camelizeKeys<Raw>(await http.get<Raw>(`/v1/platform/tenants/${tenantId}/health`));
    return {
      tenantId: str(h.tenantId),
      tenantName: str(h.tenantName),
      slug: str(h.slug),
      score: num(h.score),
      grade: (str(h.grade, 'watch') as TenantHealth['grade']) || 'watch',
      factors: (Array.isArray(h.factors) ? (h.factors as Raw[]) : []).map((f) => ({
        key: str(f.key),
        label: str(f.label),
        value: str(f.value),
        tone: (str(f.tone, 'warn') as TenantHealth['factors'][number]['tone']) || 'warn',
      })),
      lastCheckedAt: str(h.lastCheckedAt),
    };
  },

  // People ---------------------------------------------------------------
  getAdmins: (params?: ListParams & { role?: string; status?: string }) =>
    page<PlatformAdminUser, AdminListSummary>('/v1/platform/admins', params, mapAdmin, (raw) => {
      const s = (raw.summary ?? {}) as Raw;
      return { total: num(s.total), active: num(s.active), superAdmins: num(s.super_admins), linked: num(s.linked) };
    }),

  impersonateAdmin: (id: string) => http.post<ImpersonationResult>(`/v1/platform/admins/${id}/impersonate`, {}),

  getAdminBilling: async (id: string): Promise<AdminBilling> =>
    mapBilling(await http.get<Raw>(`/v1/platform/admins/${id}/billing`)),

  updateAdminBilling: async (id: string, payload: { mode: 'fixed' | 'payg'; package_id?: number }): Promise<AdminBilling> =>
    mapBilling(await http.put<Raw>(`/v1/platform/admins/${id}/billing`, payload)),

  getRoles: async (): Promise<PlatformRole[]> => {
    const d = await http.get<Raw>('/v1/platform/roles');
    return (Array.isArray(d.items) ? (d.items as Raw[]) : []).map((r) => ({
      id: str(r.id),
      name: str(r.name),
      description: str(r.description),
      users: num(r.users),
      permissions: num(r.permissions),
      modules: nullableNum(r.modules),
    }));
  },

  // Packages -------------------------------------------------------------
  getAdminPackages: async (): Promise<AdminPackagesPayload> => {
    const d = await http.get<Raw>('/v1/platform/admin-packages');
    return {
      items: (Array.isArray(d.items) ? (d.items as Raw[]) : []).map(mapPackage),
      total: num(d.total),
      yearlyDiscountMonths: num(d.yearly_discount_months),
      yearlyDiscountPercent: num(d.yearly_discount_percent),
    };
  },
  createAdminPackage: (payload: AdminPackageInput) => http.post<Raw>('/v1/platform/admin-packages', payload),
  updateAdminPackage: (id: string, payload: Partial<AdminPackageInput>) =>
    http.put<Raw>(`/v1/platform/admin-packages/${id}`, payload),
  deleteAdminPackage: (id: string) => http.delete(`/v1/platform/admin-packages/${id}`),
  savePricingSettings: (payload: { yearly_discount_months: number; yearly_discount_percent: number }) =>
    http.post('/v1/platform/pricing-settings', payload),

  // Plugins --------------------------------------------------------------
  getPluginsCatalog: (params?: ListParams & { category?: string; status?: string }) =>
    page<PlatformPluginItem, { summary: PluginSummary; categories: string[] }>(
      '/v1/platform/plugins',
      params,
      mapPlugin,
      (raw) => {
        const s = (raw.summary ?? {}) as Raw;
        return {
          summary: { total: num(s.total), published: num(s.published), installs: num(s.installs) },
          categories: Array.isArray(raw.categories) ? raw.categories.map((c) => str(c)) : [],
        };
      },
    ),
  createPlugin: (payload: PluginInput) => http.post<Raw>('/v1/platform/plugins', payload),
  updatePlugin: (id: string, payload: Partial<PluginInput>) => http.put<Raw>(`/v1/platform/plugins/${id}`, payload),
  setPluginStatus: (id: string, status: 0 | 1) => http.put(`/v1/platform/plugins/${id}/status`, { status }),
  deletePlugin: (id: string) => http.delete(`/v1/platform/plugins/${id}`),

  // Showcase ---------------------------------------------------------------
  getShowcaseSections: async (): Promise<{ items: ProductShowcaseItem[]; total: number }> => {
    const d = await http.get<Raw>('/v1/platform/showcase');
    const items = (Array.isArray(d.items) ? (d.items as Raw[]) : []).map(mapShowcase);
    return { items, total: num(d.total, items.length) };
  },

  createShowcase: (payload: ShowcaseInput) => http.post<Raw>('/v1/platform/showcase', payload),
  updateShowcase: (id: string, payload: Partial<ShowcaseInput>) => http.put<Raw>(`/v1/platform/showcase/${id}`, payload),
  deleteShowcase: (id: string) => http.delete(`/v1/platform/showcase/${id}`),

  // Leads ----------------------------------------------------------------
  getLeads: (params?: ListParams & { status?: string }) =>
    page<PlatformContact, ContactSummary>('/v1/platform/contacts', params, mapContact, (raw) => {
      const s = (raw.summary ?? {}) as Raw;
      return {
        total: num(s.total),
        new: num(s.new),
        contacted: num(s.contacted),
        qualified: num(s.qualified),
        won: num(s.won),
        lost: num(s.lost),
      };
    }),
  updateLeadStatus: (id: string, status: PlatformContact['status']) =>
    http.patch(`/v1/platform/contacts/${id}/status`, { status }),

  // Revenue / usage -------------------------------------------------------
  getPlatformRevenue: async (): Promise<PlatformRevenue> => {
    const d = camelizeKeys<Raw>(await http.get<Raw>('/v1/platform/revenue'));
    return {
      totalRevenue: num(d.totalRevenue),
      monthRevenue: num(d.monthRevenue),
      lastMonthRevenue: num(d.lastMonthRevenue),
      growthPercentage: nullableNum(d.growthPercentage),
      activeAdmins: num(d.activeAdmins),
      mrrBdt: num(d.mrrBdt),
      arrBdt: num(d.arrBdt),
      activeTenants: num(d.activeTenants),
      trialTenants: num(d.trialTenants),
      suspendedTenants: num(d.suspendedTenants),
      averageRevenuePerTenant: num(d.averageRevenuePerTenant),
      chartData: Array.isArray(d.chartData) ? d.chartData.map(mapPoint) : [],
      methodBreakdown: (Array.isArray(d.methodBreakdown) ? (d.methodBreakdown as Raw[]) : []).map((m) => ({
        method: str(m.method, 'Other'),
        amountBdt: num(m.amountBdt),
        percentage: num(m.percentage),
      })),
      methodWindowMonths: num(d.methodWindowMonths, 12),
      tierBreakdown: (Array.isArray(d.tierBreakdown) ? (d.tierBreakdown as Raw[]) : []).map((t) => ({
        plan: str(t.plan),
        planType: nullableStr(t.planType),
        tenants: num(t.tenants),
        mrrBdt: num(t.mrrBdt),
      })),
    };
  },

  getMetering: (params?: ListParams) =>
    page<MeteringRow, MeteringSummary>(
      '/v1/platform/metering',
      params,
      (r) => {
        const m = camelizeKeys<Raw>(r);
        return {
          adminId: str(m.adminId),
          tenantId: nullableStr(m.tenantId),
          tenantSlug: nullableStr(m.tenantSlug),
          domain: nullableStr(m.domain),
          name: str(m.name),
          customers: num(m.customers),
          resellers: num(m.resellers),
          routers: num(m.routers),
          smsSent: num(m.smsSent),
          paymentsCount: num(m.paymentsCount),
          paymentsAmountBdt: num(m.paymentsAmountBdt),
          period: str(m.period),
        };
      },
      (raw) => {
        const s = camelizeKeys<Raw>(raw.summary ?? {});
        return {
          tenants: num(s.tenants),
          customers: num(s.customers),
          routers: num(s.routers),
          smsSent: num(s.smsSent),
          period: str(s.period),
        };
      },
    ),

  getSla: (params?: ListParams) =>
    page<SlaRow, { metric: string }>(
      '/v1/platform/sla',
      params,
      (r) => {
        const s = camelizeKeys<Raw>(r);
        return {
          adminId: str(s.adminId),
          tenantId: nullableStr(s.tenantId),
          tenantSlug: nullableStr(s.tenantSlug),
          name: str(s.name),
          routersTotal: num(s.routersTotal),
          routersActive: num(s.routersActive),
          routerAvailabilityPct: nullableNum(s.routerAvailabilityPct),
          openTickets: num(s.openTickets),
          severity: (str(s.severity, 'ok') as SlaRow['severity']) || 'ok',
          targetPct: num(s.targetPct),
        };
      },
      (raw) => ({ metric: str(raw.metric) }),
    ),

  // Help desk ------------------------------------------------------------
  getSupportTickets: (params?: ListParams & { status?: string; priority?: string }) =>
    page<SupportTicketRow, SupportTicketSummary>('/v1/platform/support-tickets', params, mapTicketRow, (raw) => {
      const s = (raw.summary ?? {}) as Raw;
      return {
        total: num(s.total),
        opened: num(s.opened),
        processing: num(s.processing),
        closed: num(s.closed),
        high: num(s.high),
      };
    }),
  getSupportTicketDetail: async (id: string): Promise<SupportTicketDetail> =>
    mapTicketDetail(await http.get<Raw>(`/v1/platform/support-tickets/${id}`)),
  replySupportTicket: async (id: string, body: string, status?: SupportTicketRow['status']): Promise<SupportTicketDetail> =>
    mapTicketDetail(await http.post<Raw>(`/v1/platform/support-tickets/${id}/reply`, status ? { body, status } : { body })),
  setSupportTicketStatus: (id: string, status: SupportTicketRow['status']) =>
    http.patch(`/v1/platform/support-tickets/${id}/status`, { status }),

  // Settings / maintenance -----------------------------------------------
  getSoftwareSettings: async (): Promise<PlatformSoftwareSettings> =>
    mapSettings(await http.get<Raw>('/v1/platform/settings')),
  updateSoftwareSettings: async (values: Record<string, unknown>): Promise<PlatformSoftwareSettings> =>
    mapSettings(await http.post<Raw>('/v1/platform/settings', values)),

  getRecycleBin: async (entity?: string) => {
    return await http.get<unknown>('/v1/platform/recycle-bin', entity ? { entity } : undefined);
  },

  restoreRecycleBinItem: async (id: string) => {
    return await http.post(`/v1/platform/recycle-bin/${id}/restore`);
  },

  purgeRecycleBinItem: async (id: string) => {
    return await http.delete(`/v1/platform/recycle-bin/${id}`);
  },

  /**
   * Read-only listing of the backend upload directory. There is no upload or
   * delete endpoint by design.
   */
  getFileManager: async (path = '') => {
    const d = await http.get<Raw>('/v1/platform/file-manager', { path: path || undefined });
    const items = (Array.isArray(d.items) ? (d.items as Raw[]) : []).map((r): PlatformFileItem => {
      const f = camelizeKeys<Raw>(r);
      return {
        id: str(f.id),
        name: str(f.name),
        path: str(f.path),
        type: str(f.type) === 'folder' ? 'folder' : 'file',
        size: f.size === null || f.size === undefined ? null : num(f.size),
        ext: f.ext ? str(f.ext) : undefined,
        modifiedAt: str(f.modifiedAt),
      };
    });
    return { root: str(d.root), currentPath: str(d.current_path), items, total: num(d.total, items.length) };
  },

  /**
   * Application logs read from the backend's own log files, plus live Redis
   * stats when the cache handler is Redis (zeros otherwise).
   */
  getPlatformLogs: async (level?: string): Promise<PlatformLogsPayload> => {
    const d = await http.get<Raw>('/v1/platform/redis-logs', {
      level: level && level !== 'all' ? level : undefined,
    });
    const stats = camelizeKeys<Raw>(d.stats ?? {});
    return {
      logs: (Array.isArray(d.logs) ? (d.logs as Raw[]) : []).map((l) => ({
        id: str(l.id),
        timestamp: str(l.timestamp),
        level: (str(l.level, 'info') as PlatformLogsPayload['logs'][number]['level']) || 'info',
        channel: (str(l.channel, 'system') as PlatformLogsPayload['logs'][number]['channel']) || 'system',
        message: str(l.message),
      })),
      stats: {
        redisMemoryMb: num(stats.redisMemoryMb),
        redisKeysTotal: num(stats.redisKeysTotal),
        uptimeDays: num(stats.uptimeDays),
      },
    };
  },
};

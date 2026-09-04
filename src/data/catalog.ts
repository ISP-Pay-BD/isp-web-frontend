/**
 * Data catalog — every static data module and record counts.
 * Use for audits and ensuring Phase 1 feels "live".
 */

export const dataCatalog = {
  users: { file: 'users/users.data.ts', records: 6, domains: ['auth'] },
  permissions: { file: 'users/permissions.data.ts', records: 'presets', domains: ['auth', 'nav'] },
  marketing: {
    landing: { file: 'marketing/landing.data.ts', sections: 8, domains: ['marketing'] },
    sections: { file: 'marketing/sections.data.ts', sections: 28, domains: ['marketing'] },
    pricing: { file: 'marketing/pricing.data.ts', tiers: 3, domains: ['marketing'] },
    plugins: { file: 'marketing/plugins.data.ts', records: 15, domains: ['marketing', 'platform'] },
  },
  admin: {
    customers: { file: 'admin/customers.data.ts', records: 80, domains: ['admin', 'reseller'] },
    packages: { file: 'admin/packages.data.ts', records: 14, domains: ['admin', 'customer'] },
    areas: { file: 'admin/areas.data.ts', records: 8, domains: ['admin'] },
    payments: { file: 'admin/customer-payments.data.ts', records: '125+', domains: ['admin', 'customer'] },
    dashboard: { file: 'admin/dashboard.data.ts', domains: ['admin', 'customer', 'reseller'] },
    hr: { file: 'admin/hr.data.ts', records: '12 staff + attendance', domains: ['admin', 'employee'] },
    accounting: { file: 'admin/accounting.data.ts', domains: ['admin accounting modules'] },
    bandwidth: { file: 'admin/bandwidth.data.ts', domains: ['admin bandwidth buy/sell'] },
    networkOps: { file: 'admin/network-ops.data.ts', domains: ['routers, OLT, SMS, WhatsApp, POP, inventory'] },
  },
  customer: {
    subscription: { file: 'customer/subscription.data.ts', domains: ['customer portal'] },
    support: { file: 'customer/support.data.ts', records: 18, domains: ['customer', 'admin'] },
    news: { file: 'customer/news.data.ts', records: 8, domains: ['customer'] },
    profile: { file: 'customer/profile.data.ts', domains: ['customer'] },
  },
  platform: {
    tenants: { file: 'platform/tenants.data.ts', records: 5, domains: ['platform'] },
    contacts: { file: 'platform/contacts.data.ts', domains: ['platform CRM'] },
  },
  employee: {
    salaries: { file: 'employee/salaries.data.ts', domains: ['employee portal'] },
  },
} as const;

export const dataStats = {
  totalCustomers: 80,
  totalPayments: 125,
  totalSupportTickets: 18,
  totalNewsItems: 8,
  totalEmployees: 12,
  totalPlugins: 15,
  totalAreas: 8,
  totalPackages: 14,
  totalTenants: 5,
  totalRouters: 6,
  totalOltDevices: 3,
  landingSections: 28,
  faqItems: 8,
  testimonials: 24,
  completenessScore: '92%',
  lastUpdated: '2026-09-02',
};

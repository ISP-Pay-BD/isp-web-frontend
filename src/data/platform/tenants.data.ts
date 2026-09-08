import type { Tenant } from '../shared/types';

export interface TenantPortal extends Tenant {
  secondaryColor?: string;
  logoUrl?: string;
  notes?: string;
  ownerAdminId?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  domain: string;
  updatedAt: string;
}

export const initialTenants: TenantPortal[] = [
  {
    id: 'tenant_demo',
    name: 'Demo ISP Network',
    slug: 'demo',
    plan: 'Growth',
    customers: 1250,
    status: 'active',
    primaryColor: '#e85a1a',
    secondaryColor: '#10141a',
    logoUrl: '/images/brand/logo.svg',
    notes: 'Primary demo showcase instance with sample customers, routers and accounting.',
    ownerAdminId: 'user_004',
    ownerName: 'Tenant Admin',
    ownerEmail: 'admin@demo.isppaybd.com',
    ownerPhone: '01710000004',
    domain: 'demo.isppaybd.com',
    createdAt: '2024-06-01',
    updatedAt: '2026-08-20',
  },
  {
    id: 'tenant_fastnet',
    name: 'FastNet BD',
    slug: 'fastnet',
    plan: 'Scale',
    customers: 4200,
    status: 'active',
    primaryColor: '#2563eb',
    secondaryColor: '#0f172a',
    logoUrl: '/images/brand/logo.svg',
    notes: 'Major ISP operating in Mirpur and Uttara zones. Highly active payment volume.',
    ownerAdminId: 'padm_101',
    ownerName: 'Ahmed Rahman',
    ownerEmail: 'ahmed@fastnet.bd',
    ownerPhone: '01715000001',
    domain: 'fastnet.isppaybd.com',
    createdAt: '2023-11-15',
    updatedAt: '2026-09-01',
  },
  {
    id: 'tenant_skylink',
    name: 'SkyLink Internet',
    slug: 'skylink',
    plan: 'Starter',
    customers: 380,
    status: 'trial',
    primaryColor: '#16a34a',
    secondaryColor: '#064e3b',
    logoUrl: '/images/brand/logo.svg',
    notes: 'Currently on 14-day trial evaluation. Evaluating MikroTik sync & bKash auto-reconcile.',
    ownerAdminId: 'padm_102',
    ownerName: 'Tanvir Hossain',
    ownerEmail: 'tanvir@skylink.bd',
    ownerPhone: '01815000002',
    domain: 'skylink.isppaybd.com',
    createdAt: '2026-08-01',
    updatedAt: '2026-09-02',
  },
  {
    id: 'tenant_netlink',
    name: 'NetLink CTG',
    slug: 'netlink',
    plan: 'Growth',
    customers: 2100,
    status: 'active',
    primaryColor: '#9333ea',
    secondaryColor: '#3b0764',
    logoUrl: '/images/brand/logo.svg',
    notes: 'Chittagong metropolitan region ISP with 8 POP resellers linked.',
    ownerAdminId: 'padm_103',
    ownerName: 'Rafiqul Islam',
    ownerEmail: 'rafiq@netlink-ctg.com',
    ownerPhone: '01915000003',
    domain: 'netlink.isppaybd.com',
    createdAt: '2024-02-20',
    updatedAt: '2026-08-15',
  },
  {
    id: 'tenant_citynet',
    name: 'CityNet Sylhet',
    slug: 'citynet',
    plan: 'Starter',
    customers: 620,
    status: 'suspended',
    primaryColor: '#dc2626',
    secondaryColor: '#450a0a',
    logoUrl: '/images/brand/logo.svg',
    notes: 'Suspended temporarily due to overdue subscription invoice for August 2026.',
    ownerAdminId: 'padm_104',
    ownerName: 'Nadia Akter',
    ownerEmail: 'nadia@citynet.bd',
    ownerPhone: '01715000004',
    domain: 'citynet.isppaybd.com',
    createdAt: '2025-01-10',
    updatedAt: '2026-08-31',
  },
  {
    id: 'tenant_fiberwave',
    name: 'FiberWave Comilla',
    slug: 'fiberwave',
    plan: 'Growth',
    customers: 1450,
    status: 'active',
    primaryColor: '#0284c7',
    secondaryColor: '#082f49',
    logoUrl: '/images/brand/logo.svg',
    notes: 'Comilla city fiber network with 3 MikroTik CCR2004 routers active.',
    ownerAdminId: 'padm_105',
    ownerName: 'Kamal Mostafa',
    ownerEmail: 'kamal@fiberwave.com.bd',
    ownerPhone: '01615000005',
    domain: 'fiberwave.isppaybd.com',
    createdAt: '2025-05-18',
    updatedAt: '2026-08-25',
  },
];

// In-memory mutable array for client mock state
export let tenants: TenantPortal[] = [...initialTenants];

export function resetTenants(): void {
  tenants = [...initialTenants];
}

export function getTenantById(id: string): TenantPortal | undefined {
  return tenants.find((t) => t.id === id || t.slug === id);
}

export function createTenant(data: Omit<TenantPortal, 'id' | 'createdAt' | 'updatedAt'>): TenantPortal {
  const newTenant: TenantPortal = {
    ...data,
    id: `tenant_${data.slug || Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]!,
    updatedAt: new Date().toISOString().split('T')[0]!,
  };
  tenants = [newTenant, ...tenants];
  return newTenant;
}

export function updateTenant(id: string, updates: Partial<TenantPortal>): TenantPortal {
  const index = tenants.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error(`Tenant with ID ${id} not found`);
  }
  const updated: TenantPortal = {
    ...tenants[index]!,
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0]!,
  };
  tenants[index] = updated;
  return updated;
}

export function deleteTenant(id: string): boolean {
  const initialLength = tenants.length;
  tenants = tenants.filter((t) => t.id !== id);
  return tenants.length < initialLength;
}

export const platformRevenue = {
  mrrBdt: 2850000,
  arrBdt: 34200000,
  activeTenants: 48,
  trialTenants: 12,
  suspendedTenants: 3,
  growthPercentage: 14.8,
  averageRevenuePerTenant: 59375,
  chartData: [
    { month: 'Apr', revenue: 2100000, tenants: 38 },
    { month: 'May', revenue: 2250000, tenants: 41 },
    { month: 'Jun', revenue: 2400000, tenants: 43 },
    { month: 'Jul', revenue: 2550000, tenants: 45 },
    { month: 'Aug', revenue: 2700000, tenants: 47 },
    { month: 'Sep', revenue: 2850000, tenants: 48 },
  ],
  methodBreakdown: [
    { method: 'bKash Merchant', amountBdt: 1450000, percentage: 50.8 },
    { method: 'Nagad Gateway', amountBdt: 720000, percentage: 25.3 },
    { method: 'Bank Transfer', amountBdt: 480000, percentage: 16.8 },
    { method: 'SSLCommerz', amountBdt: 200000, percentage: 7.1 },
  ],
  tierBreakdown: [
    { plan: 'Starter', tenants: 18, mrrBdt: 450000 },
    { plan: 'Growth', tenants: 22, mrrBdt: 1320000 },
    { plan: 'Scale', tenants: 8, mrrBdt: 1080000 },
  ],
};

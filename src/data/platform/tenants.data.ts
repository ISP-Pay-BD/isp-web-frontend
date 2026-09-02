import type { Tenant } from '../shared/types';

export const tenants: Tenant[] = [
  { id: 'tenant_demo', name: 'Demo ISP Network', slug: 'demo', plan: 'Growth', customers: 1250, status: 'active', primaryColor: '#f75803', createdAt: '2024-06-01' },
  { id: 'tenant_fastnet', name: 'FastNet BD', slug: 'fastnet', plan: 'Scale', customers: 4200, status: 'active', primaryColor: '#2563eb', createdAt: '2023-11-15' },
  { id: 'tenant_skylink', name: 'SkyLink Internet', slug: 'skylink', plan: 'Starter', customers: 380, status: 'trial', primaryColor: '#16a34a', createdAt: '2026-08-01' },
  { id: 'tenant_netlink', name: 'NetLink CTG', slug: 'netlink', plan: 'Growth', customers: 2100, status: 'active', primaryColor: '#9333ea', createdAt: '2024-02-20' },
  { id: 'tenant_citynet', name: 'CityNet Sylhet', slug: 'citynet', plan: 'Starter', customers: 620, status: 'suspended', primaryColor: '#dc2626', createdAt: '2025-01-10' },
];

export const platformRevenue = {
  mrrBdt: 2850000,
  arrBdt: 34200000,
  activeTenants: 48,
  trialTenants: 12,
  chartData: [
    { month: 'Apr', revenue: 2100000 },
    { month: 'May', revenue: 2250000 },
    { month: 'Jun', revenue: 2400000 },
    { month: 'Jul', revenue: 2550000 },
    { month: 'Aug', revenue: 2700000 },
    { month: 'Sep', revenue: 2850000 },
  ],
};

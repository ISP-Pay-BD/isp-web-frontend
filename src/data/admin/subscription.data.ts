/** ISP tenant SaaS subscription — admin self-recharge (D13i) */

export interface AdminSubscriptionPlan {
  id: string;
  name: string;
  priceBdt: number;
  validityDays: number;
  maxCustomers: number;
  features: string[];
}

export interface AdminSubscription {
  planId: string;
  planName: string;
  priceBdt: number;
  status: 'active' | 'expired' | 'trial';
  expiryDate: string;
  maxCustomers: number;
  activeCustomers: number;
  tenantName: string;
  licenseKey: string;
}

export const adminSubscriptionPlans: AdminSubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'Starter — up to 500 customers',
    priceBdt: 3500,
    validityDays: 30,
    maxCustomers: 500,
    features: ['Customer billing', 'SMS alerts', '1 MikroTik NAS'],
  },
  {
    id: 'plan_pro',
    name: 'Pro — up to 2,000 customers',
    priceBdt: 8500,
    validityDays: 30,
    maxCustomers: 2000,
    features: ['All Starter features', 'POP resellers', 'WhatsApp Business', 'HR module'],
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise — unlimited customers',
    priceBdt: 18000,
    validityDays: 30,
    maxCustomers: 99999,
    features: ['All Pro features', 'Multi-branch', 'API access', 'Priority support'],
  },
];

export const adminSubscription: AdminSubscription = {
  planId: 'plan_pro',
  planName: 'Pro — up to 2,000 customers',
  priceBdt: 8500,
  status: 'active',
  expiryDate: '2026-10-15',
  maxCustomers: 2000,
  activeCustomers: 847,
  tenantName: 'Demo ISP Dhaka',
  licenseKey: 'IPB-DHK-2026-PRO-847',
};

export const paygCalculator = {
  labelEn: 'Pay as you grow',
  labelBn: 'বৃদ্ধির সাথে সাথে পে করুন',
  minCustomers: 50,
  maxCustomers: 5000,
  step: 50,
  defaultCustomers: 500,
  pricePerCustomerBdt: 12,
  baseFeeBdt: 999,
  currency: 'BDT',
} as const;

export const pricingAddons = [
  { key: 'sms', label: 'SMS Credits', labelBn: 'এসএমএস ক্রেডিট', priceBdt: 200, unit: 'per 1k credits' },
  { key: 'whitelabel', label: 'White Label Domain & Branding', labelBn: 'হোয়াইট লেবেল ব্র্যান্ডিং', priceBdt: 500, unit: 'monthly' },
  { key: 'backup', label: 'Extra Cloud Backups', labelBn: 'অতিরিক্ত ক্লাউড ব্যাকআপ', priceBdt: 150, unit: 'monthly' },
  { key: 'whatsapp', label: 'WhatsApp Alerts Engine', labelBn: 'হোয়াটসঅ্যাপ নোটিফিকেশন', priceBdt: 100, unit: 'monthly' },
];

export const pricingTiers = [
  {
    id: 'basic',
    name: 'Basic',
    nameBn: 'বেসিক',
    priceBdt: 999,
    period: 'month',
    customers: 500,
    highlight: false,
    features: [
      'Up to 500 subscribers',
      'Billing & Invoicing',
      'Customer CRM',
      'Unlimited MikroTik Routers',
      'Email & Community Support',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    nameBn: 'স্ট্যান্ডার্ড',
    priceBdt: 2499,
    period: 'month',
    customers: 2000,
    highlight: true,
    features: [
      'Up to 2,000 subscribers',
      'Everything in Basic',
      'SMS Automation & Templates',
      'Auto Backup & Daily Analytics',
      'Priority Support (Bangla & English)',
      'Free One-Time Data Migration',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    nameBn: 'প্রিমিয়াম',
    priceBdt: 4999,
    period: 'month',
    customers: 5000,
    highlight: false,
    features: [
      'Up to 5,000 subscribers',
      'Everything in Standard',
      'White Label Branding',
      'API Access & Multi-Branch Hub',
      '24/7 Dedicated Support',
      'Advanced Accounting Reports',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    nameBn: 'বিজনেস',
    priceBdt: 8499,
    period: 'month',
    customers: 10000,
    highlight: false,
    features: [
      'Up to 10,000 subscribers',
      'Everything in Premium',
      'MAC Reseller Portal & Reseller App',
      'Bandwidth Reselling Ledger',
      'Bulk SMS & Automated Mailing Engine',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    nameBn: 'এন্টারপ্রাইজ',
    priceBdt: 14999,
    period: 'month',
    customers: 20000,
    highlight: false,
    features: [
      'Up to 20,000 subscribers',
      'Everything in Business',
      'OLT Integration for Huawei & ZTE ONUs',
      'Client Portal (Android App & Web)',
      'Dedicated Account Manager',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    nameBn: 'আলটিমেট',
    priceBdt: 24999,
    period: 'month',
    customers: 40000,
    highlight: false,
    features: [
      'Up to 40,000 subscribers',
      'Everything in Enterprise',
      'Multi-Region Node Deployment',
      'Dedicated Success Director',
      'Custom Feature Engineering & High-Priority SLA',
    ],
  },
] as const;

export function calculatePaygMonthly(customers: number): number {
  const { baseFeeBdt, pricePerCustomerBdt, minCustomers } = paygCalculator;
  const billable = Math.max(customers, minCustomers);
  return baseFeeBdt + billable * pricePerCustomerBdt;
}

/* ── Comparison Table Data ─────────────────────────────────────────────── */

export type FeatureValue = string | boolean;

export interface ComparisonFeature {
  label: string;
  values: [FeatureValue, FeatureValue, FeatureValue]; // [Starter, Growth, Scale]
}

export interface ComparisonGroup {
  title: string;
  features: ComparisonFeature[];
}

export interface ComparisonPlan {
  id: string;
  name: string;
  priceBdt: number | null;
  period: string;
  subtitle: string;
  highlighted?: boolean;
  cta: string;
}

export const comparisonPlans: ComparisonPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceBdt: 2999,
    period: '/mo',
    subtitle: 'Up to 500 subscribers',
    cta: 'Start Free Trial',
  },
  {
    id: 'growth',
    name: 'Growth',
    priceBdt: 5999,
    period: '/mo',
    subtitle: 'Up to 2,000 subscribers',
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    id: 'scale',
    name: 'Scale',
    priceBdt: 9999,
    period: '/mo',
    subtitle: 'Unlimited subscribers',
    cta: 'Contact Sales',
  },
];

export const comparisonGroups: ComparisonGroup[] = [
  {
    title: 'Network & Routers',
    features: [
      { label: 'MikroTik RouterOS sync', values: [true, true, true] },
      { label: 'PPPoe / Hotspot / DHCP', values: [true, true, true] },
      { label: 'Bandwidth shaping (QoS)', values: ['5 profiles', '20 profiles', 'Unlimited'] },
      { label: 'OLT management', values: [false, 'Basic', 'Full suite'] },
      { label: 'Multi-POP reseller support', values: [false, true, true] },
      { label: 'Network map & diagram', values: [false, true, true] },
      { label: 'IP pool management', values: [false, true, true] },
    ],
  },
  {
    title: 'Billing & Payments',
    features: [
      { label: 'bKash & Nagad auto-collect', values: [true, true, true] },
      { label: 'Invoice generation', values: [true, true, true] },
      { label: 'Prepaid wallet system', values: [false, true, true] },
      { label: 'Automated reconnect', values: [false, true, true] },
      { label: 'Revenue reports & charts', values: ['Basic', 'Advanced', 'Full suite'] },
      { label: 'Journal entries & ledger', values: [false, false, true] },
      { label: 'Balance sheet & P&L', values: [false, false, true] },
    ],
  },
  {
    title: 'Customer Management',
    features: [
      { label: 'Customer portal', values: [true, true, true] },
      { label: 'SMS alerts (due/expiry)', values: [true, true, true] },
      { label: 'WhatsApp Business blast', values: [false, true, true] },
      { label: 'Pop reseller hierarchy', values: [false, true, true] },
      { label: 'Customer app (Android)', values: [false, false, true] },
      { label: 'Bulk customer import', values: [false, true, true] },
    ],
  },
  {
    title: 'HR & Operations',
    features: [
      { label: 'Employee directory', values: [false, true, true] },
      { label: 'Attendance tracking', values: [false, true, true] },
      { label: 'Salary & advance salary', values: [false, true, true] },
      { label: 'Inventory / device stock', values: [false, false, true] },
      { label: 'Voice SMS campaigns', values: [false, false, true] },
    ],
  },
  {
    title: 'Support & Uptime',
    features: [
      { label: 'Community support', values: [true, true, true] },
      { label: 'Priority ticket queue', values: [false, true, true] },
      { label: 'Dedicated account manager', values: [false, false, true] },
      { label: '99.99% uptime SLA', values: [false, false, true] },
      { label: 'On-site training', values: [false, false, true] },
    ],
  },
];

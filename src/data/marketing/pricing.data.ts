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

export const pricingTiers = [
  {
    id: 'starter',
    name: 'Starter',
    nameBn: 'স্টার্টার',
    priceBdt: 2999,
    period: 'month',
    customers: 500,
    highlight: false,
    features: ['MikroTik sync', 'bKash & Nagad', 'Customer portal', 'SMS alerts'],
  },
  {
    id: 'growth',
    name: 'Growth',
    nameBn: 'গ্রোথ',
    priceBdt: 5999,
    period: 'month',
    customers: 2000,
    highlight: true,
    features: ['Everything in Starter', 'Multi-POP resellers', 'WhatsApp Business', 'HR module'],
  },
  {
    id: 'scale',
    name: 'Scale',
    nameBn: 'স্কেল',
    priceBdt: 9999,
    period: 'month',
    customers: null,
    highlight: false,
    features: ['Everything in Growth', 'OLT tools', 'Accounting suite', 'Priority support'],
  },
] as const;

export function calculatePaygMonthly(customers: number): number {
  const { baseFeeBdt, pricePerCustomerBdt, minCustomers } = paygCalculator;
  const billable = Math.max(customers, minCustomers);
  return baseFeeBdt + billable * pricePerCustomerBdt;
}

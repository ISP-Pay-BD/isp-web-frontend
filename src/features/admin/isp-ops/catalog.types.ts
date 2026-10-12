import { num, str } from '@/lib/api/case';

/**
 * Sales-catalog types (backend: zapi/Modules/Reseller/Catalog, routes in
 * zapi/config/routes/v1_ext_catalog.php). One mapper per payload.
 */

type Raw = Record<string, unknown>;
const rec = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const bool = (v: unknown) => v === true || v === 1 || v === '1';

// ---- Dealers -------------------------------------------------------------

export interface Dealer {
  id: string;
  name: string;
  contactPerson: string;
  mobile: string;
  areaId: string | null;
  areaName: string;
  commissionPercent: number;
  status: 'active' | 'inactive';
  customerCount: number;
}

export interface DealerSummary {
  total: number;
  active: number;
  assignedCustomers: number;
  avgCommission: number;
}

export interface DealerCustomer {
  customerId: string;
  name: string;
  mobile: string;
  status: string;
  assignedAt: string;
}

export const mapDealer = (r: Raw): Dealer => ({
  id: str(r.id),
  name: str(r.name),
  contactPerson: str(r.contact_person),
  mobile: str(r.mobile),
  areaId: r.area_id ? str(r.area_id) : null,
  areaName: str(r.area_name),
  commissionPercent: num(r.commission_percent),
  status: str(r.status) === 'inactive' ? 'inactive' : 'active',
  customerCount: num(r.customer_count),
});

export const mapDealerSummary = (raw: unknown): DealerSummary => {
  const s = rec(raw);
  return {
    total: num(s.total),
    active: num(s.active),
    assignedCustomers: num(s.assigned_customers),
    avgCommission: num(s.avg_commission),
  };
};

export const mapDealerCustomer = (r: Raw): DealerCustomer => ({
  customerId: str(r.customer_id),
  name: str(r.name),
  mobile: str(r.mobile),
  status: str(r.status),
  assignedAt: str(r.assigned_at),
});

// ---- Add-ons ---------------------------------------------------------------

export const ADDON_CATEGORIES = ['ott', 'iptv', 'static_ip', 'other'] as const;
export type AddonCategory = (typeof ADDON_CATEGORIES)[number];
export const ADDON_BILLING_TYPES = ['monthly', 'one_time'] as const;
export type AddonBillingType = (typeof ADDON_BILLING_TYPES)[number];

export interface Addon {
  id: string;
  name: string;
  category: AddonCategory;
  price: number;
  billingType: AddonBillingType;
  description: string;
  active: boolean;
  activeSubscriptions: number;
}

export interface AddonSummary {
  total: number;
  active: number;
  avgPrice: number;
  byCategory: Record<AddonCategory, number>;
  activeSubscriptions: number;
  monthlyRecurring: number;
}

export const mapAddon = (r: Raw): Addon => ({
  id: str(r.id),
  name: str(r.name),
  category: (ADDON_CATEGORIES as readonly string[]).includes(str(r.category)) ? (str(r.category) as AddonCategory) : 'other',
  price: num(r.price),
  billingType: str(r.billing_type) === 'one_time' ? 'one_time' : 'monthly',
  description: str(r.description),
  active: bool(r.active),
  activeSubscriptions: num(r.active_subscriptions),
});

export const mapAddonSummary = (raw: unknown): AddonSummary => {
  const s = rec(raw);
  const c = rec(s.by_category);
  return {
    total: num(s.total),
    active: num(s.active),
    avgPrice: num(s.avg_price),
    byCategory: { ott: num(c.ott), iptv: num(c.iptv), static_ip: num(c.static_ip), other: num(c.other) },
    activeSubscriptions: num(s.active_subscriptions),
    monthlyRecurring: num(s.monthly_recurring),
  };
};

export const SUBSCRIPTION_STATUSES = ['active', 'suspended', 'cancelled'] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export interface AddonSubscription {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  addonId: string;
  addonName: string;
  billingType: string;
  price: number;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
}

export interface AddonSubscriptionSummary {
  total: number;
  active: number;
  monthlyRecurring: number;
  oneTimeTotal: number;
}

export const mapAddonSubscription = (r: Raw): AddonSubscription => ({
  id: str(r.id),
  customerId: str(r.customer_id),
  customerName: str(r.customer_name),
  customerMobile: str(r.customer_mobile),
  addonId: str(r.addon_id),
  addonName: str(r.addon_name),
  billingType: str(r.billing_type),
  price: num(r.price),
  startDate: str(r.start_date),
  endDate: str(r.end_date),
  status: (SUBSCRIPTION_STATUSES as readonly string[]).includes(str(r.status))
    ? (str(r.status) as SubscriptionStatus)
    : 'active',
});

export const mapAddonSubscriptionSummary = (raw: unknown): AddonSubscriptionSummary => {
  const s = rec(raw);
  return {
    total: num(s.total),
    active: num(s.active),
    monthlyRecurring: num(s.monthly_recurring),
    oneTimeTotal: num(s.one_time_total),
  };
};

// ---- Service catalog -------------------------------------------------------

export const SERVICE_CATEGORIES = ['installation', 'relocation', 'repair', 'maintenance', 'other'] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export interface CatalogService {
  id: string;
  name: string;
  code: string;
  category: ServiceCategory;
  price: number;
  description: string;
  active: boolean;
}

export interface ServiceSummary {
  total: number;
  active: number;
  avgPrice: number;
  byCategory: Record<ServiceCategory, number>;
}

export const mapService = (r: Raw): CatalogService => ({
  id: str(r.id),
  name: str(r.name),
  code: str(r.code),
  category: (SERVICE_CATEGORIES as readonly string[]).includes(str(r.category))
    ? (str(r.category) as ServiceCategory)
    : 'other',
  price: num(r.price),
  description: str(r.description),
  active: bool(r.active),
});

export const mapServiceSummary = (raw: unknown): ServiceSummary => {
  const s = rec(raw);
  const c = rec(s.by_category);
  return {
    total: num(s.total),
    active: num(s.active),
    avgPrice: num(s.avg_price),
    byCategory: Object.fromEntries(SERVICE_CATEGORIES.map((k) => [k, num(c[k])])) as Record<ServiceCategory, number>,
  };
};

// ---- Mobile plans ----------------------------------------------------------

export interface MobilePlan {
  id: string;
  name: string;
  operator: string;
  dataGb: number;
  minutes: number;
  validityDays: number;
  price: number;
  active: boolean;
}

export interface MobilePlanSummary {
  total: number;
  active: number;
  avgPrice: number;
  maxDataGb: number;
  operators: string[];
  validities: number[];
}

export const mapMobilePlan = (r: Raw): MobilePlan => ({
  id: str(r.id),
  name: str(r.name),
  operator: str(r.operator),
  dataGb: num(r.data_gb),
  minutes: num(r.minutes),
  validityDays: num(r.validity_days),
  price: num(r.price),
  active: bool(r.active),
});

export const mapMobilePlanSummary = (raw: unknown): MobilePlanSummary => {
  const s = rec(raw);
  return {
    total: num(s.total),
    active: num(s.active),
    avgPrice: num(s.avg_price),
    maxDataGb: num(s.max_data_gb),
    operators: Array.isArray(s.operators) ? s.operators.map((o) => str(o)) : [],
    validities: Array.isArray(s.validities) ? s.validities.map((v) => num(v)) : [],
  };
};

// ---- POP commissions -------------------------------------------------------

export type CommissionType = 'percent' | 'fixed';

export interface CommissionRule {
  type: CommissionType;
  value: number;
  notes: string;
}

export interface PopCommissionRow {
  popId: string;
  name: string;
  mobile: string;
  status: string;
  period: string;
  collected: number;
  payments: number;
  payingCustomers: number;
  rule: CommissionRule | null;
  commission: number;
}

export interface PopCommissionSummary {
  pops: number;
  popsWithRule: number;
  collected: number;
  commission: number;
  payments: number;
  period: string;
}

export const mapPopCommission = (r: Raw): PopCommissionRow => {
  const rule = r.rule ? rec(r.rule) : null;
  return {
    popId: str(r.pop_id),
    name: str(r.name),
    mobile: str(r.mobile),
    status: str(r.status),
    period: str(r.period),
    collected: num(r.collected),
    payments: num(r.payments),
    payingCustomers: num(r.paying_customers),
    rule: rule
      ? { type: str(rule.commission_type) === 'fixed' ? 'fixed' : 'percent', value: num(rule.commission_value), notes: str(rule.notes) }
      : null,
    commission: num(r.commission),
  };
};

export const mapPopCommissionSummary = (raw: unknown): PopCommissionSummary => {
  const s = rec(raw);
  return {
    pops: num(s.pops),
    popsWithRule: num(s.pops_with_rule),
    collected: num(s.collected),
    commission: num(s.commission),
    payments: num(s.payments),
    period: str(s.period),
  };
};

// ---- Customer picker -------------------------------------------------------

export interface CustomerOption {
  id: string;
  name: string;
  mobile: string;
  status: string;
}

export const mapCustomerOption = (r: Raw): CustomerOption => ({
  id: str(r.id),
  name: str(r.name),
  mobile: str(r.mobile),
  status: str(r.status),
});

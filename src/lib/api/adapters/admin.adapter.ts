import type {
  Customer,
  CustomerStatus,
  ConnectionType,
  Area,
  SubArea,
} from '@/types/domain';
import { num, str } from '../case';

/** Backend placeholders ("--", "null") read as empty. */
function cleanStr(value: unknown): string {
  const s = str(value).trim();
  return s === '--' || s.toLowerCase() === 'n/a' ? '' : s;
}

/**
 * zapi customer row (list row, or the flat `data` of the detail endpoint) →
 * UI Customer. Never invents values: missing fields stay empty/undefined.
 * PPPoE fields are top-level (pppoe_name, pppoe_password, …); the nested
 * `pppoe` block (detail) wins when present. `online` is the live session
 * flag (users.activity / online_status), not the account status.
 */
export function transformBackendCustomer(input: Record<string, unknown>): Customer {
  const raw = (input.customer && typeof input.customer === 'object' ? input.customer : input) as Record<string, unknown>;
  const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
  const pppoe = obj(raw.pppoe);
  const conn = obj(raw.connection_details);
  const olt = obj(raw.olt_onu);
  const usageObj = obj(raw.usage);

  const expiry = cleanStr(raw.will_expire) || cleanStr(raw.expiry_date);
  const expiryTs = expiry ? Date.parse(expiry.replace(' ', 'T')) : NaN;
  const status: CustomerStatus =
    Number.isFinite(expiryTs) && expiryTs < Date.now()
      ? 'expired'
      : cleanStr(raw.conn_status) === 'disconn' || cleanStr(raw.status) === 'inactive'
        ? 'suspended'
        : 'active';
  const connectionType: ConnectionType = cleanStr(raw.access_type) === 'static' ? 'static' : 'pppoe';
  const price = cleanStr(raw.package_price);
  const callerId = cleanStr(pppoe.caller_id) || cleanStr(raw.pppoe_caller_id);

  return {
    id: str(raw.id),
    name: cleanStr(raw.name),
    username: cleanStr(pppoe.name) || cleanStr(raw.pppoe_name) || cleanStr(raw.secret),
    phone: cleanStr(raw.mobile) || cleanStr(raw.phone),
    email: cleanStr(raw.email) || undefined,
    packageId: cleanStr(raw.package_id),
    packageName: cleanStr(raw.package_name),
    packagePrice: price !== '' && Number.isFinite(Number(price)) ? Number(price) : undefined,
    areaId: cleanStr(raw.area_id),
    areaName: cleanStr(raw.area_name),
    subAreaName: cleanStr(raw.sub_area_name) || undefined,
    subAreaCode: cleanStr(raw.sub_area_code) || undefined,
    resellerId: cleanStr(raw.admin_id) || undefined,
    status,
    expiryDate: expiry ? expiry.slice(0, 10) : '',
    balanceBdt: num(raw.fund ?? raw.balance),
    connectionType,
    macAddress: cleanStr(raw.mac_address) || callerId || undefined,
    ipAddress: cleanStr(raw.ip_address) || cleanStr(raw.pppoe_address) || undefined,
    online: cleanStr(raw.activity) === 'active' || cleanStr(raw.online_status) === 'Online',
    createdAt: cleanStr(raw.created_at),
    nidNumber: cleanStr(raw.nid_number) && cleanStr(raw.nid_number) !== '0' ? cleanStr(raw.nid_number) : undefined,
    address: cleanStr(raw.address) || undefined,
    latitude: cleanStr(raw.latitude) ? num(raw.latitude) : undefined,
    longitude: cleanStr(raw.longitude) ? num(raw.longitude) : undefined,
    routerId: cleanStr(raw.router_id) || undefined,
    routerName: cleanStr(raw.router_name) || undefined,
    connectionDetails: {
      connectionType: cleanStr(conn.connection_type),
      cableRequirement: cleanStr(conn.cable_requirement) || undefined,
      fiberCode: cleanStr(conn.fiber_code) || undefined,
      numberOfCore: cleanStr(conn.number_of_core) || undefined,
      coreColor: cleanStr(conn.core_color) || undefined,
      clientType: cleanStr(conn.client_type),
      billingStatus: cleanStr(conn.billing_status),
      otc: cleanStr(conn.otc) || undefined,
      routerUsername: cleanStr(conn.router_username) || undefined,
    },
    pppoeDetails: {
      name: cleanStr(pppoe.name) || cleanStr(raw.pppoe_name),
      password: cleanStr(pppoe.password) || cleanStr(raw.pppoe_password),
      service: cleanStr(pppoe.service) || cleanStr(raw.pppoe_service),
      profile: cleanStr(pppoe.profile) || cleanStr(raw.pppoe_profile),
      disabled: cleanStr(pppoe.disabled) === 'true',
      lastLoggedOut: cleanStr(pppoe.last_logged_out) || undefined,
      lastCallerId: cleanStr(pppoe.last_caller_id) || cleanStr(raw.pppoe_last_caller_id) || undefined,
    },
    oltDetails: olt.available
      ? {
          name: cleanStr(olt.olt_name),
          onuId: cleanStr(olt.onu_id),
          status: cleanStr(olt.status),
          rxPower: cleanStr(olt.rx),
          macAddress: cleanStr(olt.mac),
          callId: callerId,
          matchedId: cleanStr(olt.onu_id),
          description: cleanStr(olt.description),
          lastSeen: cleanStr(olt.last_seen) || undefined,
          reason: cleanStr(olt.reason) || undefined,
        }
      : undefined,
    bandwidthUsage: Array.isArray(usageObj.by_date)
      ? (usageObj.by_date as Record<string, unknown>[]).map((u) => ({
          date: str(u.date),
          downloadMb: num(u.download_mb),
          uploadMb: num(u.upload_mb),
        }))
      : undefined,
  };
}

/** Admin / reseller dashboard — only fields the backend actually returns. */
export interface DashboardRouterCard {
  id: string;
  name: string;
  host: string;
  /** Live status from the router poller cache; null when the poller has not reported. */
  liveStatus: string | null;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lastUpdated: string | null;
}

export interface AdminDashboardResult {
  totalCustomers: number;
  activeCustomers: number;
  expiredCustomers: number;
  inactiveCustomers: number;
  newCustomers: number;
  todayCollectionBdt: number;
  todayCollectionCount: number;
  monthlyCollectionBdt: number;
  customersPaymentReceivedCount: number;
  /** Expected monthly billing (sum of active package prices, free customers excluded). */
  customersPaymentTotal: number;
  customersExpaymentTotal: number;
  customersExpaymentCount: number;
  customersPaymentPending: number;
  connectedCustomers: number;
  totalPackages: number;
  totalAreas: number;
  employeeActive: number;
  employeeInactive: number;
  employeePaymentReceived: number;
  employeePaymentPending: number;
  routerActive: number;
  routerInactive: number;
  allResellers: number;
  customerQuota: { used: number; limit: number; percent: number; isUnlimited: boolean } | null;
  ticketStats: { open: number; ongoing: number; solved: number; closed: number; total: number; solvedRate: number | null };
  monthlyTrend: { month: string; collected: number; pending: number }[];
  paymentMethods: { name: string; amountBdt: number; count: number; percent: number; color: string }[];
  packageDistribution: { name: string; count: number; percent: number; color: string }[];
  weeklyCollections: { day: string; date: string; amount: number }[];
  geoRevenue: { area: string; revenueBdt: number; customers: number; active: number }[];
  routers: DashboardRouterCard[];
  recentActivities: { id: string; customerName: string; amountBdt: number; status: string; method: string; invoice: string; at: string | null }[];
  generatedAt: string | null;
}

const METHOD_COLORS: Record<string, string> = {
  bkash: '#E2136E',
  nagad: '#F7941D',
  rocket: '#8C3494',
  cash: '#22C55E',
  bank: '#3B82F6',
  sslcommerz: '#8B5CF6',
};
const SERIES_COLORS = ['#F97316', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#6366F1', '#14B8A6', '#EAB308'];

function n(v: unknown): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function s(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

function rows(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
}

export function transformBackendDashboardStats(raw: Record<string, unknown>): AdminDashboardResult {
  const stats = (raw.customer_payment_statistics ?? {}) as { months?: unknown[]; successful?: unknown[]; pending?: unknown[] };
  const months = Array.isArray(stats.months) ? stats.months.map(s) : [];
  const monthlyTrend = months.map((month, i) => ({
    month,
    collected: n(stats.successful?.[i]),
    pending: n(stats.pending?.[i]),
  }));

  const methodRows = rows(raw.payment_methods);
  const methodTotal = methodRows.reduce((sum, m) => sum + n(m.total), 0);
  const paymentMethods = methodRows.map((m, i) => {
    const key = s(m.method).toLowerCase();
    const brand = Object.keys(METHOD_COLORS).find((k) => key.includes(k));
    return {
      name: key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Unspecified',
      amountBdt: n(m.total),
      count: n(m.count),
      percent: methodTotal > 0 ? Math.round((n(m.total) / methodTotal) * 100) : 0,
      color: brand ? METHOD_COLORS[brand] : SERIES_COLORS[i % SERIES_COLORS.length],
    };
  });

  const pkgRows = rows(raw.package_distribution);
  const pkgTotal = pkgRows.reduce((sum, p) => sum + n(p.count), 0);
  const packageDistribution = pkgRows.map((p, i) => ({
    name: s(p.package_name) || 'No package',
    count: n(p.count),
    percent: pkgTotal > 0 ? Math.round((n(p.count) / pkgTotal) * 100) : 0,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
  }));

  const ts = (raw.ticket_stats ?? {}) as Record<string, unknown>;
  const ticketTotal = n(ts.total) || n(ts.open) + n(ts.ongoing) + n(ts.solved) + n(ts.closed);
  const resolved = n(ts.solved) + n(ts.closed);

  const quota = raw.customer_quota && typeof raw.customer_quota === 'object' ? (raw.customer_quota as Record<string, unknown>) : null;

  return {
    totalCustomers: n(raw.total_customers),
    activeCustomers: n(raw.users_active ?? raw.active_customers),
    expiredCustomers: n(raw.users_expired ?? raw.expired_customers),
    inactiveCustomers: n(raw.users_inactive ?? raw.inactive_customers),
    newCustomers: n(raw.users_new ?? raw.new_users),
    todayCollectionBdt: n(raw.today_collection),
    todayCollectionCount: n(raw.today_collection_count),
    monthlyCollectionBdt: n(raw.customers_payment_received),
    customersPaymentReceivedCount: n(raw.customers_payment_received_count),
    customersPaymentTotal: n(raw.customers_payment_total),
    customersExpaymentTotal: n(raw.customers_payment_due ?? raw.customers_Expayment_total),
    customersExpaymentCount: n(raw.customers_expayment_count ?? raw.customers_Expayment_count),
    customersPaymentPending: n(raw.customers_payment_pending),
    connectedCustomers: n(raw.pop_online),
    totalPackages: n(raw.total_packages),
    totalAreas: n(raw.total_area),
    employeeActive: n(raw.employee_active),
    employeeInactive: n(raw.employee_inactive),
    employeePaymentReceived: n(raw.employee_payment_received),
    employeePaymentPending: n(raw.employees_payment_pending),
    routerActive: n(raw.router_active),
    routerInactive: n(raw.router_inactive),
    allResellers: n(raw.all_resellers),
    customerQuota: quota
      ? {
          used: n(quota.used),
          limit: n(quota.limit),
          percent: n(quota.percent),
          isUnlimited: Boolean(quota.is_unlimited),
        }
      : null,
    ticketStats: {
      open: n(ts.open),
      ongoing: n(ts.ongoing),
      solved: n(ts.solved),
      closed: n(ts.closed),
      total: ticketTotal,
      solvedRate: ticketTotal > 0 ? Math.round((resolved / ticketTotal) * 1000) / 10 : null,
    },
    monthlyTrend,
    paymentMethods,
    packageDistribution,
    weeklyCollections: rows(raw.weekly_collections).map((w) => ({ day: s(w.day), date: s(w.date), amount: n(w.amount) })),
    geoRevenue: rows(raw.geo_revenue).map((g) => ({
      area: s(g.area_name) || 'Unassigned area',
      revenueBdt: n(g.revenue),
      customers: n(g.customer_count),
      active: n(g.active_count),
    })),
    routers: rows(raw.routers).map((r) => ({
      id: s(r.id),
      name: s(r.name),
      host: s(r.host),
      liveStatus: r.cached_status ? s(r.cached_status) : null,
      totalUsers: n(r.users_total),
      activeUsers: n(r.users_online),
      inactiveUsers: n(r.users_offline),
      lastUpdated: r.cached_last_updated ? s(r.cached_last_updated) : null,
    })),
    recentActivities: rows(raw.recent_activities).map((a) => ({
      id: s(a.id),
      customerName: s(a.customer_name),
      amountBdt: n(a.amount),
      status: s(a.status),
      method: s(a.method),
      invoice: s(a.invoice),
      at: a.at ? s(a.at) : null,
    })),
    generatedAt: raw.generated_at ? s(raw.generated_at) : null,
  };
}

export function transformBackendArea(raw: Record<string, unknown>): Area {
  const subareasRaw = Array.isArray(raw.subareas) ? (raw.subareas as Record<string, unknown>[]) : [];
  const subareas: SubArea[] = subareasRaw.map((s) => ({
    id: str(s.id),
    name: str(s.area_name) || str(s.name),
    areaCode: str(s.area_code),
    status: (s.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
  }));

  return {
    id: str(raw.id),
    name: str(raw.area_name) || str(raw.name),
    subareas,
  };
}


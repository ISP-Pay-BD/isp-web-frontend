import type {
  Customer,
  CustomerStatus,
  ConnectionType,
  Area,
  SubArea,
} from '@/data/shared/types';
import { adminDashboardStats } from '@/data/admin/dashboard.data';

export type AdminDashboardResult = typeof adminDashboardStats;

export function transformBackendCustomer(raw: Record<string, unknown>): Customer {
  const rawStatus = String(raw.status || raw.conn_status || 'active').toLowerCase();
  const status: CustomerStatus = (
    rawStatus === 'active' || rawStatus === 'expired' || rawStatus === 'suspended'
      ? rawStatus
      : 'active'
  ) as CustomerStatus;

  const rawConn = String(raw.connection_type || raw.conn_type || 'pppoe').toLowerCase();
  const connectionType: ConnectionType = (
    rawConn === 'pppoe' || rawConn === 'hotspot' || rawConn === 'static'
      ? rawConn
      : 'pppoe'
  ) as ConnectionType;

  return {
    id: String(raw.id || raw.user_id || `cust_${Date.now()}`),
    name: String(raw.name || 'Unknown Customer'),
    username: String(raw.username || raw.pppoe_id || raw.email || ''),
    phone: String(raw.mobile || raw.phone || ''),
    email: raw.email ? String(raw.email) : undefined,
    packageId: String(raw.package_id || 'pkg_1'),
    packageName: String(raw.package_name || 'Standard Package'),
    packagePrice: raw.price || raw.package_price ? Number(raw.price || raw.package_price) : undefined,
    areaId: String(raw.area_id || 'area_1'),
    areaName: String(raw.area_name || 'Main Area'),
    subAreaName: raw.subarea_name || raw.sub_area_name ? String(raw.subarea_name || raw.sub_area_name) : undefined,
    subAreaCode: raw.subarea_code || raw.sub_area_code ? String(raw.subarea_code || raw.sub_area_code) : undefined,
    resellerId: raw.reseller_id ? String(raw.reseller_id) : undefined,
    status,
    expiryDate: String(raw.will_expire || raw.expire_date || raw.expiry_date || new Date().toISOString().split('T')[0]),
    balanceBdt: Number(raw.balance || raw.balance_bdt || 0),
    connectionType,
    macAddress: raw.mac_address || raw.mac ? String(raw.mac_address || raw.mac) : undefined,
    ipAddress: raw.ip_address || raw.ip ? String(raw.ip_address || raw.ip) : undefined,
    online: Boolean(raw.online || raw.is_online || raw.conn_status === 'active'),
    createdAt: String(raw.created_at || new Date().toISOString().split('T')[0]),
    nidNumber: raw.nid || raw.nid_number ? String(raw.nid || raw.nid_number) : undefined,
    code: raw.code || raw.customer_code ? String(raw.code || raw.customer_code) : undefined,
    address: raw.address ? String(raw.address) : undefined,
    latitude: raw.latitude ? Number(raw.latitude) : undefined,
    longitude: raw.longitude ? Number(raw.longitude) : undefined,
    routerId: raw.router_id ? String(raw.router_id) : undefined,
    routerName: raw.router_name ? String(raw.router_name) : undefined,
  };
}

export function transformBackendCustomersList(raw: unknown): Customer[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => transformBackendCustomer(item as Record<string, unknown>));
  }
  if (raw && typeof raw === 'object') {
    const list = (raw as Record<string, unknown>).customers || (raw as Record<string, unknown>).data || (raw as Record<string, unknown>).items;
    if (Array.isArray(list)) {
      return list.map((item) => transformBackendCustomer(item as Record<string, unknown>));
    }
  }
  return [];
}

export function transformBackendDashboardStats(raw: Record<string, unknown>): AdminDashboardResult {
  const totalCustomers = Number(raw.total_customers ?? raw.totalCustomers ?? 0);
  const activeCustomers = Number(raw.active_customers ?? raw.users_active ?? raw.activeCustomers ?? 0);
  const expiredCustomers = Number(raw.expired_customers ?? raw.expired_inactive ?? raw.users_expired ?? 0);
  const inactiveCustomers = Number(raw.inactive_customers ?? raw.users_inactive ?? 0);
  const newCustomers = Number(raw.new_users ?? raw.users_new ?? raw.newCustomers ?? 0);

  const monthlyCollectionBdt = Number(raw.customers_payment_received ?? raw.monthly_collection ?? raw.monthlyCollectionBdt ?? 0);
  const customersPaymentTotal = Number(raw.customers_payment_total ?? raw.customer_payment_total ?? 0);
  const customersExpaymentTotal = Number(raw.customers_Expayment_total ?? raw.customers_payment_due ?? raw.customer_payment_due ?? 0);
  const customersExpaymentCount = Number(raw.customers_Expayment_count ?? raw.customers_expayment_count ?? 0);
  const customersPaymentReceivedCount = Number(raw.customers_payment_received_count ?? 0);
  const customersPaymentPending = Number(raw.customers_payment_pending ?? 0);
  const todayCollectionBdt = Number(raw.today_collection ?? raw.todayCollectionBdt ?? Math.round(monthlyCollectionBdt / 30));

  const employeeActive = Number(raw.employee_active ?? 0);
  const employeeInactive = Number(raw.employee_inactive ?? 0);
  const employeePaymentReceived = Number(raw.employee_payment_received ?? 0);
  const employeePaymentPending = Number(raw.employees_payment_pending ?? 0);

  const totalPackages = Number(raw.total_packages ?? 0);
  const totalAreas = Number(raw.total_area ?? raw.service_area_total_count ?? 0);

  const routerActive = Number(raw.router_active ?? 0);
  const routerInactive = Number(raw.router_inactive ?? 0);
  const onlineUsers = Number(raw.pop_online ?? raw.online_users ?? raw.onlineUsers ?? activeCustomers);

  // Transform monthly payment statistics from backend if provided
  const paymentStats = raw.customer_payment_statistics as
    | {
        months?: string[];
        successful?: number[];
        pending?: number[];
        failed?: number[];
      }
    | undefined;

  let monthlyTrend = adminDashboardStats.monthlyTrend;
  if (paymentStats && Array.isArray(paymentStats.months) && Array.isArray(paymentStats.successful) && paymentStats.months.length > 0) {
    monthlyTrend = paymentStats.months.map((month, idx) => {
      const collection = Number(paymentStats.successful?.[idx] ?? 0);
      const pending = Number(paymentStats.pending?.[idx] ?? 0);
      const target = collection + pending > 0 ? collection + pending : collection * 1.1 || 50000;
      return {
        month,
        collection,
        target: Math.round(target),
      };
    });
  }

  // Transform routers if provided
  const rawRouters = Array.isArray(raw.routers) ? (raw.routers as Record<string, unknown>[]) : [];
  const routers = rawRouters.length > 0
    ? rawRouters.map((r, idx) => ({
        id: Number(r.id || idx + 1),
        name: String(r.name || `POP Router ${idx + 1}`),
        host: String(r.host || r.ip || '10.10.10.1'),
        status: (String(r.status || 'online').toLowerCase() === 'active' || String(r.status) === 'online' ? 'online' : 'offline') as 'online' | 'offline',
        totalUsers: Number(r.totalUsers || r.users_total || 0),
        activeUsers: Number(r.activeUsers || r.users_online || 0),
        inactiveUsers: Number(r.inactiveUsers || r.users_offline || 0),
        lastUpdated: String(r.lastUpdated || r.updated_at || 'Live sync'),
      }))
    : adminDashboardStats.routers;

  const quotaLimit = Math.max(500, totalCustomers * 2);
  const quotaPercent = quotaLimit > 0 ? Number(((totalCustomers / quotaLimit) * 100).toFixed(1)) : 0;

  return {
    ...adminDashboardStats,
    totalCustomers,
    activeCustomers,
    expiredCustomers,
    inactiveCustomers,
    newCustomers,
    newCustomersThisMonth: newCustomers,
    todayCollectionBdt,
    monthlyCollectionBdt,
    customersPaymentReceivedCount,
    customersExpaymentTotal,
    customersExpaymentCount,
    customersPaymentTotal,
    customersPaymentPending,
    onlineUsers,
    totalPackages,
    totalAreas,
    employeeActive,
    employeeInactive,
    employeePaymentReceived,
    employeePaymentPending,
    routerActive,
    routerInactive,
    customerQuota: {
      used: totalCustomers,
      limit: quotaLimit,
      percent: quotaPercent,
    },
    monthlyTrend,
    routers,
  };
}

export function transformBackendArea(raw: Record<string, unknown>): Area {
  const subareasRaw = Array.isArray(raw.subareas) ? (raw.subareas as Record<string, unknown>[]) : [];
  const subareas: SubArea[] = subareasRaw.map((s, idx) => ({
    id: String(s.id || `sub_${idx + 1}`),
    name: String(s.name || s.subarea_name || 'Subarea'),
    areaCode: String(s.area_code || s.code || `SA-${idx + 1}`),
    status: (s.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
  }));

  return {
    id: String(raw.id || raw.area_id || `area_${Date.now()}`),
    name: String(raw.name || raw.area_name || 'Area'),
    subareas,
  };
}

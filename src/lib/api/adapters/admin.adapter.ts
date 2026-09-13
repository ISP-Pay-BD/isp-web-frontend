import type {
  Customer,
  CustomerStatus,
  ConnectionType,
  Area,
  SubArea,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '@/data/shared/types';
import { adminDashboardStats } from '@/data/admin/dashboard.data';

export type AdminDashboardResult = typeof adminDashboardStats;

export function transformBackendCustomer(input: Record<string, unknown>): Customer {
  const raw = (input.customer && typeof input.customer === 'object' ? input.customer : input) as Record<string, unknown>;
  const pkg = (raw.package_info && typeof raw.package_info === 'object' ? raw.package_info : {}) as Record<string, unknown>;
  const pppoe = (raw.pppoe_info && typeof raw.pppoe_info === 'object' ? raw.pppoe_info : raw.pppoeDetails || {}) as Record<string, unknown>;
  const conn = (raw.connection_details && typeof raw.connection_details === 'object' ? raw.connection_details : raw.connectionDetails || {}) as Record<string, unknown>;
  const olt = (raw.olt_onu && typeof raw.olt_onu === 'object' ? raw.olt_onu : raw.oltDetails || {}) as Record<string, unknown>;
  const usageObj = (raw.usage && typeof raw.usage === 'object' ? raw.usage : {}) as Record<string, unknown>;

  const rawStatus = String(raw.status || raw.subscription_status || raw.conn_status || 'active').toLowerCase();
  const status: CustomerStatus = (
    rawStatus === 'active' || rawStatus === 'expired' || rawStatus === 'suspended'
      ? rawStatus
      : 'active'
  ) as CustomerStatus;

  const rawConn = String(conn.connection_type || raw.connection_type || raw.conn_type || 'pppoe').toLowerCase();
  const connectionType: ConnectionType = (
    rawConn === 'pppoe' || rawConn === 'hotspot' || rawConn === 'static'
      ? rawConn
      : 'pppoe'
  ) as ConnectionType;

  // Bandwidth usage by date
  let bandwidthUsage: { date: string; downloadMb: number; uploadMb: number }[] | undefined = undefined;
  if (Array.isArray(usageObj.by_date)) {
    bandwidthUsage = (usageObj.by_date as Record<string, unknown>[]).map((u) => ({
      date: String(u.date || ''),
      downloadMb: Number(u.download_mb || u.rx_today || 0),
      uploadMb: Number(u.upload_mb || u.tx_today || 0),
    }));
  }

  return {
    id: String(raw.id || raw.customer_id || raw.c_id || raw.user_id || `cust_${Date.now()}`),
    name: String(raw.name || 'Unknown Customer'),
    username: String(pppoe.pppoe_name || raw.username || raw.pppoe_id || raw.email || ''),
    phone: String(raw.mobile || raw.phone || ''),
    email: raw.email ? String(raw.email) : undefined,
    packageId: String(pkg.package_id || raw.package_id || 'pkg_1'),
    packageName: String(pkg.package_name || raw.package_name || 'Standard Package'),
    packagePrice: pkg.package_price || raw.price || raw.package_price ? Number(pkg.package_price || raw.price || raw.package_price) : undefined,
    areaId: String(raw.area_id || 'area_1'),
    areaName: String(pkg.area_name || raw.area_name || 'Main Area'),
    subAreaName: raw.subarea_name || raw.sub_area_name ? String(raw.subarea_name || raw.sub_area_name) : undefined,
    subAreaCode: raw.subarea_code || raw.sub_area_code ? String(raw.subarea_code || raw.sub_area_code) : undefined,
    resellerId: raw.reseller_id ? String(raw.reseller_id) : undefined,
    status,
    expiryDate: String(pkg.will_expire || raw.will_expire || raw.expire_date || raw.expiry_date || new Date().toISOString().split('T')[0]),
    balanceBdt: Number(raw.balance || raw.fund || raw.balance_bdt || 0),
    connectionType,
    macAddress: raw.mac_address
      ? String(raw.mac_address)
      : raw.mac
        ? String(raw.mac)
        : pppoe.caller_id && pppoe.caller_id !== '--'
          ? String(pppoe.caller_id)
          : undefined,
    ipAddress: raw.ip_address
      ? String(raw.ip_address)
      : raw.ip
        ? String(raw.ip)
        : pppoe.address && pppoe.address !== '--'
          ? String(pppoe.address)
          : undefined,
    online: Boolean(raw.online || raw.is_online || raw.conn_status === 'active' || raw.status === 'active'),
    createdAt: String(raw.created_at || new Date().toISOString().split('T')[0]),
    nidNumber: raw.nid || raw.nid_number ? String(raw.nid || raw.nid_number) : undefined,
    code: raw.code || raw.customer_code ? String(raw.code || raw.customer_code) : undefined,
    address: raw.address ? String(raw.address) : undefined,
    latitude: raw.latitude ? Number(raw.latitude) : undefined,
    longitude: raw.longitude ? Number(raw.longitude) : undefined,
    routerId: raw.router_id ? String(raw.router_id) : undefined,
    routerName: pkg.router_name || raw.router_name ? String(pkg.router_name || raw.router_name) : undefined,
    connectionDetails: {
      connectionType: String(conn.connection_type || 'utp'),
      cableRequirement: conn.cable_requirement ? String(conn.cable_requirement) : undefined,
      fiberCode: conn.fiber_code ? String(conn.fiber_code) : undefined,
      numberOfCore: conn.number_of_core ? String(conn.number_of_core) : undefined,
      coreColor: conn.core_color ? String(conn.core_color) : undefined,
      clientType: String(conn.client_type || 'home'),
      billingStatus: String(conn.billing_status || 'active'),
      otc: conn.otc ? String(conn.otc) : undefined,
      routerUsername: conn.router_username ? String(conn.router_username) : undefined,
      routerPassword: conn.router_password ? String(conn.router_password) : undefined,
    },
    pppoeDetails: {
      name: String(pppoe.pppoe_name || raw.username || ''),
      password: String(pppoe.pppoe_password || ''),
      service: String(pppoe.pppoe_service || 'pppoe'),
      profile: String(pppoe.pppoe_profile || 'Default'),
      disabled: Boolean(pppoe.disabled),
      lastLoggedOut: pppoe.uptime ? String(pppoe.uptime) : undefined,
      lastCallerId: pppoe.caller_id ? String(pppoe.caller_id) : undefined,
    },
    oltDetails: {
      name: String(olt.olt_name || 'BDCOM OLT'),
      onuId: String(olt.onu_id || '1'),
      status: String(olt.status || 'online'),
      rxPower: String(olt.rx || '-18.50 dBm'),
      macAddress: String(olt.mac || pppoe.caller_id || '--'),
      callId: String(pppoe.caller_id || '--'),
      matchedId: String(olt.onu_id || '--'),
      description: String(olt.description || 'FTTH Subscriber Line'),
      lastSeen: olt.last_seen ? String(olt.last_seen) : undefined,
      reason: olt.reason ? String(olt.reason) : undefined,
    },
    bandwidthUsage,
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

  // Transform payment methods from backend
  const rawMethods = Array.isArray(raw.payment_methods) ? (raw.payment_methods as Record<string, unknown>[]) : [];
  let paymentMethods = adminDashboardStats.paymentMethods;
  if (rawMethods.length > 0) {
    const totalAmount = rawMethods.reduce((sum, m) => sum + Number(m.total || 0), 0);
    const methodColors: Record<string, string> = {
      bkash: '#E2136E',
      nagad: '#F7941D',
      cash: '#22C55E',
      bank: '#3B82F6',
      sslcommerz: '#8B5CF6',
    };
    paymentMethods = rawMethods.map((m) => {
      const name = String(m.method || 'cash').toLowerCase();
      const amount = Number(m.total || 0);
      const percent = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amountBdt: amount,
        percent,
        color: methodColors[name] || '#A855F7',
      };
    });
  }

  // Transform package distribution from backend
  const rawPkgDist = Array.isArray(raw.package_distribution) ? (raw.package_distribution as Record<string, unknown>[]) : [];
  let packageDistribution = adminDashboardStats.packageDistribution;
  if (rawPkgDist.length > 0) {
    const totalUsersInPackages = rawPkgDist.reduce((sum, p) => sum + Number(p.count || 0), 0);
    const pkgColors = ['#F97316', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#6366F1'];
    packageDistribution = rawPkgDist.map((p, idx) => {
      const count = Number(p.count || 0);
      const percent = totalUsersInPackages > 0 ? Math.round((count / totalUsersInPackages) * 100) : 0;
      return {
        name: String(p.package_name || `Package ${idx + 1}`),
        count,
        percent,
        color: pkgColors[idx % pkgColors.length],
      };
    });
  }

  // Transform weekly collections
  const rawWeekly = Array.isArray(raw.weekly_collections) ? (raw.weekly_collections as Record<string, unknown>[]) : [];
  let weeklyCollections = adminDashboardStats.weeklyCollections;
  if (rawWeekly.length > 0) {
    weeklyCollections = rawWeekly.map((w) => ({
      day: String(w.day || ''),
      amount: Number(w.amount || 0),
    }));
  }

  // Transform ticket stats
  let ticketStats = adminDashboardStats.ticketStats;
  if (raw.ticket_stats && typeof raw.ticket_stats === 'object') {
    const ts = raw.ticket_stats as Record<string, number>;
    const open = Number(ts.open ?? 0);
    const ongoing = Number(ts.ongoing ?? 0);
    const solved = Number(ts.solved ?? 0);
    const closed = Number(ts.closed ?? 0);
    const total = open + ongoing + solved + closed;
    const solvedRate = total > 0 ? Number(((solved / total) * 100).toFixed(1)) : 0;
    ticketStats = {
      open,
      ongoing,
      solved,
      closed,
      solvedRate,
    };
  }

  // Transform geo revenue
  const rawGeo = Array.isArray(raw.geo_revenue) ? (raw.geo_revenue as Record<string, unknown>[]) : [];
  let geoRevenue = adminDashboardStats.geoRevenue;
  if (rawGeo.length > 0) {
    geoRevenue = rawGeo.map((g) => ({
      area: String(g.area_name || g.name || 'Main Area'),
      revenueBdt: Number(g.revenue || 0),
      customers: Number(g.customer_count || g.customers || 0),
      active: Number(g.active_count || g.customer_count || 0),
    }));
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
    paymentMethods,
    packageDistribution,
    weeklyCollections,
    ticketStats,
    geoRevenue,
    routers,
  };
}

export function transformBackendRouter(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    id: String(raw.id || `rtr_${Date.now()}`),
    name: String(raw.name || raw.nasname || 'POP Router'),
    ip: String(raw.ip || raw.host || raw.nasname || '10.10.10.1'),
    port: Number(raw.port || raw.api_port || 8728),
    username: String(raw.username || raw.api_user || 'admin'),
    model: String(raw.model || raw.board_name || 'MikroTik CCR'),
    area: String(raw.area || raw.area_name || 'Main POP'),
    status: (String(raw.status || 'online').toLowerCase() === 'active' || String(raw.status) === 'online' ? 'online' : 'offline'),
    users: Number(raw.users || raw.users_online || raw.active_users || 0),
    uptime: String(raw.uptime || raw.up_time || 'Live'),
    cpuLoad: Number(raw.cpu_load || raw.cpu || 5),
    freeRamMb: Number(raw.free_ram || 850),
    totalRamMb: Number(raw.total_ram || 1024),
    freeHddMb: Number(raw.free_hdd || 450),
    totalHddMb: Number(raw.total_hdd || 512),
    boardName: String(raw.board_name || raw.model || 'MikroTik RouterOS'),
    routerOsVersion: String(raw.version || raw.routeros_version || 'v7.14'),
  };
}

export function transformBackendRouterSession(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    id: String(raw.id || raw['.id'] || `sess_${Date.now()}`),
    username: String(raw.user || raw.name || raw.username || ''),
    callerId: String(raw['caller-id'] || raw.caller_id || raw.mac || ''),
    address: String(raw.address || raw.ip || ''),
    uptime: String(raw.uptime || '00:00:00'),
    service: String(raw.service || 'pppoe'),
    rateLimit: String(raw.rate_limit || raw['rate-limit'] || '10M/10M'),
    rxBytes: Number(raw['rx-byte'] || raw.bytes_in || 0),
    txBytes: Number(raw['tx-byte'] || raw.bytes_out || 0),
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

export function transformBackendPayment(raw: Record<string, unknown>): Payment {
  const rawMethod = String(raw.paid_via || raw.method || 'cash').toLowerCase();
  const method: PaymentMethod = (
    rawMethod.includes('bkash') ? 'bkash' :
    rawMethod.includes('nagad') ? 'nagad' :
    rawMethod.includes('bank') ? 'bank' :
    rawMethod.includes('ssl') ? 'sslcommerz' :
    'cash'
  ) as PaymentMethod;

  const rawStatus = String(raw.status || 'completed').toLowerCase();
  const status: PaymentStatus = (
    rawStatus === 'successful' || rawStatus === 'completed' || rawStatus === 'paid' ? 'completed' :
    rawStatus === 'pending' ? 'pending' :
    'failed'
  ) as PaymentStatus;

  return {
    id: String(raw.id || `pay_${Date.now()}`),
    customerId: String(raw.user_id || raw.customer_id || ''),
    customerName: String(raw.customer_name || raw.name || 'Customer'),
    amountBdt: Number(raw.pay_amount || raw.amount || 0),
    method,
    status,
    invoiceNo: String(raw.invoice || `INV-${raw.id || Date.now()}`),
    paidAt: String(raw.paid_at || raw.created_at || new Date().toISOString()),
    note: raw.comment ? String(raw.comment) : raw.paid_to_name ? `Received by ${raw.paid_to_name}` : undefined,
  };
}

export function transformBackendPaymentsList(raw: unknown): Payment[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => transformBackendPayment(item as Record<string, unknown>));
  }
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
    return (raw as { data: Record<string, unknown>[] }).data.map((item) => transformBackendPayment(item));
  }
  return [];
}




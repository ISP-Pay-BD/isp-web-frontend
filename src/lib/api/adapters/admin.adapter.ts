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
  return {
    ...adminDashboardStats,
    totalCustomers: Number(raw.total_customers || raw.totalCustomers || adminDashboardStats.totalCustomers),
    activeCustomers: Number(raw.active_customers || raw.activeCustomers || adminDashboardStats.activeCustomers),
    expiredCustomers: Number(raw.expired_customers || raw.expiredCustomers || adminDashboardStats.expiredCustomers),
    todayCollectionBdt: Number(raw.today_collection || raw.todayCollectionBdt || adminDashboardStats.todayCollectionBdt),
    monthlyCollectionBdt: Number(raw.monthly_collection || raw.monthlyCollectionBdt || adminDashboardStats.monthlyCollectionBdt),
    onlineUsers: Number(raw.online_users || raw.onlineUsers || adminDashboardStats.onlineUsers),
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

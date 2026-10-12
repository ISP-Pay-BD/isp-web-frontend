import { http, saveBlob } from '@/lib/api/client';
import { getResellerId } from '@/lib/api/auth-utils';
import { num, str } from '@/lib/api/case';
import type {
  AuditEvent,
  Customer,
  CustomerDetail,
  CustomerListFilters,
  CustomerListParams,
  CustomerPayment,
  CustomerSession,
  CustomerStatus,
  CustomerSummary,
  FreeRequest,
  ImportResult,
  PackageOption,
  SelectOption,
} from '../types';

type Raw = Record<string, unknown>;

/** Backend placeholder values ("--", "null", "N/A") read as empty. */
export function clean(value: unknown): string {
  const s = str(value).trim();
  return s === '--' || s.toLowerCase() === 'n/a' ? '' : s;
}

const obj = (value: unknown): Raw => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Raw) : {});
const optional = (value: unknown): string | undefined => clean(value) || undefined;
const optionalNum = (value: unknown): number | undefined => {
  const s = clean(value);
  return s === '' || !Number.isFinite(Number(s)) ? undefined : Number(s);
};

function parseDate(value: string | null): number | null {
  if (!value) return null;
  const t = Date.parse(value.replace(' ', 'T'));
  return Number.isFinite(t) ? t : null;
}

function deriveStatus(expiry: string | null, connStatus: string, accountStatus: string): CustomerStatus {
  const t = parseDate(expiry);
  if (t !== null && t < Date.now()) return 'expired';
  if (connStatus === 'disconn' || accountStatus === 'inactive') return 'suspended';
  return 'active';
}

/** One customer row of GET /v1/reseller/customers/{rid} (batch-enriched list row). */
export function mapCustomer(raw: Raw): Customer {
  const expiry = clean(raw.will_expire) || null;
  const connStatus = clean(raw.conn_status) === 'conn' ? 'conn' : 'disconn';
  const accountStatus = clean(raw.status) === 'inactive' ? 'inactive' : 'active';
  const activity = clean(raw.activity);
  const kind = clean(raw.payment_summary_kind);
  return {
    id: str(raw.id),
    name: clean(raw.name),
    username: clean(raw.pppoe_name) || clean(raw.secret),
    phone: clean(raw.mobile) || clean(raw.phone),
    email: optional(raw.email),
    address: optional(raw.address),
    packageId: clean(raw.package_id),
    packageName: clean(raw.package_name),
    packagePrice: optionalNum(raw.package_price) ?? null,
    areaId: clean(raw.area_id),
    areaName: clean(raw.area_name),
    subAreaId: optional(raw.sub_area_id),
    subAreaName: optional(raw.sub_area_name),
    routerId: optional(raw.router_id),
    routerName: optional(raw.router_name) ?? optional(raw.router),
    status: deriveStatus(expiry, connStatus, accountStatus),
    accountStatus,
    subscriptionStatus: clean(raw.subscription_status),
    connStatus,
    online: activity === 'active' || clean(raw.online_status) === 'Online',
    expiryDate: expiry,
    balanceBdt: num(raw.fund ?? raw.balance),
    connectionType: clean(raw.access_type) === 'static' ? 'static' : 'pppoe',
    lineType: optional(raw.connection_type),
    clientType: optional(raw.client_type),
    billingStatus: optional(raw.billing_status),
    paymentSummary: optional(raw.payment_summary),
    paymentSummaryKind: ['paid', 'due', 'expired', 'inactive'].includes(kind) ? (kind as Customer['paymentSummaryKind']) : undefined,
    createdAt: optional(raw.created_at),
    latitude: optionalNum(raw.latitude),
    longitude: optionalNum(raw.longitude),
  };
}

function mapPayment(raw: Raw): CustomerPayment {
  return {
    id: str(raw.id),
    invoiceNo: clean(raw.invoice) || `#${str(raw.id)}`,
    amountBdt: num(raw.amount),
    method: clean(raw.paid_via),
    status: clean(raw.status),
    month: clean(raw.month),
    paidAt: clean(raw.paid_at) || clean(raw.created_at) || null,
    receivedBy: clean(raw.paid_to_name),
  };
}

/** GET /v1/reseller/customers/{rid}/{id} → `data` (flat detail payload). */
export function mapCustomerDetail(raw: Raw): CustomerDetail {
  const base = mapCustomer({ ...obj(raw.full_data), ...raw });
  const pppoe = obj(raw.pppoe);
  const conn = obj(raw.connection_details);
  const onu = obj(raw.olt_onu);
  const session = obj(raw.active_session);
  const mac = obj(raw.mac_binding);
  const usage = obj(raw.usage);
  const summary = obj(raw.payments_summary);
  const disabled = clean(pppoe.disabled).toLowerCase();
  return {
    ...base,
    online: base.online || Boolean(raw.is_online),
    nidNumber: clean(raw.nid_number) && clean(raw.nid_number) !== '0' ? clean(raw.nid_number) : undefined,
    nidVerified: Boolean(raw.nid_verified),
    ipAddress: optional(session.address) ?? optional(raw.ip_address),
    macAddress: optional(raw.mac_address),
    bandwidth: optional(raw.bandwidth),
    pppoe: {
      name: clean(pppoe.name) || clean(raw.pppoe_name),
      password: clean(pppoe.password) || clean(raw.pppoe_password),
      service: clean(pppoe.service) || clean(raw.pppoe_service),
      profile: clean(pppoe.profile) || clean(raw.pppoe_profile),
      uptime: clean(session.uptime) || clean(pppoe.uptime),
      address: clean(session.address) || clean(pppoe.address),
      callerId: clean(session.caller_id) || clean(pppoe.caller_id),
      lastLoggedOut: clean(pppoe.last_logged_out),
      lastCallerId: clean(pppoe.last_caller_id),
      disabled: disabled === 'true' || disabled === 'yes' ? true : disabled === 'false' || disabled === 'no' ? false : null,
    },
    connection: {
      lineType: optional(conn.connection_type),
      cableRequirement: optional(conn.cable_requirement),
      fiberCode: optional(conn.fiber_code),
      numberOfCore: optional(conn.number_of_core),
      coreColor: optional(conn.core_color),
      clientType: optional(conn.client_type),
      billingStatus: optional(conn.billing_status),
      otc: optional(conn.otc),
      otcStatus: optional(conn.otc_status),
      routerUsername: optional(conn.router_username),
      onuMac: optional(conn.onu_mac),
      vendorName: optional(conn.vendor_name),
      connectedBy: optional(conn.connected_by),
    },
    onu: onu.available
      ? {
          available: true,
          oltName: clean(onu.olt_name),
          onuId: clean(onu.onu_id),
          status: clean(onu.status),
          rx: clean(obj(raw.optical).rx) || clean(onu.rx),
          mac: clean(onu.mac),
          description: clean(onu.description),
          lastSeen: clean(onu.last_seen),
          reason: clean(onu.reason),
        }
      : null,
    macBinding: { isBound: Boolean(mac.is_bound), mac: clean(mac.mac) },
    usage: (Array.isArray(usage.by_date) ? (usage.by_date as Raw[]) : []).map((u) => ({
      date: str(u.date),
      downloadMb: num(u.download_mb),
      uploadMb: num(u.upload_mb),
    })),
    payments: (Array.isArray(raw.payments) ? (raw.payments as Raw[]) : []).map(mapPayment),
    paymentsSummary: {
      totalCount: num(summary.total_count),
      successfulAmount: num(summary.successful_amount),
      pendingAmount: num(summary.pending_amount),
      failedAmount: num(summary.failed_amount),
    },
  };
}

function mapSummary(raw: Raw): CustomerSummary {
  return {
    total: num(raw.total),
    online: num(raw.online),
    offline: num(raw.offline),
    expired: num(raw.expired),
    disconnected: num(raw.disconnected),
    due7: num(raw.due_7),
    expiredToday: num(raw.expired_today),
    expired7: num(raw.expired_7),
    expiredOver30: num(raw.expired_over_30),
    inactive: num(raw.inactive),
    newThisMonth: num(raw.new_this_month),
  };
}

/** UI filters → backend query params (snake_case, empty values dropped). */
export function filterParams(f: CustomerListFilters = {}): Record<string, unknown> {
  const params: Record<string, unknown> = {
    search: f.search || undefined,
    status: f.status,
    connection: f.connection,
    conn_status: f.connStatus,
    expiry: f.expiry,
    area_id: f.areaId,
    package_id: f.packageId,
    router_id: f.routerId,
    access_type: f.accessType,
  };
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
}

const base = () => `/v1/reseller/customers/${getResellerId()}`;

export const customersApi = {
  list: async (params: CustomerListParams = {}) => {
    const { page = 1, perPage = 20, ...filters } = params;
    const res = await http.getPage<Raw>(base(), { ...filterParams(filters), page, per_page: perPage });
    return { items: res.items.map(mapCustomer), meta: res.meta };
  },

  summary: async (filters: CustomerListFilters = {}) => {
    const { search, areaId, packageId, routerId, accessType } = filters;
    return mapSummary(await http.get<Raw>(`${base()}/summary`, filterParams({ search, areaId, packageId, routerId, accessType })));
  },

  detail: async (id: string, compact = false) =>
    mapCustomerDetail(await http.get<Raw>(`${base()}/${id}`, compact ? { compact: 1 } : undefined)),

  session: async (id: string): Promise<CustomerSession> => {
    const raw = await http.get<Raw>(`${base()}/${id}/session`);
    const s = obj(raw.active_session);
    const traffic = raw.traffic ? obj(raw.traffic) : null;
    return {
      routerOnline: raw.router_online !== false,
      available: Boolean(s.available),
      uptime: clean(s.uptime),
      address: clean(s.address),
      callerId: clean(s.caller_id),
      rxMbps: traffic && traffic.available ? num(traffic.rxbyte) : null,
      txMbps: traffic && traffic.available ? num(traffic.txbyte) : null,
    };
  },

  create: (body: Record<string, unknown>) => http.post<Raw>(`/v1/reseller/customers/create/${getResellerId()}`, body),
  update: (id: string, body: Record<string, unknown>) => http.post<Raw>(`${base()}/${id}`, body),
  remove: (id: string) => http.delete(`${base()}/${id}`),

  bulkDelete: (ids: string[]) => http.post<Raw>(`${base()}/bulk-delete`, { ids }),
  bulkRecharge: (ids: string[], willExpire: string, packageId?: string) =>
    http.post<Raw>(`${base()}/bulk-recharge`, { ids, will_expire: willExpire, package_id: packageId || undefined }),
  bulkUpdateRouter: (ids: string[], routerId: string) => http.post<Raw>(`${base()}/bulk-update-router`, { ids, router_id: routerId }),
  bulkChangePackage: (ids: string[], packageId: string) => http.post<Raw>('/v1/customers/bulk-change-package', { ids, package_id: packageId }),
  bulkConnStatus: (ids: string[], status: 'conn' | 'disconn') => http.post<Raw>('/v1/customers/bulk-conn-status', { ids, status }),
  syncPppoe: (customerId?: string) => http.post<Raw>(`${base()}/sync-pppoe`, customerId ? { customer_id: customerId } : {}),
  sendSms: (ids: string[], content: string) => http.post<Raw>(`/v1/reseller/sms/${getResellerId()}/send`, { content, send_to: ids }),

  kick: (id: string) => http.post<Raw>(`/v1/customers/${id}/kick`),
  ping: (id: string) => http.post<Raw>(`${base()}/${id}/ping`),
  refreshOnu: (id: string) => http.post<Raw>(`/v1/customers/${id}/refresh-onu`),

  macStatus: async (id: string) => {
    const raw = await http.get<Raw>(`${base()}/${id}/mac-status`);
    const binding = obj(obj(raw.payload).mac_binding);
    return { isBound: Boolean(binding.is_bound), mac: clean(binding.mac) };
  },
  macBind: (id: string) => http.post<Raw>(`${base()}/${id}/mac-bind`),
  macUnbind: (id: string) => http.post<Raw>(`${base()}/${id}/mac-unbind`),

  auditLogs: async (id: string, page: number, perPage: number) => {
    const res = await http.getPage<Raw>(`${base()}/${id}/audit-logs`, { page, per_page: perPage }, { listKey: 'logs' });
    return {
      meta: res.meta,
      items: res.items.map(
        (r): AuditEvent => ({
          id: str(r.id),
          action: clean(r.action),
          entity: clean(r.entity),
          details: clean(r.details),
          actor: clean(r.actor),
          router: clean(r.router),
          ipAddress: clean(r.ip_address),
          createdAt: clean(r.created_at) || null,
        }),
      ),
    };
  },

  freeRequests: async (params: { status?: string; search?: string; page?: number; perPage?: number }) => {
    const res = await http.getPage<Raw>('/v1/customers/free-requests', {
      status: params.status && params.status !== 'all' ? params.status : undefined,
      search: params.search || undefined,
      page: params.page ?? 1,
      per_page: params.perPage ?? 20,
    });
    return {
      meta: res.meta,
      items: res.items.map(
        (r): FreeRequest => ({
          id: str(r.id),
          customerId: str(r.user_id),
          customerName: clean(r.customer_name),
          customerMobile: clean(r.customer_mobile),
          customerExpiry: clean(r.customer_expiry) || null,
          resellerName: clean(r.reseller_name),
          status: (['pending', 'approved', 'rejected'].includes(clean(r.status)) ? clean(r.status) : 'pending') as FreeRequest['status'],
          requestedAt: clean(r.created_at) || null,
        }),
      ),
    };
  },
  approveFreeRequest: (id: string) => http.post<Raw>(`/v1/customers/free-requests/${id}/approve`),
  rejectFreeRequest: (id: string) => http.post<Raw>(`/v1/customers/free-requests/${id}/reject`),

  importExcel: async (file: File, onProgress?: (percent: number) => void): Promise<ImportResult> => {
    const fd = new FormData();
    fd.append('excel_file', file);
    const raw = await http.upload<Raw>(`${base()}/import-excel`, fd, onProgress);
    const rows = (v: unknown) => (Array.isArray(v) ? (v as Raw[]) : []).map((e) => ({ row: num(e.row), message: clean(e.message) }));
    return {
      rowCount: num(raw.row_count),
      createdCount: num(raw.created_count),
      errorCount: num(raw.error_count),
      warningCount: num(raw.warning_count),
      errors: rows(raw.errors),
      warnings: rows(raw.warnings),
    };
  },

  exportExcel: async (filters: CustomerListFilters) => {
    const { blob, filename } = await http.download(`${base()}/export-excel`, filterParams(filters));
    saveBlob(blob, filename ?? `customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },
};

/** Dropdown option sources (areas, packages, routers, sub-areas, PPPoE profiles). */
export const optionsApi = {
  areas: async (): Promise<SelectOption[]> => {
    const res = await http.getPage<Raw>(`/v1/reseller/areas/${getResellerId()}`, { per_page: 100 });
    return res.items.map((a) => ({ id: str(a.id), name: clean(a.area_name) || clean(a.name) }));
  },
  subAreas: async (areaId: string): Promise<SelectOption[]> => {
    const res = await http.getPage<Raw>(`/v1/reseller/areas/${getResellerId()}/sub/${areaId}`, { per_page: 100 });
    return res.items.map((s) => ({ id: str(s.id), name: clean(s.area_name) }));
  },
  packages: async (): Promise<PackageOption[]> => {
    const res = await http.getPage<Raw>(`/v1/reseller/packages/${getResellerId()}`, { per_page: 100 });
    return res.items.map((p) => {
      const selling = optionalNum(p.selling_price);
      return {
        id: str(p.id),
        name: clean(p.package_name) || clean(p.name),
        price: selling ?? optionalNum(p.price) ?? null,
        bandwidth: clean(p.bandwidth),
        mikrotikProfile: optional(p.mikrotik_profile),
      };
    });
  },
  routers: async (): Promise<SelectOption[]> => {
    const res = await http.getPage<Raw>(`/v1/reseller/routers/${getResellerId()}`, { per_page: 100 });
    return res.items.map((r) => ({ id: str(r.id), name: clean(r.name) || `#${str(r.id)}` }));
  },
  pppoeProfiles: async (routerId: string): Promise<{ reachable: boolean; profiles: string[] }> => {
    const raw = await http.get<Raw>(`/v1/reseller/routers/${getResellerId()}/pppoe-profiles`, { router_id: routerId });
    const list = Array.isArray(raw.profiles) ? (raw.profiles as Raw[]) : [];
    return { reachable: raw.reachable !== false, profiles: list.map((p) => clean(p.name)).filter(Boolean) };
  },
};

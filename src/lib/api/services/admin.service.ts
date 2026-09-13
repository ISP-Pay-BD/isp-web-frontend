import { http } from '../client';
import {
  transformBackendCustomer,
  transformBackendCustomersList,
  transformBackendDashboardStats,
  transformBackendArea,
  transformBackendPayment,
  transformBackendPaymentsList,
  type AdminDashboardResult,
} from '../adapters/admin.adapter';
import type { Customer, Area, Package, Payment, SupportTicket, OltDetails, BandwidthUsage } from '@/data/shared/types';
import type {
  HierarchyNode,
  HierarchyScope,
  HierarchyTreeResponse,
  ResellerSubscribersResponse,
} from '@/features/shared/hierarchy/types';
import { getAuthUserId } from '../auth-utils';
import { mockFetch } from '@/lib/mock-api/client';

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  areaId?: string;
  packageId?: string;
  resellerId?: string | number;
}

export interface BulkRechargePayload {
  customerIds: string[];
  days?: number;
  packageId?: string;
}

export interface BulkDeletePayload {
  customerIds: string[];
}

export interface CustomersListResult {
  items: Customer[];
  total: number;
}

export interface CustomerDetailResult {
  customer: Customer;
  payments: Payment[];
}

export const adminService = {
  getDashboardStats: async (resellerId?: string | number): Promise<AdminDashboardResult> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<Record<string, unknown>>(`/v1/reseller/dashboard/${finalId}`);
    return transformBackendDashboardStats(raw);
  },

  getCustomers: async (params?: CustomerListParams): Promise<CustomersListResult> => {
    const resellerId = params?.resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/customers/${resellerId}`, params as Record<string, unknown>);
    const list = transformBackendCustomersList(raw);
    return {
      items: list,
      total: list.length,
    };
  },

  getExpiredCustomers: async (resellerId?: string | number): Promise<CustomersListResult> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/customers/${finalId}`, { status: 'expired' });
    const list = transformBackendCustomersList(raw);
    const expired = list.filter((c) => c.status === 'expired');
    return {
      items: expired,
      total: expired.length,
    };
  },

  getCustomerById: async (id: string, resellerId?: string | number): Promise<CustomerDetailResult | null> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<Record<string, unknown>>(`/v1/reseller/customers/${finalId}/${id}`);
    if (!raw) return null;

    const customer = transformBackendCustomer(raw);
    
    // Fetch payments for this specific customer
    let payments: Payment[] = [];
    if (raw.payments && Array.isArray(raw.payments)) {
      payments = transformBackendPaymentsList(raw.payments);
    } else {
      try {
        const paymentsRaw = await http.get<unknown>(`/v1/reseller/customer-payments/${finalId}/user/${id}`);
        payments = transformBackendPaymentsList(paymentsRaw);
      } catch {
        payments = [];
      }
    }

    return { customer, payments };
  },

  getCustomerOptical: async (id: string, resellerId?: string | number): Promise<OltDetails | null> => {
    const finalId = resellerId || getAuthUserId();
    try {
      const res = await http.get<{ data?: Record<string, unknown> } | Record<string, unknown>>(`/v1/reseller/customers/${finalId}/${id}/optical`);
      const raw = (res && typeof res === 'object' && 'data' in res ? res.data : res) as Record<string, unknown> | undefined;
      if (!raw) return null;
      return {
        name: String(raw.olt_name || 'BDCOM OLT'),
        onuId: String(raw.onu_id || '1'),
        status: String(raw.status || 'online'),
        rxPower: String(raw.rx || '-18.50 dBm'),
        macAddress: String(raw.mac || '--'),
        callId: String(raw.caller_id || '--'),
        matchedId: String(raw.onu_id || '--'),
        description: String(raw.description || 'FTTH Subscriber Line'),
        lastSeen: raw.last_seen ? String(raw.last_seen) : undefined,
        reason: raw.reason ? String(raw.reason) : undefined,
      };
    } catch {
      return null;
    }
  },

  getCustomerSession: async (id: string, resellerId?: string | number): Promise<{
    uptime?: string;
    address?: string;
    caller_id?: string;
    service?: string;
    traffic?: { rxbyte?: number; txbyte?: number; unit?: string };
  } | null> => {
    const finalId = resellerId || getAuthUserId();
    try {
      const res = await http.get<{ data?: Record<string, unknown> } | Record<string, unknown>>(`/v1/reseller/customers/${finalId}/${id}/session`);
      const raw = (res && typeof res === 'object' && 'data' in res ? res.data : res) as Record<string, unknown> | undefined;
      if (!raw) return null;
      const activeSession = (raw.active_session && typeof raw.active_session === 'object' ? raw.active_session : {}) as Record<string, unknown>;
      const traffic = (raw.traffic && typeof raw.traffic === 'object' ? raw.traffic : {}) as Record<string, unknown>;
      return {
        uptime: String(activeSession.uptime || raw.uptime || '--'),
        address: String(activeSession.address || raw.address || '--'),
        caller_id: String(activeSession.caller_id || raw.caller_id || '--'),
        service: String(activeSession.service || raw.service || 'pppoe'),
        traffic: {
          rxbyte: Number(traffic.rxbyte ?? 0),
          txbyte: Number(traffic.txbyte ?? 0),
          unit: String(traffic.unit || 'Mbps'),
        },
      };
    } catch {
      return null;
    }
  },

  getCustomerUsage: async (id: string, resellerId?: string | number): Promise<BandwidthUsage[] | null> => {
    const finalId = resellerId || getAuthUserId();
    try {
      const res = await http.get<{ data?: { by_date?: Record<string, unknown>[] } } | { by_date?: Record<string, unknown>[] }>(`/v1/reseller/customers/${finalId}/${id}/usage`);
      const raw = (res && typeof res === 'object' && 'data' in res ? res.data : res) as { by_date?: Record<string, unknown>[] } | undefined;
      if (raw && Array.isArray(raw.by_date)) {
        return raw.by_date.map((u) => ({
          date: String(u.date || ''),
          downloadMb: Number(u.download_mb || u.rx_today || 0),
          uploadMb: Number(u.upload_mb || u.tx_today || 0),
        }));
      }
      return null;
    } catch {
      return null;
    }
  },

  getUserPayments: async (id: string, resellerId?: string | number): Promise<Payment[]> => {
    const finalId = resellerId || getAuthUserId();
    try {
      const res = await http.get<unknown>(`/v1/reseller/customer-payments/${finalId}/user/${id}`);
      return transformBackendPaymentsList(res);
    } catch {
      return [];
    }
  },

  createCustomer: async (data: Partial<Customer>, resellerId?: string | number): Promise<Customer> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.post<Record<string, unknown>>(`/v1/reseller/customers/create/${finalId}`, data);
    return transformBackendCustomer(raw);
  },

  updateCustomer: async (id: string, data: Partial<Customer>, resellerId?: string | number): Promise<Customer> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.post<Record<string, unknown>>(`/v1/reseller/customers/${finalId}/${id}`, data);
    return transformBackendCustomer(raw);
  },

  deleteCustomer: async (id: string, resellerId?: string | number): Promise<void> => {
    const finalId = resellerId || getAuthUserId();
    await http.delete(`/v1/reseller/customers/${finalId}/${id}`);
  },

  bulkRecharge: async (payload: BulkRechargePayload, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/customers/${finalId}/bulk-recharge`, payload);
  },

  bulkDelete: async (payload: BulkDeletePayload, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/customers/${finalId}/bulk-delete`, payload);
  },

  syncPppoe: async (customerId: string, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/customers/${finalId}/sync-pppoe`, { customer_id: customerId });
  },

  macBind: async (customerId: string, mac: string, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/customers/${finalId}/${customerId}/mac-bind`, { mac });
  },

  importExcel: async (formData: FormData, onProgress?: (percent: number) => void, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.upload(`/v1/reseller/customers/${finalId}/import-excel`, formData, onProgress);
  },

  getAreas: async (resellerId?: string | number): Promise<{ items: Area[] }> => {
    const finalId = resellerId || getAuthUserId();
    try {
      const raw = await http.get<unknown>(`/v1/reseller/areas/${finalId}`);
      if (Array.isArray(raw)) {
        return { items: raw.map((item) => transformBackendArea(item as Record<string, unknown>)) };
      }
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
        return { items: (raw as { data: Record<string, unknown>[] }).data.map((item) => transformBackendArea(item)) };
      }
      return { items: [] };
    } catch {
      return (await mockFetch('admin.domain', 'areas')) as { items: Area[] };
    }
  },

  createArea: async (data: { name: string; subareas?: string[] }, resellerId?: string | number): Promise<Area> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.post<Record<string, unknown>>(`/v1/reseller/areas/${finalId}`, data);
    return transformBackendArea(raw);
  },

  updateArea: async (id: string, data: { name: string }) => {
    return await http.put(`/v1/reseller/areas/update/${id}`, data);
  },

  deleteArea: async (id: string) => {
    return await http.delete(`/v1/reseller/areas/${id}/delete`);
  },

  addSubArea: async (areaId: string, payload: { name: string; areaCode: string }) => {
    return await http.post('/v1/reseller/subareas', { area_id: areaId, ...payload });
  },

  updateSubArea: async (areaIdOrSubId: string, subIdOrPayload: any, payload?: any) => {
    const subId = payload !== undefined ? subIdOrPayload : areaIdOrSubId;
    const body = payload !== undefined ? payload : subIdOrPayload;
    return await http.put(`/v1/reseller/subareas/update/${subId}`, body);
  },

  deleteSubArea: async (areaId?: string, subId?: string) => {
    return await http.delete('/v1/reseller/subareas/delete', { area_id: areaId, sub_id: subId });
  },



  getEmployees: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    try {
      const raw = await http.get<unknown>(`/v1/reseller/employees/${finalId}`);
      if (Array.isArray(raw) && raw.length > 0) {
        return { employees: raw };
      }
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data) && (raw as { data: unknown[] }).data.length > 0) {
        return { employees: (raw as { data: unknown[] }).data };
      }
      const mockHr = (await mockFetch('admin.domain', 'hr')) as { employees?: unknown[] };
      return { employees: mockHr.employees ?? [] };
    } catch {
      const mockHr = (await mockFetch('admin.domain', 'hr')) as { employees?: unknown[] };
      return { employees: mockHr.employees ?? [] };
    }
  },

  createEmployee: async (data: Record<string, unknown>, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/employees/${finalId}`, data);
  },

  updateEmployee: async (id: string, data: Record<string, unknown>, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.put(`/v1/reseller/employees/${finalId}/${id}`, data);
  },

  deleteEmployee: async (idOrResellerId?: string | number) => {
    const finalId = getAuthUserId();
    return await http.delete(`/v1/reseller/employees/${finalId}/${idOrResellerId}`);
  },

  getAttendanceLogs: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    try {
      const raw = await http.get<unknown>(`/v1/reseller/employees/${finalId}/attendance`);
      if (Array.isArray(raw) && raw.length > 0) {
        return raw;
      }
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data) && (raw as { data: unknown[] }).data.length > 0) {
        return (raw as { data: unknown[] }).data;
      }
      const mockHr = (await mockFetch('admin.domain', 'hr')) as { attendanceRecords?: unknown[] };
      return mockHr.attendanceRecords ?? [];
    } catch {
      const mockHr = (await mockFetch('admin.domain', 'hr')) as { attendanceRecords?: unknown[] };
      return mockHr.attendanceRecords ?? [];
    }
  },

  getAdvanceSalaryRequests: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    try {
      const raw = await http.get<unknown>(`/v1/reseller/employees/${finalId}/advance-salary`);
      if (Array.isArray(raw) && raw.length > 0) {
        return raw;
      }
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data) && (raw as { data: unknown[] }).data.length > 0) {
        return (raw as { data: unknown[] }).data;
      }
      const mockHr = (await mockFetch('admin.domain', 'hr')) as { advanceSalaryRequests?: unknown[] };
      return mockHr.advanceSalaryRequests ?? [];
    } catch {
      const mockHr = (await mockFetch('admin.domain', 'hr')) as { advanceSalaryRequests?: unknown[] };
      return mockHr.advanceSalaryRequests ?? [];
    }
  },

  applyAdvanceSalary: async (payload: { employee_id: string; amount: number; reason?: string }, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/employees/${finalId}/advance-salary`, payload);
  },

  updateAdvanceSalaryStatus: async (id: string, status: string, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.put(`/v1/reseller/employees/${finalId}/advance-salary/${id}`, { status });
  },

  getAdminSupportTickets: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/support-tickets/${finalId}`);
    if (raw && typeof raw === 'object' && 'data' in raw) {
      const tickets = (raw as { data: SupportTicket[] }).data || [];
      const open = tickets.filter((t) => (t.status as string) === 'open').length;
      const pending = tickets.filter((t) => (t.status as string) === 'pending' || (t.status as string) === 'ongoing' || (t.status as string) === 'in_progress').length;
      const closed = tickets.filter((t) => (t.status as string) === 'closed' || (t.status as string) === 'resolved' || (t.status as string) === 'solved').length;
      return {
        tickets,
        stats: { open, pending, closed, avgResponseHours: 1.5 },
      };
    }
    if (Array.isArray(raw)) {
      const tickets = raw as SupportTicket[];
      return {
        tickets,
        stats: {
          open: tickets.filter((t) => (t.status as string) === 'open').length,
          pending: tickets.filter((t) => (t.status as string) === 'pending' || (t.status as string) === 'ongoing' || (t.status as string) === 'in_progress').length,
          closed: tickets.filter((t) => (t.status as string) === 'closed' || (t.status as string) === 'resolved' || (t.status as string) === 'solved').length,
          avgResponseHours: 1.5,
        },
      };
    }
    return {
      tickets: [],
      stats: { open: 0, pending: 0, closed: 0, avgResponseHours: 0 },
    };
  },

  getAdminSupportTicketDetail: async (id: string, resellerId?: string | number): Promise<SupportTicket | null> => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<SupportTicket>(`/v1/reseller/support-tickets/${finalId}/${id}`);
  },

  getSmsData: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    const [areasRes, customerRes, smsRes] = await Promise.allSettled([
      adminService.getAreas(finalId),
      adminService.getCustomers({ resellerId: finalId }),
      http.get<unknown>(`/v1/reseller/sms/${finalId}`),
    ]);

    const areas = areasRes.status === 'fulfilled' ? areasRes.value.items : [];
    const customers = customerRes.status === 'fulfilled' ? customerRes.value.items : [];
    const rawSms = smsRes.status === 'fulfilled' ? smsRes.value : {};

    return {
      ...(typeof rawSms === 'object' && rawSms !== null ? rawSms : {}),
      areas,
      customers,
    };
  },

  sendSmsBroadcast: async (payload: { recipientType: string; message: string; templateId?: string; areaId?: string }, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/sms/${finalId}/send`, payload);
  },

  getAccountingDomain: async (section: string, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    const endpoint = section === 'balance-sheet' ? 'balance-sheet' : section === 'chart-of-accounts' ? 'chart-of-accounts' : 'journal-entries';
    return await http.get<unknown>(`/v1/reseller/accounting/${finalId}/${endpoint}`);
  },

  getRouters: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/routers/${finalId}`);
    if (Array.isArray(raw)) {
      return raw;
    }
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      return (raw as { data: unknown[] }).data;
    }
    return [];
  },

  getRouterUsers: async (routerId: string | number, status = 'all', resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/router-users/${finalId}/${routerId}`, { status });
  },

  getRouterIpPools: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/ip-pools/${finalId}`);
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      return (raw as { data: unknown[] }).data;
    }
    return [];
  },

  getPackages: async (resellerId?: string | number): Promise<Package[]> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/packages/${finalId}`);
    if (Array.isArray(raw)) {
      return raw as Package[];
    }
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: Package[] }).data)) {
      return (raw as { data: Package[] }).data;
    }
    return [];
  },

  getRewardsData: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/rewards/${finalId}/config`);
  },

  // Extended Phase 8.1 - 8.7 API Methods
  getOltList: async () => {
    return await http.get<unknown>('/v1/reseller/olt');
  },

  getNetworkTopology: async (oltId?: string | number) => {
    const url = oltId && oltId !== 'all' ? `/v1/reseller/olt/${oltId}/topology` : '/v1/reseller/olt/topology';
    return await http.get<unknown>(url);
  },

  getNetworkOpsBundle: async () => {
    return await http.get<unknown>('/v1/reseller/network/ops-bundle');
  },

  getOltDetail: async (id: string | number) => {
    return await http.get<unknown>(`/v1/reseller/olt/${id}`);
  },

  getOltOnus: async (id: string | number) => {
    return await http.get<unknown>(`/v1/reseller/olt/${id}/onus`);
  },

  syncOlt: async (id: string | number) => {
    return await http.post<unknown>(`/v1/reseller/olt/${id}/sync`);
  },

  getHotspotPlans: async () => {
    return await http.get<unknown>('/v1/reseller/hotspot/plans');
  },

  getHotspotVouchers: async () => {
    return await http.get<unknown>('/v1/reseller/hotspot/vouchers');
  },

  generateHotspotVouchers: async (payload: { plan_id: string | number; count: number; prefix?: string }) => {
    return await http.post<unknown>('/v1/reseller/hotspot/vouchers/generate', payload);
  },

  getHotspotActiveUsers: async () => {
    return await http.get<unknown>('/v1/reseller/hotspot/active-users');
  },

  getInventoryItems: async () => {
    return await http.get<unknown>('/v1/reseller/inventory/items');
  },

  getInventoryCategories: async () => {
    return await http.get<unknown>('/v1/reseller/inventory/categories');
  },

  getInventorySuppliers: async () => {
    return await http.get<unknown>('/v1/reseller/inventory/suppliers');
  },

  createInventoryItem: async (data: Record<string, unknown>) => {
    return await http.post<unknown>('/v1/reseller/inventory/items', data);
  },

  getReportRevenue: async (params?: Record<string, unknown>) => {
    return await http.get<unknown>('/v1/reseller/reports/revenue', params);
  },

  getReportCustomers: async (params?: Record<string, unknown>) => {
    return await http.get<unknown>('/v1/reseller/reports/customers', params);
  },

  getReportBandwidth: async (params?: Record<string, unknown>) => {
    return await http.get<unknown>('/v1/reseller/reports/bandwidth', params);
  },

  getWhatsAppSessions: async () => {
    return await http.get<unknown>('/v1/reseller/whatsapp/sessions');
  },

  getWhatsAppTemplates: async () => {
    return await http.get<unknown>('/v1/reseller/whatsapp/templates');
  },

  sendWhatsAppMessage: async (payload: { recipient: string; message: string; template_id?: string }) => {
    return await http.post<unknown>('/v1/reseller/whatsapp/send', payload);
  },


  checkInAttendance: async (payload?: { latitude?: number; longitude?: number }, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post<unknown>(`/v1/reseller/employees/${finalId}/attendance/check-in`, payload);
  },

  checkOutAttendance: async (payload?: { latitude?: number; longitude?: number }, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post<unknown>(`/v1/reseller/employees/${finalId}/attendance/check-out`, payload);
  },

  updateAttendanceLocation: async (payload: { latitude: number; longitude: number }, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post<unknown>(`/v1/reseller/employees/${finalId}/attendance/location`, payload);
  },

  getPopFunding: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/funding/${finalId}`);
  },

  createPopFunding: async (payload: { popId?: string; amountBdt: number; note?: string }, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post<unknown>(`/v1/reseller/funding/${finalId}`, payload);
  },

  getVoiceSmsData: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/voice-sms/${finalId}/templates`);
  },

  getTenantWallet: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/transactions/${finalId}`);
  },

  getBandwidthUsage: async (routerId?: string | number, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    if (routerId) {
      try {
        return await http.get<unknown>(`/dashboard/bandwidth-usage/${routerId}`);
      } catch {
        // Fallback to reseller report bandwidth
      }
    }
    return await http.get<unknown>('/v1/reseller/reports/bandwidth', { reseller_id: finalId });
  },

  getRouterSessions: async (routerId?: string | number, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/routers/${finalId}/sessions`, { router_id: routerId });
  },

  disconnectRouterSession: async (payload: { sessionId: string; routerId?: string | number }, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post<unknown>(`/v1/reseller/routers/${finalId}/disconnect`, payload);
  },

  getDhcpLeases: async (routerId?: string | number, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/routers/${finalId}/dhcp-leases`, { router_id: routerId });
  },

  getRouterQueues: async (routerId?: string | number, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/routers/${finalId}/queues`, { router_id: routerId });
  },

  getBtrcReport: async (params?: Record<string, unknown>, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/reports/btrc/${finalId}`, params);
  },


  getEmployeeSalarySummary: async (empId: number | string, month: string, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/employee-payments/${finalId}/salary-summary/${empId}/${month}`);
  },

  getHierarchyTree: async (scope: HierarchyScope, resellerId?: string): Promise<HierarchyTreeResponse> => {
    try {
      const authId = getAuthUserId();
      const res = await http.get<HierarchyTreeResponse>('/v1/hierarchy/tree', {
        scope,
        adminId: authId,
        resellerId: resellerId || undefined,
      });
      if (res && res.root && res.summary) {
        return res;
      }
      return (await mockFetch('hierarchy.tree', scope, resellerId)) as HierarchyTreeResponse;
    } catch {
      return (await mockFetch('hierarchy.tree', scope, resellerId)) as HierarchyTreeResponse;
    }
  },

  getResellerSubscribers: async (
    resellerId: string | number,
    params?: { page?: number; limit?: number; search?: string; status?: string },
  ): Promise<ResellerSubscribersResponse> => {
    return await http.get<ResellerSubscribersResponse>('/v1/hierarchy/reseller-customers', {
      resellerId,
      ...params,
    });
  },

  expandHierarchyNode: async (
    nodeId: string,
    limit: number = 20,
  ): Promise<{ parentNodeId: string; children: HierarchyNode[] }> => {
    return await http.get<{ parentNodeId: string; children: HierarchyNode[] }>(
      '/v1/hierarchy/expand-node',
      { nodeId, limit },
    );
  },

  getCustomerPayments: async (resellerId?: string | number): Promise<{ items: Payment[] }> => {
    const finalId = resellerId || getAuthUserId();
    try {
      const raw = await http.get<unknown>(`/v1/reseller/customer-payments/${finalId}`);
      return {
        items: transformBackendPaymentsList(raw),
      };
    } catch {
      return (await mockFetch('admin.domain', 'payments')) as { items: Payment[] };
    }
  },

  createPayment: async (data: Partial<Payment>, resellerId?: string | number): Promise<Payment> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.post<Record<string, unknown>>(`/v1/reseller/customer-payments/${finalId}`, data);
    return transformBackendPayment(raw);
  },
};


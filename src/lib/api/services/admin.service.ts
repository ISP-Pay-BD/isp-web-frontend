import { http } from '../client';
import {
  transformBackendCustomer,
  transformBackendCustomersList,
  transformBackendDashboardStats,
  transformBackendArea,
  type AdminDashboardResult,
} from '../adapters/admin.adapter';
import type { Customer, Area, Package, Payment, SupportTicket } from '@/data/shared/types';
import { getAuthUserId } from '../auth-utils';

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
    const customer = transformBackendCustomer(raw);
    
    // Fetch payments for this specific customer
    let payments: Payment[] = [];
    try {
      const paymentsRaw = await http.get<unknown>(`/v1/reseller/customer-payments/${finalId}/user/${id}`);
      if (Array.isArray(paymentsRaw)) {
        payments = paymentsRaw as Payment[];
      }
    } catch {
      payments = [];
    }

    return { customer, payments };
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
    const raw = await http.get<unknown>(`/v1/reseller/areas/${finalId}`);
    if (Array.isArray(raw)) {
      return { items: raw.map((item) => transformBackendArea(item as Record<string, unknown>)) };
    }
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      return { items: (raw as { data: Record<string, unknown>[] }).data.map((item) => transformBackendArea(item)) };
    }
    return { items: [] };
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

  getCustomerPayments: async (resellerId?: string | number): Promise<{ items: Payment[] }> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/customer-payments/${finalId}`);
    if (Array.isArray(raw)) {
      return { items: raw as Payment[] };
    }
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      return { items: (raw as { data: Payment[] }).data };
    }
    return { items: [] };
  },

  createPayment: async (data: Partial<Payment>, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/customer-payments/${finalId}`, data);
  },

  getEmployees: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/employees/${finalId}`);
    if (Array.isArray(raw)) {
      return { employees: raw };
    }
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      return { employees: (raw as { data: unknown[] }).data };
    }
    return { employees: [] };
  },

  createEmployee: async (data: Record<string, unknown>, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.post(`/v1/reseller/employees/${finalId}`, data);
  },

  updateEmployee: async (id: string, data: Record<string, unknown>, resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.put(`/v1/reseller/employees/${finalId}/${id}`, data);
  },

  deleteEmployee: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.delete(`/v1/reseller/employees/${finalId}`);
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

  getPackages: async (resellerId?: string | number): Promise<Package[]> => {
    const finalId = resellerId || getAuthUserId();
    const raw = await http.get<unknown>(`/v1/reseller/packages/${finalId}`);
    if (Array.isArray(raw)) {
      return raw as Package[];
    }
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      return (raw as { data: Package[] }).data;
    }
    return [];
  },

  getRewardsData: async (resellerId?: string | number) => {
    const finalId = resellerId || getAuthUserId();
    return await http.get<unknown>(`/v1/reseller/rewards/${finalId}/config`);
  },
};

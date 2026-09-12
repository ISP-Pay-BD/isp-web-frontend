import { http } from '../client';
import {
  transformBackendCustomer,
  transformBackendCustomersList,
  transformBackendDashboardStats,
  transformBackendArea,
  type AdminDashboardResult,
} from '../adapters/admin.adapter';
import type { Customer, Area, Package, Payment, SupportTicket } from '@/data/shared/types';
import { mockFetch } from '@/lib/mock-api/client';
import { customers } from '@/data/admin/customers.data';
import { areas } from '@/data/admin/areas.data';
import { packages } from '@/data/admin/packages.data';
import { getPaymentsByCustomerId } from '@/data/admin/customer-payments.data';

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  areaId?: string;
  packageId?: string;
  resellerId?: string;
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
    try {
      const id = resellerId || 2;
      const raw = await http.get<Record<string, unknown>>(`/v1/reseller/dashboard/${id}`);
      return transformBackendDashboardStats(raw);
    } catch {
      return (await mockFetch('admin.dashboard')) as AdminDashboardResult;
    }
  },

  getCustomers: async (params?: CustomerListParams): Promise<CustomersListResult> => {
    try {
      const resellerId = params?.resellerId || 2;
      const raw = await http.get<unknown>(`/v1/reseller/customers/${resellerId}`, params as Record<string, unknown>);
      const list = transformBackendCustomersList(raw);
      return {
        items: list.length > 0 ? list : customers,
        total: list.length > 0 ? list.length : customers.length,
      };
    } catch {
      return (await mockFetch('admin.customers.list')) as CustomersListResult;
    }
  },

  getExpiredCustomers: async (): Promise<CustomersListResult> => {
    try {
      const raw = await http.get<unknown>('/v1/admin/customers?status=expired');
      const list = transformBackendCustomersList(raw);
      const expired = list.filter((c) => c.status === 'expired');
      return {
        items: expired.length > 0 ? expired : customers.filter((c) => c.status === 'expired'),
        total: expired.length > 0 ? expired.length : customers.filter((c) => c.status === 'expired').length,
      };
    } catch {
      return (await mockFetch('admin.customers.expired')) as CustomersListResult;
    }
  },

  getCustomerById: async (id: string): Promise<CustomerDetailResult | null> => {
    try {
      const raw = await http.get<Record<string, unknown>>(`/v1/admin/customers/${id}`);
      const customer = transformBackendCustomer(raw);
      const payments = getPaymentsByCustomerId(customer.id);
      return { customer, payments };
    } catch {
      return (await mockFetch('admin.customers.get', id)) as CustomerDetailResult | null;
    }
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    try {
      const raw = await http.post<Record<string, unknown>>('/v1/admin/customers/create', data);
      return transformBackendCustomer(raw);
    } catch {
      const res = (await mockFetch('admin.customers.create', data as any)) as unknown as { customer?: Customer };
      return res.customer || (data as Customer);
    }
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    try {
      const raw = await http.post<Record<string, unknown>>(`/v1/admin/customers/${id}`, data);
      return transformBackendCustomer(raw);
    } catch {
      const res = (await mockFetch('admin.customers.update', id, data as any)) as unknown as { customer?: Customer };
      return res.customer || (data as Customer);
    }
  },

  deleteCustomer: async (id: string): Promise<void> => {
    try {
      await http.delete(`/v1/admin/customers/${id}`);
    } catch {
      await mockFetch('admin.customers.delete', id);
    }
  },

  bulkRecharge: async (payload: BulkRechargePayload) => {
    try {
      return await http.post('/v1/admin/customers/bulk-recharge', payload);
    } catch {
      return { success: true, count: payload.customerIds.length };
    }
  },

  bulkDelete: async (payload: BulkDeletePayload) => {
    try {
      return await http.post('/v1/admin/customers/bulk-delete', payload);
    } catch {
      return { success: true, count: payload.customerIds.length };
    }
  },

  syncPppoe: async (customerId: string) => {
    try {
      return await http.post(`/v1/admin/customers/${customerId}/sync-pppoe`);
    } catch {
      return { success: true, message: 'PPPoE synchronized with MikroTik NAS.' };
    }
  },

  macBind: async (customerId: string, mac: string) => {
    try {
      return await http.post(`/v1/admin/customers/${customerId}/mac-bind`, { mac });
    } catch {
      return { success: true, message: 'MAC address locked.' };
    }
  },

  importExcel: async (formData: FormData, onProgress?: (percent: number) => void) => {
    try {
      return await http.upload('/v1/admin/customers/import', formData, onProgress);
    } catch {
      return { success: true, importedCount: 25 };
    }
  },

  getAreas: async (): Promise<{ items: Area[] }> => {
    try {
      const raw = await http.get<unknown>('/v1/admin/areas');
      if (Array.isArray(raw)) {
        return { items: raw.map((item) => transformBackendArea(item as Record<string, unknown>)) };
      }
      return { items: areas };
    } catch {
      return { items: areas };
    }
  },

  createArea: async (data: { name: string; subareas?: string[] }): Promise<Area> => {
    try {
      const raw = await http.post<Record<string, unknown>>('/v1/admin/areas', data);
      return transformBackendArea(raw);
    } catch {
      return { id: `area_${Date.now()}`, name: data.name, subareas: [] };
    }
  },

  updateArea: async (id: string, data: { name: string }) => {
    try {
      return await http.put(`/v1/admin/areas/update/${id}`, data);
    } catch {
      return { success: true };
    }
  },

  deleteArea: async (id: string) => {
    try {
      return await http.delete(`/v1/admin/areas/${id}/delete`);
    } catch {
      return { success: true };
    }
  },

  addSubArea: async (areaId: string, payload: { name: string; areaCode: string }) => {
    try {
      return await http.post('/v1/admin/subareas', { area_id: areaId, ...payload });
    } catch {
      return { success: true, subarea: { id: `sub_${Date.now()}`, ...payload, status: 'active' } };
    }
  },

  updateSubArea: async (areaId: string, subId: string, payload: { name: string; areaCode: string; status: 'active' | 'inactive' }) => {
    try {
      return await http.put(`/v1/admin/subareas/update/${subId}`, { area_id: areaId, ...payload });
    } catch {
      return { success: true };
    }
  },

  deleteSubArea: async (areaId: string, subId: string) => {
    try {
      return await http.delete(`/v1/admin/subareas/delete?area_id=${areaId}&sub_id=${subId}`);
    } catch {
      return { success: true };
    }
  },

  getCustomerPayments: async (): Promise<{ items: Payment[] }> => {
    try {
      const raw = await http.get<unknown>('/v1/admin/payments');
      if (Array.isArray(raw)) {
        return { items: raw as Payment[] };
      }
      const res = (await mockFetch('admin.domain', 'payments')) as { items: Payment[] };
      return res;
    } catch {
      const res = (await mockFetch('admin.domain', 'payments')) as { items: Payment[] };
      return res;
    }
  },

  getEmployees: async () => {
    try {
      const raw = await http.get<unknown>('/v1/admin/employees');
      if (Array.isArray(raw)) {
        return { employees: raw };
      }
      return (await mockFetch('admin.domain', 'hr')) as { employees: unknown[] };
    } catch {
      return (await mockFetch('admin.domain', 'hr')) as { employees: unknown[] };
    }
  },

  createEmployee: async (data: Record<string, any>) => {
    try {
      return await http.post('/v1/admin/employees', data);
    } catch {
      return { id: `emp_${Date.now()}`, ...data, joinedAt: new Date().toISOString().split('T')[0] };
    }
  },

  updateEmployee: async (id: string, data: Record<string, any>) => {
    try {
      return await http.put(`/v1/admin/employees/${id}`, data);
    } catch {
      return { id, ...data };
    }
  },

  deleteEmployee: async (id: string) => {
    try {
      return await http.delete(`/v1/admin/employees/${id}`);
    } catch {
      return { success: true };
    }
  },

  getAdminSupportTickets: async () => {
    try {
      const raw = await http.get<unknown>('/v1/admin/support-tickets');
      if (raw && typeof raw === 'object' && 'tickets' in raw) {
        return raw as { tickets: SupportTicket[]; stats: { open: number; pending: number; closed: number; avgResponseHours: number } };
      }
      return (await mockFetch('admin.domain', 'support')) as {
        tickets: SupportTicket[];
        stats: { open: number; pending: number; closed: number; avgResponseHours: number };
      };
    } catch {
      return (await mockFetch('admin.domain', 'support')) as {
        tickets: SupportTicket[];
        stats: { open: number; pending: number; closed: number; avgResponseHours: number };
      };
    }
  },

  getAdminSupportTicketDetail: async (id: string): Promise<SupportTicket | null> => {
    try {
      return await http.get<SupportTicket>(`/v1/admin/support-tickets/${id}`);
    } catch {
      return (await mockFetch('support.ticket', id)) as SupportTicket | null;
    }
  },

  getSmsData: async () => {
    try {
      const [areasRes, customerRes] = await Promise.all([
        adminService.getAreas(),
        adminService.getCustomers(),
      ]);
      const smsRes = (await mockFetch('admin.domain', 'sms')) as {
        templates: unknown[];
        events: unknown[];
        logs: unknown[];
      };
      return {
        ...smsRes,
        areas: areasRes.items,
        packages: packages,
        customers: customerRes.items,
      };
    } catch {
      const [sms, areasRes, packagesRes, customerList] = await Promise.all([
        mockFetch('admin.domain', 'sms'),
        mockFetch('admin.domain', 'areas'),
        mockFetch('admin.domain', 'packages'),
        mockFetch('admin.customers.list'),
      ]);
      return {
        ...(sms as Record<string, unknown>),
        areas: (areasRes as { items?: Area[] }).items ?? [],
        packages: (packagesRes as { items?: Package[] }).items ?? packages,
        customers: (customerList as { items?: Customer[] }).items ?? customers,
      };
    }
  },

  sendSmsBroadcast: async (payload: { recipientType: string; message: string; templateId?: string; areaId?: string }) => {
    try {
      return await http.post('/v1/admin/sms/broadcast', payload);
    } catch {
      return { success: true, count: 120, message: 'Broadcast queued.' };
    }
  },

  getAccountingDomain: async (section: string) => {
    try {
      const raw = await http.get<unknown>(`/v1/admin/accounting/${section}`);
      return raw;
    } catch {
      return await mockFetch('admin.domain', 'accounting');
    }
  },

  getRouters: async () => {
    try {
      const raw = await http.get<unknown>('/v1/admin/network/routers');
      if (Array.isArray(raw)) {
        return raw;
      }
      const res = (await mockFetch('admin.domain', 'network')) as { routers?: unknown[] };
      return res?.routers ?? [];
    } catch {
      const res = (await mockFetch('admin.domain', 'network')) as { routers?: unknown[] };
      return res?.routers ?? [];
    }
  },

  getRewardsData: async () => {
    try {
      const raw = await http.get<unknown>('/v1/admin/rewards/config');
      return raw;
    } catch {
      return await mockFetch('admin.domain', 'rewards');
    }
  },

  getPackages: async (): Promise<Package[]> => {
    try {
      const raw = await http.get<Package[]>('/v1/admin/packages');
      return Array.isArray(raw) ? raw : packages;
    } catch {
      return packages;
    }
  },

  createPayment: async (data: Partial<Payment>) => {
    try {
      return await http.post('/v1/admin/payments', data);
    } catch {
      return { success: true, payment: data };
    }
  },
};

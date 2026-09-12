import { http } from '../client';
import { mockFetch } from '@/lib/mock-api/client';
import type { PlatformDashboardStats } from '@/lib/mock-api/handlers/platform.handler';
import type { TenantPortal } from '@/data/platform/tenants.data';
import type { PlatformSupportTicket } from '@/data/platform/contacts.data';

export interface TenantDetailResult {
  tenant: TenantPortal;
  tickets: PlatformSupportTicket[];
}

export const platformService = {
  getDashboard: async (): Promise<PlatformDashboardStats> => {
    try {
      const raw = await http.get<PlatformDashboardStats>('/v1/platform/dashboard');
      return raw;
    } catch {
      return (await mockFetch('platform.dashboard')) as PlatformDashboardStats;
    }
  },

  getTenants: async (params?: { q?: string; status?: string }) => {
    try {
      const raw = await http.get('/v1/platform/tenants', params);
      return raw;
    } catch {
      return await mockFetch('platform.tenants.list', params);
    }
  },

  getTenantById: async (id: string): Promise<TenantDetailResult | null> => {
    try {
      return await http.get<TenantDetailResult>(`/v1/platform/tenants/${id}`);
    } catch {
      return (await mockFetch('platform.tenants.get', id)) as TenantDetailResult | null;
    }
  },

  saveTenant: async (data: Partial<TenantPortal>) => {
    try {
      return await http.post('/v1/platform/tenants', data);
    } catch {
      return await mockFetch('platform.tenants.create', data as any);
    }
  },

  updateTenant: async (id: string, data: Partial<TenantPortal>) => {
    try {
      return await http.put(`/v1/platform/tenants/${id}`, data);
    } catch {
      return await mockFetch('platform.tenants.update', id, data as any);
    }
  },

  deleteTenant: async (id: string) => {
    try {
      return await http.delete(`/v1/platform/tenants/${id}`);
    } catch {
      return await mockFetch('platform.tenants.delete', id);
    }
  },

  getAdmins: async () => {
    try {
      return await http.get('/v1/platform/admins');
    } catch {
      return await mockFetch('platform.admins.list');
    }
  },

  getRevenue: async () => {
    try {
      return await http.get('/v1/platform/revenue');
    } catch {
      return await mockFetch('platform.revenue');
    }
  },

  getPlugins: async () => {
    try {
      return await http.get('/v1/platform/plugins');
    } catch {
      return await mockFetch('platform.plugins');
    }
  },

  getSupportTickets: async () => {
    try {
      return await http.get('/v1/platform/support-tickets');
    } catch {
      return await mockFetch('platform.support');
    }
  },
};

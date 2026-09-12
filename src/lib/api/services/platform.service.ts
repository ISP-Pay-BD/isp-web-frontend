import { http } from '../client';
import type { PlatformDashboardStats } from '@/lib/mock-api/handlers/platform.handler';
import type { TenantPortal } from '@/data/platform/tenants.data';
import type { PlatformSupportTicket } from '@/data/platform/contacts.data';

export interface TenantDetailResult {
  tenant: TenantPortal;
  tickets: PlatformSupportTicket[];
}

export const platformService = {
  getDashboard: async (): Promise<PlatformDashboardStats> => {
    const raw = await http.get<PlatformDashboardStats>('/v1/platform/stats');
    return raw;
  },

  getTenants: async (params?: { q?: string; status?: string }) => {
    return await http.get('/v1/platform/tenants', params as Record<string, unknown>);
  },

  getTenantById: async (id: string): Promise<TenantDetailResult | null> => {
    return await http.get<TenantDetailResult>(`/v1/platform/tenants/${id}`);
  },

  saveTenant: async (data: Partial<TenantPortal>) => {
    return await http.post('/v1/platform/tenants', data);
  },

  updateTenant: async (id: string, data: Partial<TenantPortal>) => {
    return await http.patch(`/v1/platform/tenants/${id}/status`, data);
  },

  deleteTenant: async (id: string) => {
    return await http.delete(`/v1/platform/tenants/${id}`);
  },

  getAdmins: async () => {
    return await http.get('/v1/platform/tenants');
  },

  getRevenue: async () => {
    return await http.get('/v1/platform/subscriptions');
  },

  getPlugins: async () => {
    return await http.get('/v1/engines/catalog');
  },

  getSupportTickets: async () => {
    return await http.get('/v1/platform/system-health');
  },
};

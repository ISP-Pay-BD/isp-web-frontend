import { http } from '../client';
import type { PlatformDashboardStats } from '@/lib/mock-api/handlers/platform.handler';
import type { TenantPortal } from '@/data/platform/tenants.data';
import type { PlatformSupportTicket, PlatformContact, PlatformSoftwareSettings } from '@/data/platform/contacts.data';
import type { MeteringRow, SlaRow, TenantHealthCard, BillingModeRow } from '@/data/platform/catalog.data';


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
    return await http.get<unknown>('/v1/platform/tenants', params as Record<string, unknown>);
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
    return await http.get<unknown>('/v1/platform/tenants');
  },

  getRevenue: async () => {
    return await http.get<unknown>('/v1/platform/subscriptions');
  },

  getPlugins: async () => {
    return await http.get<unknown>('/v1/engines/catalog');
  },

  getEnginesCatalog: async () => {
    return await http.get<unknown>('/v1/engines/catalog');
  },

  getEnginesInstances: async () => {
    return await http.get<unknown>('/v1/engines/instances');
  },

  deployEngine: async (payload: { engine_slug: string; tenant_id?: string }) => {
    return await http.post('/v1/engines/instances/deploy', payload);
  },

  engineAction: async (instanceId: string, action: string) => {
    return await http.post(`/v1/engines/instances/${instanceId}/action`, { action });
  },

  getSystemHealth: async () => {
    return await http.get<unknown>('/v1/platform/system-health');
  },

  getSupportTickets: async () => {
    return await http.get<unknown>('/v1/platform/system-health');
  },

  getContacts: async () => {
    return await http.get<unknown>('/v1/platform/contacts');
  },

  updateContactStatus: async (id: string, status: string) => {
    return await http.patch(`/v1/platform/contacts/${id}/status`, { status });
  },

  getSoftwareSettings: async (): Promise<PlatformSoftwareSettings | null> => {
    return await http.get<PlatformSoftwareSettings>('/v1/platform/settings');
  },

  updateSoftwareSettings: async (values: Partial<PlatformSoftwareSettings>) => {
    return await http.post('/v1/platform/settings', values);
  },

  getRedisLogs: async (level?: string) => {
    return await http.get<unknown>('/v1/platform/system-health', { log_type: 'redis', level });
  },

  getMetering: async () => {
    return await http.get<unknown>('/v1/platform/stats', { domain: 'metering' });
  },

  getSla: async () => {
    return await http.get<unknown>('/v1/platform/system-health', { domain: 'sla' });
  },

  getTenantHealth: async (tenantId: string) => {
    return await http.get<unknown>(`/v1/platform/tenants/${tenantId}/health`);
  },
};


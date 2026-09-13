import { http } from '../client';
import type { PlatformDashboardStats } from '@/lib/mock-api/handlers/platform.handler';
import type { TenantPortal } from '@/data/platform/tenants.data';
import type {
  PlatformSoftwareSettings,
  PlatformSupportTicket,
  PlatformContact,
  PlatformAdminUser,
  AdminPackageTier,
  ProductShowcaseItem,
  PlatformFileItem,
} from '@/data/platform/contacts.data';

/** Row shape of the plugin marketplace screen. */
export interface PlatformPluginItem {
  id: string;
  name: string;
  category: string;
  desc: string;
  image: string | null;
  installed: boolean;
  priceBdt: number;
  installs: number;
}

/** Revenue analytics payload. */
export interface PlatformRevenue {
  mrrBdt: number;
  arrBdt: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  growthPercentage: number;
  averageRevenuePerTenant: number;
  chartData: Array<{ month: string; revenue: number; tenants: number }>;
  methodBreakdown: Array<{ method: string; amountBdt: number; percentage: number }>;
  tierBreakdown: Array<{ plan: string; tenants: number; mrrBdt: number }>;
}

/** Sidebar pin row shape. */
export interface SidebarPin {
  id: string;
  label: string;
  href: string;
  icon: string;
  order: number;
}

/** Application log payload. */
export interface PlatformLogsPayload {
  logs: Array<{
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'debug';
    channel: 'redis' | 'auth' | 'billing' | 'mikrotik' | 'system';
    message: string;
    details?: string;
    ip?: string;
  }>;
  stats: {
    redisMemoryMb: number;
    redisKeysTotal: number;
    uptimeDays: number;
    activeSessions: number;
  };
}


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

  /**
   * `GET /api/v1/platform/tenants/{id}` returns the tenant record itself.
   * Normalised here so callers keep using `{ tenant, tickets }`.
   */
  getTenantById: async (id: string): Promise<TenantDetailResult | null> => {
    const raw = await http.get<Record<string, unknown> | null>(`/v1/platform/tenants/${id}`);
    if (!raw) {
      return null;
    }

    const nested = raw.tenant as Record<string, unknown> | undefined;

    return {
      tenant: (nested ?? raw) as unknown as TenantPortal,
      tickets: Array.isArray(raw.tickets) ? (raw.tickets as PlatformSupportTicket[]) : [],
    };
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
    return await http.get<{ items: PlatformAdminUser[]; total: number }>('/v1/platform/admins');
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
    return await http.get<unknown>('/v1/platform/support-tickets');
  },

  getSoftwareSettings: async (): Promise<PlatformSoftwareSettings | null> => {
    return await http.get<PlatformSoftwareSettings>('/v1/platform/settings');
  },

  updateSoftwareSettings: async (values: Partial<PlatformSoftwareSettings>) => {
    return await http.post('/v1/platform/settings', values);
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

  /** Package tiers sold to tenants. */
  getAdminPackages: async () => {
    return await http.get<{
      items: AdminPackageTier[];
      total: number;
      yearlyDiscountMonths: number;
      yearlyDiscountPercent: number;
    }>('/v1/platform/admin-packages');
  },

  /** Plugin marketplace catalogue. */
  getPluginsCatalog: async () => {
    return await http.get<{ items: PlatformPluginItem[]; total: number }>('/v1/platform/plugins');
  },

  /** Product showcase entries. */
  getShowcase: async () => {
    return await http.get<{ items: ProductShowcaseItem[]; total: number }>('/v1/platform/showcase');
  },

  /** Inbound sales leads. */
  getLeads: async () => {
    return await http.get<{ items: PlatformContact[]; total: number }>('/v1/platform/contacts');
  },

  updateLeadStatus: async (id: string, status: PlatformContact['status']) => {
    return await http.patch(`/v1/platform/contacts/${id}/status`, { status });
  },

  /** Platform revenue analytics. */
  getPlatformRevenue: async () => {
    return await http.get<PlatformRevenue>('/v1/platform/revenue');
  },

  /** Per-user sidebar pins. */
  getSidebarPins: async () => {
    return await http.get<{ items: SidebarPin[] }>('/v1/platform/sidebar-pins');
  },

  /**
   * Read-only listing of the backend upload directory. There is no upload or
   * delete endpoint by design.
   */
  getFileManager: async (path = '') => {
    return await http.get<{
      root: string;
      currentPath: string;
      items: PlatformFileItem[];
      total: number;
    }>('/v1/platform/file-manager', { path: path || undefined });
  },

  /**
   * Application logs read from the backend's own log files, plus live Redis
   * stats when the cache handler is Redis (zeros otherwise).
   */
  getPlatformLogs: async (level?: string) => {
    return await http.get<PlatformLogsPayload>('/v1/platform/redis-logs', {
      level: level && level !== 'all' ? level : undefined,
    });
  },
};


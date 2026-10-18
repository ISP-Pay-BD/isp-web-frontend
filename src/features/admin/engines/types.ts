/** Engines catalog + per-tenant instances (`/v1/engines/*`). */

export type EnginePortal = 'admin' | 'platform';

export type EngineInstanceStatus = 'enabled' | 'disabled';

export type EngineAction = 'enable' | 'disable' | 'configure';

export interface EngineInstance {
  id: string;
  /** Tenant = ISP admin user id */
  tenantId: string;
  tenantName: string;
  pluginId: string;
  engineKey: string;
  name: string;
  status: EngineInstanceStatus;
  config: Record<string, unknown>;
  enabledAt: string | null;
  disabledAt: string | null;
  updatedAt: string | null;
}

export interface EngineCatalogItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string | null;
  priceBdt: number;
  priceType: string | null;
  billingCycle: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  /** Enabled installs across tenants — super_admin only, else null */
  installs: number | null;
  /** Caller tenant's instance — null for super_admin or when never deployed */
  instance: EngineInstance | null;
  /** Detail endpoint, super_admin only */
  instancesSummary: { enabled: number; disabled: number } | null;
}

export interface EngineCatalogParams {
  search?: string;
  category?: string;
  page?: number;
  perPage?: number;
}

export interface EngineCatalogResult {
  items: EngineCatalogItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  categories: string[];
  scope: 'tenant' | 'platform';
}

export interface EngineInstancesParams {
  engineKey?: string;
  status?: EngineInstanceStatus;
  search?: string;
  page: number;
  perPage: number;
}

export interface EngineInstancesResult {
  items: EngineInstance[];
  total: number;
}

export interface DeployEnginePayload {
  pluginId: string;
  /** Required for super_admin: the ISP admin user id */
  tenantId?: string;
  config?: Record<string, unknown>;
}

export interface EngineActionPayload {
  id: string;
  action: EngineAction;
  config?: Record<string, unknown>;
}

/** Tenant admin picker row (`GET /v1/platform/admins`). */
export interface TenantAdminOption {
  id: string;
  name: string;
  email: string;
  organizationName: string;
}

import type { PermissionMap } from '@/types/auth';

export type { PermissionMap };

/** One menu of the access matrix (backend catalogue = web default-access-fields.php). */
export interface PermissionSectionDef {
  key: string;
  label: string;
  actions: Record<string, string>;
}

export interface RoleSummary {
  role: AccessRole;
  label: string;
  users: number;
  totalActions: number;
}

export type AccessRole = 'admin' | 'resellerAdmin' | 'employee' | 'user';

export interface RolePermissions {
  role: AccessRole;
  permissions: PermissionMap;
  exists: boolean;
  editable: boolean;
  source: 'platform' | 'tenant';
  /** Id of the tenant default row (`/v1/access/defaults/{id}`) when `source` is `tenant`. */
  defaultId?: string;
}

export interface CustomAccessRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  status: 'active' | 'inactive';
  permissions: PermissionMap;
  updatedAt: string;
}

export interface AccessCandidate {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: string;
}

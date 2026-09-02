export type UserRole = 'super_admin' | 'admin' | 'resellerAdmin' | 'employee' | 'user';

export type UserStatus = 'active' | 'inactive';

export type PermissionAction = string;

export type PermissionMap = Record<string, PermissionAction[]>;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  tenantId: string;
  organizationName?: string;
  permissions: PermissionMap;
}

export interface AuthSession {
  user: User;
  token: string;
}

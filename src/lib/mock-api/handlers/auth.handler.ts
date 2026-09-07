import type { AuthSession, User } from '@/types/auth';
import {
  demoUsers,
  demoUserCredentials,
  PERMISSION_SECTIONS,
  customUserAccessList,
  fullAdminPermissions,
  resellerPermissions,
  employeePermissions,
  customerPermissions,
  type PermissionSectionDef,
  type CustomUserAccessRecord,
} from '@/data/users';
import { mockDelay } from '../delay';
import { MockApiError } from '../errors';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface UpdatePermissionsPayload {
  role: string;
  permissions: Record<string, string[]>;
}

// In-memory permission state for runtime updates in mock session
const rolePermissionsState: Record<string, Record<string, string[]>> = {
  super_admin: { ...fullAdminPermissions },
  admin: { ...fullAdminPermissions },
  resellerAdmin: { ...resellerPermissions },
  employee: { ...employeePermissions },
  user: { ...customerPermissions },
};

const customAccessState: CustomUserAccessRecord[] = [...customUserAccessList];

export async function mockLogin(payload: LoginPayload): Promise<AuthSession> {
  await mockDelay(150);

  const normalizedEmail = payload.email.trim().toLowerCase();
  const user = demoUsers.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === payload.password,
  );

  if (!user) {
    throw new MockApiError('Invalid email or password', 'AUTH_INVALID');
  }

  // Use dynamic role permissions if updated in session
  const currentPermissions = rolePermissionsState[user.role] ?? user.permissions;

  const safeUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    tenantId: user.tenantId,
    organizationName: user.organizationName,
    permissions: currentPermissions,
  };

  return {
    user: safeUser,
    token: `mock-token-${safeUser.id}`,
  };
}

export async function mockGetCurrentUser(userId: string): Promise<User | null> {
  await mockDelay(100);

  const user = demoUsers.find((entry) => entry.id === userId);
  if (!user) return null;

  const currentPermissions = rolePermissionsState[user.role] ?? user.permissions;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    tenantId: user.tenantId,
    organizationName: user.organizationName,
    permissions: currentPermissions,
  };
}

export async function mockForgotPassword(payload: ForgotPasswordPayload): Promise<{ success: boolean; message: string }> {
  await mockDelay(200);

  const email = payload.email.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw new MockApiError('Please enter a valid email address', 'AUTH_INVALID_EMAIL');
  }

  return {
    success: true,
    message: 'If an account exists for that address, a secure reset link has been dispatched.',
  };
}

export async function mockGetRolePermissions(role: string): Promise<{ role: string; permissions: Record<string, string[]> }> {
  await mockDelay(100);
  return {
    role,
    permissions: rolePermissionsState[role] ?? {},
  };
}

export async function mockUpdateRolePermissions(payload: UpdatePermissionsPayload): Promise<{ success: boolean; role: string; permissions: Record<string, string[]> }> {
  await mockDelay(200);
  rolePermissionsState[payload.role] = { ...payload.permissions };
  return {
    success: true,
    role: payload.role,
    permissions: rolePermissionsState[payload.role]!,
  };
}

export async function mockGetPermissionSections(): Promise<PermissionSectionDef[]> {
  await mockDelay(50);
  return PERMISSION_SECTIONS;
}

export async function mockListCustomAccess(): Promise<CustomUserAccessRecord[]> {
  await mockDelay(100);
  return customAccessState;
}

export async function mockListDemoCredentials() {
  await mockDelay(50);
  return demoUserCredentials;
}

import type { UserRole, UserStatus } from '@/types/auth';

export const ROLE_HOME: Record<UserRole, string> = {
  user: '/customer/dashboard',
  admin: '/admin/dashboard',
  resellerAdmin: '/admin/dashboard',
  employee: '/employee/salaries',
  super_admin: '/platform/dashboard',
};

export const ROLE_PREFIX: Record<UserRole, string> = {
  user: '/customer',
  admin: '/admin',
  resellerAdmin: '/admin',
  employee: '/employee',
  super_admin: '/platform',
};

/** Paths allowed when subscription is expired (inactive) */
export const EXPIRED_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  admin: ['/admin/packages', '/admin/subscription', '/admin/payment'],
  resellerAdmin: ['/admin/subscription', '/admin/payment'],
  user: ['/customer/packages', '/customer/subscription', '/customer/payments'],
  employee: ['/employee/salaries', '/employee/advance-salary', '/employee/profile'],
  super_admin: ['/platform'],
};

export function getRoleForPath(pathname: string): UserRole | null {
  if (pathname.startsWith('/platform')) return 'super_admin';
  if (pathname.startsWith('/admin')) return null; // admin vs reseller resolved from cookie
  if (pathname.startsWith('/customer')) return 'user';
  if (pathname.startsWith('/employee')) return 'employee';
  return null;
}

export function isRoleAllowedForPrefix(role: UserRole, pathname: string): boolean {
  const prefix = ROLE_PREFIX[role];
  return pathname.startsWith(prefix);
}

export function isExpiredPathAllowed(role: UserRole, pathname: string): boolean {
  const allowed = EXPIRED_ALLOWED_PREFIXES[role] ?? [];
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

export function getExpiredRedirect(role: UserRole): string {
  switch (role) {
    case 'admin':
    case 'resellerAdmin':
      return '/admin/subscription';
    case 'user':
      return '/customer/subscription';
    default:
      return ROLE_HOME[role];
  }
}

export function canAccessPath(
  role: UserRole,
  status: UserStatus,
  pathname: string,
): { allowed: boolean; reason?: 'unauthenticated' | 'wrong_role' | 'expired' } {
  if (!isRoleAllowedForPrefix(role, pathname)) {
    return { allowed: false, reason: 'wrong_role' };
  }

  if (status === 'inactive' && !isExpiredPathAllowed(role, pathname)) {
    return { allowed: false, reason: 'expired' };
  }

  return { allowed: true };
}

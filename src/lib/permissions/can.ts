import type { PermissionMap, UserRole } from '@/types/auth';

export function can(
  permissions: PermissionMap,
  menu: string,
  action?: string,
  role?: UserRole,
): boolean {
  if (role === 'super_admin') return true;

  const actions = permissions[menu];
  if (!actions?.length) return false;
  if (!action) return true;

  return actions.includes(action);
}

export function hasAnyPermission(
  permissions: PermissionMap,
  menus: string[],
  role?: UserRole,
): boolean {
  if (role === 'super_admin') return true;
  return menus.some((menu) => can(permissions, menu));
}

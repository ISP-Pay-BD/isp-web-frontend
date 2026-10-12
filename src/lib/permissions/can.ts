import type { PermissionMap, UserRole } from '@/types/auth';
import { KNOWN_PERMISSION_MENUS } from '@/lib/api/adapters/auth.adapter';

/**
 * super_admin and the tenant admin pass every check. A POP (resellerAdmin) and an employee are judged by
 * their permission rows — the same rows the API's gate reads — except for menus `/auth/me` cannot express,
 * which only the API decides.
 */
function bypasses(role: UserRole | undefined, menu: string): boolean {
  if (role === 'super_admin' || role === 'admin') return true;
  return role === 'resellerAdmin' && !KNOWN_PERMISSION_MENUS.has(menu);
}

export function can(
  permissions: PermissionMap,
  menu: string,
  action?: string,
  role?: UserRole,
): boolean {
  if (bypasses(role, menu)) return true;

  const actions = permissions?.[menu];
  if (!actions?.length) return false;
  if (!action) return true;

  return actions.includes(action);
}

export function hasAnyPermission(
  permissions: PermissionMap,
  menus: string[],
  role?: UserRole,
): boolean {
  if (role === 'super_admin' || role === 'admin') return true;
  return menus.some((menu) => can(permissions, menu, undefined, role));
}

/** Whether a UI entry (nav item, quick action) is shown: its `roles` for everyone, then its permission. */
export function canSee(
  entry: { roles?: UserRole[]; permission?: { menu: string; action?: string } },
  permissions: PermissionMap,
  role: UserRole,
): boolean {
  if (entry.roles && !entry.roles.includes(role)) return false;
  if (!entry.permission) return true;
  return can(permissions, entry.permission.menu, entry.permission.action ?? 'read', role);
}

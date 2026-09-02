'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { can } from '@/lib/permissions/can';
import { getNavigationForRole, type NavItem } from '@/config/navigation';

function filterByPermission(items: NavItem[], permissions: NavItem extends never ? never : import('@/types/auth').PermissionMap, role: import('@/types/auth').UserRole): NavItem[] {
  return items
    .filter((item) => {
      if (!item.permission) return true;
      return can(permissions, item.permission.menu, item.permission.action ?? 'read', role);
    })
    .map((item) => ({
      ...item,
      children: item.children
        ? filterByPermission(item.children, permissions, role)
        : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0 || item.href);
}

export function useFilteredNav(): NavItem[] {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    if (!user) return [];
    const isExpired = user.status === 'inactive';
    const base = getNavigationForRole(user.role, isExpired);
    return filterByPermission(base, user.permissions, user.role);
  }, [user]);
}

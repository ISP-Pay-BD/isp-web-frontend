'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { canSee } from '@/lib/permissions/can';
import { getNavigationForRole, type NavItem } from '@/config/navigation';
import { useEngineCatalog } from '@/features/admin/engines/hooks/use-engines';

/** Nav groups whose children are the live engine catalog (after their "All Engines" link). */
const ENGINE_GROUPS: Record<string, string> = { engines: '/admin/engines', 'platform-engines': '/platform/engines' };
const ENGINE_ROLES = new Set(['admin', 'resellerAdmin', 'super_admin']);

function filterByPermission(items: NavItem[], permissions: import('@/types/auth').PermissionMap, role: import('@/types/auth').UserRole): NavItem[] {
  return items
    .filter((item) => canSee(item, permissions, role))
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
  const engines = useEngineCatalog({ perPage: 50 }, { enabled: !!user && ENGINE_ROLES.has(user.role) });
  const engineItems = engines.data?.items;

  return useMemo(() => {
    if (!user) return [];
    const isExpired = user.status === 'inactive';
    const base = getNavigationForRole(user.role, isExpired);
    return filterByPermission(base, user.permissions, user.role).map((item) => {
      const basePath = ENGINE_GROUPS[item.id];
      if (!basePath || !engineItems) return item;
      return {
        ...item,
        children: [
          ...(item.children ?? []),
          ...engineItems.map((e) => ({ id: `engine-${e.slug}`, label: e.name, href: `${basePath}/${encodeURIComponent(e.slug)}` })),
        ],
      };
    });
  }, [user, engineItems]);
}

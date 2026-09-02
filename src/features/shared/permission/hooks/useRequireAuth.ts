'use client';

import { useAuthStore } from '@/stores/auth-store';
import { can } from '@/lib/permissions/can';

export function useRequireAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return { user, isAuthenticated, isReady: true };
}

export function useRequirePermission(menu: string, action = 'read') {
  const user = useAuthStore((s) => s.user);
  const allowed = user ? can(user.permissions, menu, action, user.role) : false;
  return { allowed, user };
}

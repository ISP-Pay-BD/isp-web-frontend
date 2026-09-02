'use client';

import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { can } from '@/lib/permissions/can';

interface CanProps {
  menu: string;
  action?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ menu, action, fallback = null, children }: CanProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) return fallback;

  const allowed = can(user.permissions, menu, action, user.role);
  return allowed ? children : fallback;
}

'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { can } from '@/lib/permissions/can';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

interface PermissionGuardProps {
  menu: string;
  action?: string;
  children: ReactNode;
}

export function PermissionGuard({ menu, action = 'read', children }: PermissionGuardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const allowed = can(user.permissions, menu, action, user.role);
    if (!allowed) {
      router.replace('/403');
    }
  }, [isAuthenticated, user, menu, action, router]);

  if (!user) return <PageSkeleton rows={4} />;

  const allowed = can(user.permissions, menu, action, user.role);
  if (!allowed) return <PageSkeleton rows={4} />;

  return <>{children}</>;
}

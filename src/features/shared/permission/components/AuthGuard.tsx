'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/types/auth';
import { canAccessPath } from '@/lib/auth/route-access';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

interface AuthGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace('/403');
      return;
    }

    const access = canAccessPath(user.role, user.status, pathname);
    if (!access.allowed && access.reason === 'expired') {
      const target =
        user.role === 'user' ? '/customer/subscription?expired=1' : '/admin/subscription?expired=1';
      router.replace(target);
    }
  }, [ready, isAuthenticated, user, allowedRoles, pathname, router]);

  if (!ready || !isAuthenticated || !user) {
    return <PageSkeleton rows={6} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <PageSkeleton rows={6} />;
  }

  return <>{children}</>;
}

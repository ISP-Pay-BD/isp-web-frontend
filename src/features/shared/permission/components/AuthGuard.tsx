'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/types/auth';
import { canAccessPath } from '@/lib/auth/route-access';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { useAuthHydrated } from '@/hooks/use-auth-hydrated';

interface AuthGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!hydrated) return;

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
  }, [hydrated, isAuthenticated, user, allowedRoles, pathname, router]);

  if (!hydrated || !isAuthenticated || !user) {
    return <PageSkeleton variant="dashboard" rows={6} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <PageSkeleton variant="dashboard" rows={6} />;
  }

  return <>{children}</>;
}

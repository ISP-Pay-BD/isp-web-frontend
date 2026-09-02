'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginPage } from '@/features/auth/login';
import { useAuthStore, getRoleHomePath } from '@/stores/auth-store';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

function LoginRouteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirect = searchParams.get('redirect');
      const home = getRoleHomePath(user.role);
      router.replace(redirect && redirect.startsWith('/') ? redirect : home);
    }
  }, [isAuthenticated, user, searchParams, router]);

  if (isAuthenticated && user) {
    return <PageSkeleton rows={4} />;
  }

  return <LoginPage />;
}

export default function LoginRoutePage() {
  return (
    <Suspense fallback={<PageSkeleton rows={4} />}>
      <LoginRouteInner />
    </Suspense>
  );
}

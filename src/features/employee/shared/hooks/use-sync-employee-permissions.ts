'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/api/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Re-reads the signed-in employee's permissions from `GET /v1/auth/me` (`permissions` + `permission_codes`,
 * lane W2-R13) once per portal visit, so a grant or revoke by the manager reaches the nav without a re-login.
 * Only `user.permissions` is replaced; a failed call keeps the login-time permissions.
 */
export function useSyncEmployeePermissions() {
  const user = useAuthStore((s) => s.user);
  const isEmployee = user?.role === 'employee';
  const { data } = useQuery({
    queryKey: ['employee', 'auth-me', user?.id],
    queryFn: () => authService.me(),
    enabled: isEmployee,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!data || data.role !== 'employee') return;
    const current = useAuthStore.getState().user;
    if (!current || current.id !== data.id) return;
    if (JSON.stringify(current.permissions) === JSON.stringify(data.permissions)) return;
    useAuthStore.setState({ user: { ...current, permissions: data.permissions } });
  }, [data]);
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { useAuthStore } from '@/stores/auth-store';

export function useAdminDashboard(resellerId?: string | number) {
  const authUser = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const effectiveId = resellerId || authUser?.id || authUser?.tenantId || (hasHydrated ? '369' : undefined);

  return useQuery({
    queryKey: ['admin', 'dashboard', effectiveId],
    queryFn: () => adminService.getDashboardStats(effectiveId),
    enabled: effectiveId !== undefined,
    retry: 2,
    staleTime: 30000,
  });
}

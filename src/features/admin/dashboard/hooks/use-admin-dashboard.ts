'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { useAuthStore } from '@/stores/auth-store';

export function useAdminDashboard(resellerId?: string | number) {
  const authUser = useAuthStore((s) => s.user);
  const effectiveId = resellerId || authUser?.id || authUser?.tenantId || '369';

  return useQuery({
    queryKey: ['admin', 'dashboard', effectiveId],
    queryFn: () => adminService.getDashboardStats(effectiveId),
  });
}


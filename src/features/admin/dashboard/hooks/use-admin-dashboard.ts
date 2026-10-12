'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { useAuthStore } from '@/stores/auth-store';
import { getResellerId } from '@/lib/api/auth-utils';

export function useAdminDashboard(resellerId?: string | number) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ['admin', 'dashboard', resellerId ?? userId],
    queryFn: () => adminService.getDashboardStats(resellerId ?? getResellerId()),
    enabled: hasHydrated && Boolean(resellerId ?? userId),
    staleTime: 30000,
  });
}

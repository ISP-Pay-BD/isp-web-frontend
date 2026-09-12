'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';

export function useAdminDashboard(resellerId?: string | number) {
  return useQuery({
    queryKey: ['admin', 'dashboard', resellerId],
    queryFn: () => adminService.getDashboardStats(resellerId),
  });
}

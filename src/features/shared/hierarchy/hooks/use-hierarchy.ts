'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { mockFetch } from '@/lib/mock-api/client';
import type { HierarchyScope, HierarchyTreeResponse } from '../types';

export function useHierarchyTree(scope: HierarchyScope, resellerId?: string) {
  return useQuery({
    queryKey: ['hierarchy', scope, resellerId ?? 'default'],
    queryFn: () => adminService.getHierarchyTree(scope, resellerId),
  });
}

export function useResellerSubscribers(
  resellerId: string | null | undefined,
  params?: { page?: number; limit?: number; search?: string; status?: string },
) {
  return useQuery({
    queryKey: ['hierarchy', 'reseller-subscribers', resellerId, params],
    queryFn: () => adminService.getResellerSubscribers(resellerId!, params),
    enabled: Boolean(resellerId),
  });
}



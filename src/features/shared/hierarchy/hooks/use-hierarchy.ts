'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { HierarchyScope, HierarchyTreeResponse } from '../types';

export function useHierarchyTree(scope: HierarchyScope, resellerId?: string) {
  return useQuery({
    queryKey: ['hierarchy', scope, resellerId ?? 'default'],
    queryFn: () =>
      mockFetch('hierarchy.tree', scope, resellerId) as Promise<HierarchyTreeResponse>,
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { AdminNewsItem } from '@/data/admin/extras.data';

export function useAdminNews() {
  return useQuery({
    queryKey: ['admin', 'domain', 'news'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'news');
      return res as { items: AdminNewsItem[] };
    },
  });
}

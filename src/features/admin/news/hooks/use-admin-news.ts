'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import type { AdminNewsItem } from '@/data/admin/extras.data';

export function useAdminNews() {
  return useQuery({
    queryKey: ['admin', 'domain', 'news'],
    queryFn: async () => {
      try {
        const res = await http.get<unknown>('/api/common/news');
        if (Array.isArray(res)) return { items: res as AdminNewsItem[] };
        if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as { data: unknown[] }).data)) {
          return { items: (res as { data: AdminNewsItem[] }).data };
        }
        return { items: [] };
      } catch {
        return { items: [] };
      }
    },
  });
}


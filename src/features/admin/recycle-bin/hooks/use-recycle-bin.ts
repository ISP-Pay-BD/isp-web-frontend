'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { RecycleBinItem } from '@/data/admin/recycle-bin.data';

export function useRecycleBin() {
  return useQuery({
    queryKey: ['admin', 'domain', 'recycleBin'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'recycleBin');
      return res as { items: RecycleBinItem[] };
    },
  });
}

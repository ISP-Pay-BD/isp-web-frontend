'use client';

import { useQuery } from '@tanstack/react-query';
import type { RecycleBinItem } from '@/data/admin/recycle-bin.data';

export function useRecycleBin() {
  return useQuery({
    queryKey: ['admin', 'domain', 'recycleBin'],
    queryFn: async () => {
      return { items: [] as RecycleBinItem[] };
    },
  });
}


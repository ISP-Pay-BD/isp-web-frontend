'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

export function useIspOps() {
  return useQuery({
    queryKey: ['admin', 'domain', 'ispOps'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'ispOps');
      return res as IspOpsData;
    },
  });
}

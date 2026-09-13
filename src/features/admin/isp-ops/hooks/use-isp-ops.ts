'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { getAuthUserId } from '@/lib/api/auth-utils';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

export function useIspOps() {
  return useQuery({
    queryKey: ['admin', 'domain', 'ispOps'],
    queryFn: async () => {
      const resellerId = getAuthUserId();
      const res = await http.get<unknown>(`/v1/reseller/dashboard/${resellerId}`);
      if (res && typeof res === 'object') {
        return res as IspOpsData;
      }
      return {} as IspOpsData;
    },
  });
}

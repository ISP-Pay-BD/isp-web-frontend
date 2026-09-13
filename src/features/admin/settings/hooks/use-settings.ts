'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { getAuthUserId } from '@/lib/api/auth-utils';
import type { SoftwareSettingsData } from '@/data/admin/settings.data';

export function useSoftwareSettings() {
  return useQuery({
    queryKey: ['admin', 'domain', 'settings'],
    queryFn: async () => {
      const resellerId = getAuthUserId();
      const res = await http.get<unknown>(`/v1/reseller/settings/${resellerId}`);
      if (res && typeof res === 'object') {
        return res as SoftwareSettingsData;
      }
      return {} as SoftwareSettingsData;
    },
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { SoftwareSettingsData } from '@/data/admin/settings.data';

export function useSoftwareSettings() {
  return useQuery({
    queryKey: ['admin', 'domain', 'settings'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'settings');
      return res as SoftwareSettingsData;
    },
  });
}

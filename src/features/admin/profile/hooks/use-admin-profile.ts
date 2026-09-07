'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { AdminProfileData } from '@/data/admin/profile.data';

export type AdminProfile = AdminProfileData;

export function useAdminProfile() {
  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'profile');
      return data as AdminProfileData;
    },
  });
}

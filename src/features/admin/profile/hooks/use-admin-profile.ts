'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/api/services/auth.service';
import type { AdminProfileData } from '@/data/admin/profile.data';

export type AdminProfile = AdminProfileData;

export function useAdminProfile() {
  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: async () => {
      try {
        const user = await authService.me();
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          phone: (user as any).phone || '01700000000',
          role: user.role,
          companyName: (user as any).company || 'ISP Pay BD Network',
          address: 'Dhaka, Bangladesh',
          avatarUrl: (user as any).avatar,
        } as unknown as AdminProfileData;

      } catch {

        return {
          id: '1',
          name: 'Admin User',
          email: 'admin@isppaybd.com',
          phone: '01700000000',
          role: 'admin',
          companyName: 'ISP Pay BD Network',
          address: 'Dhaka, Bangladesh',
        } as unknown as AdminProfileData;
      }
    },
  });
}


'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { getAuthUserId } from '@/lib/api/auth-utils';
import { mockFetch } from '@/lib/mock-api/client';
import type { ThemePreset } from '@/data/admin/theme-studio.data';

export function useThemeStudio() {
  return useQuery({
    queryKey: ['admin', 'theme-studio'],
    queryFn: async () => {
      try {
        const resellerId = getAuthUserId();
        const profile = await http.get<unknown>(`/v1/reseller/profile/${resellerId}`);
        const data = (await mockFetch('admin.domain', 'themeStudio')) as { presets: ThemePreset[] };
        return data;
      } catch {
        const data = (await mockFetch('admin.domain', 'themeStudio')) as { presets: ThemePreset[] };
        return data;
      }
    },
  });
}


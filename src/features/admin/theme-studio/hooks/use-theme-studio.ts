'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { getAuthUserId } from '@/lib/api/auth-utils';
import type { ThemePreset } from '@/data/admin/theme-studio.data';

export function useThemeStudio() {
  return useQuery({
    queryKey: ['admin', 'theme-studio'],
    queryFn: async () => {
      const resellerId = getAuthUserId();
      const profile = await http.get<unknown>(`/v1/reseller/profile/${resellerId}`);
      const settings = (profile as Record<string, unknown>)?.theme as Record<string, unknown> | undefined;
      const presets: ThemePreset[] = settings?.presets
        ? (settings.presets as ThemePreset[])
        : [
            {
              id: 'default',
              name: 'Default ISP Theme',
              primary: '#f75803',
              sidebar: '#1a0b38',
              accent: '#f75803',
              description: 'Default ISP Pay BD theme',
              radius: 12,
            },
          ];
      return { presets };
    },
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { ThemePreset } from '@/data/admin/theme-studio.data';

export function useThemeStudio() {
  return useQuery({
    queryKey: ['admin', 'theme-studio'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'themeStudio');
      return data as { presets: ThemePreset[] };
    },
  });
}

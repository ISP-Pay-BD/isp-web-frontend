'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { camelizeKeys, snakeizeKeys } from '@/lib/api/case';

export interface TenantTheme {
  presetId: string | null;
  primary: string;
  secondary: string;
  radius: number;
  density: 'comfortable' | 'compact';
  fontScale: 'sm' | 'md' | 'lg';
  reduceMotion: boolean;
}

const THEME_KEY = ['admin', 'theme'] as const;

/** GET /v1/reseller/theme — the tenant's saved theme, null until first saved. */
export function useTenantTheme(enabled = true) {
  return useQuery({
    queryKey: THEME_KEY,
    queryFn: async () => camelizeKeys<{ theme: TenantTheme | null }>(await http.get<unknown>('/v1/reseller/theme')).theme,
    enabled,
    staleTime: 5 * 60_000,
  });
}

/** PUT /v1/reseller/theme */
export function useSaveTenantTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (theme: TenantTheme) =>
      camelizeKeys<{ theme: TenantTheme }>(
        await http.put<unknown>('/v1/reseller/theme', snakeizeKeys(theme as unknown as Record<string, unknown>)),
      ).theme,
    onSuccess: (theme) => {
      qc.setQueryData(THEME_KEY, theme);
      applyTenantTheme(theme);
    },
  });
}

const FONT_SIZES: Record<TenantTheme['fontScale'], string> = { sm: '15px', md: '', lg: '17px' };

/** Near-white app token (see --primary-foreground in globals.css) — always used for text on a primary-colored surface. */
const PRIMARY_FOREGROUND = 'oklch(0.99 0.005 80)';

/** Push a theme into the CSS variables / attributes the design system reads. */
export function applyTenantTheme(theme: TenantTheme | null) {
  if (typeof document === 'undefined' || !theme) return;
  const root = document.documentElement;
  // Same unconditional treatment as the quick theme-store customizer, for
  // every preset including Default — primary-colored text/buttons always
  // use the app's near-white token, per product decision.
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-foreground', PRIMARY_FOREGROUND);
  root.style.setProperty('--sidebar-primary', theme.primary);
  root.style.setProperty('--sidebar-primary-foreground', PRIMARY_FOREGROUND);
  root.style.setProperty('--ring', theme.primary);
  root.style.setProperty('--radius', `${theme.radius / 16}rem`);
  root.style.fontSize = FONT_SIZES[theme.fontScale] ?? '';
  if (theme.density === 'compact') root.setAttribute('data-density', 'compact');
  else root.removeAttribute('data-density');
  if (theme.reduceMotion) root.setAttribute('data-reduce-motion', 'true');
  else root.removeAttribute('data-reduce-motion');
}

/** Loads the tenant theme once per session and applies it (mounted in the admin shell). */
export function TenantThemeSync({ enabled }: { enabled: boolean }) {
  const { data } = useTenantTheme(enabled);
  useEffect(() => {
    if (enabled) applyTenantTheme(data ?? null);
  }, [data, enabled]);
  return null;
}

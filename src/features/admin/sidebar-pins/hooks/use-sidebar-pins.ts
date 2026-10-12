'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { str } from '@/lib/api/case';

export interface SidebarPin {
  id: string;
  pinKey: string;
  label: string;
  href: string;
  icon: string;
}

export interface SidebarPinInput {
  pinKey?: string;
  label: string;
  href: string;
  icon?: string;
}

const PINS_KEY = ['admin', 'sidebar-pins'] as const;

function toPins(raw: { items?: Record<string, unknown>[] }): SidebarPin[] {
  return (raw.items ?? []).map((p) => ({
    id: str(p.id),
    pinKey: str(p.pin_key),
    label: str(p.label),
    href: str(p.href),
    icon: str(p.icon),
  }));
}

/** GET /v1/sidebar-pins — the signed-in user's own shortcuts, in display order. */
export function useSidebarPins(enabled = true) {
  return useQuery({
    queryKey: PINS_KEY,
    queryFn: async () => toPins(await http.get<{ items?: Record<string, unknown>[] }>('/v1/sidebar-pins')),
    enabled,
    staleTime: 5 * 60_000,
  });
}

/** PUT /v1/sidebar-pins — replaces the full ordered list (max 12). */
export function useSaveSidebarPins() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pins: SidebarPinInput[]) =>
      toPins(
        await http.put<{ items?: Record<string, unknown>[] }>('/v1/sidebar-pins', {
          pins: pins.map((p) => ({ pin_key: p.pinKey || p.href, label: p.label, href: p.href, icon: p.icon ?? '' })),
        }),
      ),
    onSuccess: (pins) => qc.setQueryData(PINS_KEY, pins),
  });
}

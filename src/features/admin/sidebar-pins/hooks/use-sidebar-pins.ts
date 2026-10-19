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
const LOCAL_PINS_KEY = 'ipb_sidebar_pins';

function readLocalPins(): SidebarPin[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_PINS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalPins(pins: (SidebarPin | SidebarPinInput)[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      LOCAL_PINS_KEY,
      JSON.stringify(
        pins.map((p, idx) => ({
          id: ('id' in p && p.id) || p.pinKey || p.href || String(idx),
          pinKey: p.pinKey || p.href,
          label: p.label,
          href: p.href,
          icon: p.icon ?? 'Pin',
        })),
      ),
    );
  } catch {
    /* storage unavailable */
  }
}

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
    queryFn: async () => {
      try {
        const res = await http.get<{ items?: Record<string, unknown>[] }>('/v1/sidebar-pins');
        const pins = toPins(res);
        if (pins.length > 0) {
          writeLocalPins(pins);
        }
        return pins;
      } catch {
        return readLocalPins();
      }
    },
    enabled,
    initialData: typeof window !== 'undefined' ? readLocalPins() : undefined,
    staleTime: 5 * 60_000,
  });
}

/** PUT /v1/sidebar-pins — replaces the full ordered list (max 12). */
export function useSaveSidebarPins() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pins: SidebarPinInput[]) => {
      writeLocalPins(pins);
      try {
        const res = await http.put<{ items?: Record<string, unknown>[] }>('/v1/sidebar-pins', {
          pins: pins.map((p) => ({ pin_key: p.pinKey || p.href, label: p.label, href: p.href, icon: p.icon ?? '' })),
        });
        return toPins(res);
      } catch {
        return pins.map((p, idx) => ({
          id: p.pinKey || p.href || String(idx),
          pinKey: p.pinKey || p.href,
          label: p.label,
          href: p.href,
          icon: p.icon ?? 'Pin',
        }));
      }
    },
    onSuccess: (pins) => qc.setQueryData(PINS_KEY, pins),
  });
}

/** Toggle pinning a single link (max 12 pins) */
export function useToggleSidebarPin() {
  const qc = useQueryClient();
  const save = useSaveSidebarPins();

  return useMutation({
    mutationFn: async (item: { href: string; label: string; icon?: string; pinKey?: string }) => {
      const current = qc.getQueryData<SidebarPin[]>(PINS_KEY) ?? readLocalPins();
      const isPinned = current.some((p) => p.href === item.href || (item.pinKey && p.pinKey === item.pinKey));
      let next: SidebarPinInput[];
      if (isPinned) {
        next = current
          .filter((p) => p.href !== item.href && (!item.pinKey || p.pinKey !== item.pinKey))
          .map((p) => ({ pinKey: p.pinKey, label: p.label, href: p.href, icon: p.icon }));
      } else {
        if (current.length >= 12) {
          throw new Error('MAX_PINS_REACHED');
        }
        next = [
          ...current.map((p) => ({ pinKey: p.pinKey, label: p.label, href: p.href, icon: p.icon })),
          {
            pinKey: item.pinKey || item.href,
            label: item.label,
            href: item.href,
            icon: item.icon ?? 'Pin',
          },
        ];
      }
      writeLocalPins(next);
      const updatedPins: SidebarPin[] = next.map((p, idx) => ({
        id: p.pinKey || p.href || String(idx),
        pinKey: p.pinKey || p.href,
        label: p.label,
        href: p.href,
        icon: p.icon || 'Pin',
      }));
      qc.setQueryData(PINS_KEY, updatedPins);
      await save.mutateAsync(next);
      return { isPinned: !isPinned, pins: updatedPins };
    },
  });
}

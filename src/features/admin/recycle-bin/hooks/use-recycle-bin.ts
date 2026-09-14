'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformService } from '@/lib/api/services/platform.service';
import type { RecycleBinItem } from '@/data/admin/recycle-bin.data';

async function fetchRecycleBin(): Promise<RecycleBinItem[]> {
  const raw = await platformService.getRecycleBin();
  const items =
    raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)
      ? ((raw as { items: RecycleBinItem[] }).items)
      : Array.isArray(raw)
        ? (raw as RecycleBinItem[])
        : [];
  return items;
}

export function useRecycleBin() {
  return useQuery({
    queryKey: ['admin', 'domain', 'recycleBin'],
    queryFn: fetchRecycleBin,
  });
}

export function useRestoreRecycleBinItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformService.restoreRecycleBinItem(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'domain', 'recycleBin'] });
    },
  });
}

export function usePurgeRecycleBinItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformService.purgeRecycleBinItem(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'domain', 'recycleBin'] });
    },
  });
}

export function useEmptyRecycleBin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.allSettled(ids.map((id) => platformService.purgeRecycleBinItem(id)));
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'domain', 'recycleBin'] });
    },
  });
}

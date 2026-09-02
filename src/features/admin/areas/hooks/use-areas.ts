'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { toast } from 'sonner';
import type { Area } from '@/data/shared/types';

export function useAreas() {
  return useQuery({
    queryKey: ['admin', 'domain', 'areas'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'areas');
      return res as { items: Area[] };
    },
  });
}

export function useCreateArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; subareas?: string[] }) =>
      mockFetch('admin.areas.create', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'areas'] });
      toast.success('Service area created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create area'),
  });
}

export function useUpdateArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      mockFetch('admin.areas.update', id, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'areas'] });
      toast.success('Area updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update area'),
  });
}

export function useDeleteArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockFetch('admin.areas.delete', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'areas'] });
      toast.success('Area deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete area'),
  });
}

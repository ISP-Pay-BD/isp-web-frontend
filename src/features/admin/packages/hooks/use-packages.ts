'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { toast } from 'sonner';
import type { Package } from '@/data/shared/types';

export function usePackages() {
  return useQuery({
    queryKey: ['admin', 'domain', 'packages'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'packages');
      return res as { items: Package[]; popPackages: Package[] };
    },
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Package>) => mockFetch('admin.packages.create', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'packages'] });
      toast.success('Package created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create package'),
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Package> }) =>
      mockFetch('admin.packages.update', id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'packages'] });
      toast.success('Package updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update package'),
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockFetch('admin.packages.delete', id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'packages'] });
      toast.success('Package deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete package'),
  });
}

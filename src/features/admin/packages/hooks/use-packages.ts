'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { toast } from 'sonner';
import type { Package } from '@/data/shared/types';
import { getAuthUserId } from '@/lib/api/auth-utils';
import { http } from '@/lib/api/client';

export function usePackages() {
  return useQuery({
    queryKey: ['admin', 'domain', 'packages'],
    queryFn: async () => {
      const items = await adminService.getPackages();
      return {
        items: items || [],
        popPackages: items || [],
      };
    },
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Package>) => {
      const resellerId = getAuthUserId();
      return await http.post(`/v1/reseller/packages/${resellerId}`, payload);
    },
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
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Package> }) => {
      const resellerId = getAuthUserId();
      return await http.put(`/v1/reseller/packages/${resellerId}/${id}`, payload);
    },
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
    mutationFn: async (id: string) => {
      const resellerId = getAuthUserId();
      return await http.delete(`/v1/reseller/packages/${resellerId}/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'packages'] });
      toast.success('Package deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete package'),
  });
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { toast } from 'sonner';

export function useAreas() {
  return useQuery({
    queryKey: ['admin', 'domain', 'areas'],
    queryFn: () => adminService.getAreas(),
  });
}

export function useCreateArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; subareas?: string[] }) =>
      adminService.createArea(payload),
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
      adminService.updateArea(id, { name }),
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
    mutationFn: (id: string) => adminService.deleteArea(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'areas'] });
      toast.success('Area deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete area'),
  });
}

export function useAddSubArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ areaId, payload }: { areaId: string; payload: { name: string; areaCode: string } }) =>
      adminService.addSubArea(areaId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'areas'] });
      toast.success('Sub-area added');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add sub-area'),
  });
}

export function useUpdateSubArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ areaId, subId, payload }: { areaId: string; subId: string; payload: { name: string; areaCode: string; status: 'active' | 'inactive' } }) =>
      adminService.updateSubArea(areaId, subId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'areas'] });
      toast.success('Sub-area updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update sub-area'),
  });
}

export function useDeleteSubArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ areaId, subId }: { areaId: string; subId: string }) =>
      adminService.deleteSubArea(areaId, subId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'areas'] });
      toast.success('Sub-area deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete sub-area'),
  });
}

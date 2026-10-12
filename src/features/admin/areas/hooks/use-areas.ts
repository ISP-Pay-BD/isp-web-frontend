'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { areasApi } from '../api/areas.api';
import type { AreaPayload } from '../types';

const AREAS = ['admin', 'areas'] as const;

export function useAreas(params: { page: number; perPage: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: [...AREAS, 'list', params],
    queryFn: () => areasApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useAreaSummary() {
  return useQuery({ queryKey: [...AREAS, 'summary'], queryFn: areasApi.summary });
}

export function useSubAreas(areaId: string | null, page: number, perPage: number) {
  return useQuery({
    queryKey: [...AREAS, 'sub', areaId, page, perPage],
    queryFn: () => areasApi.subAreas(areaId as string, page, perPage),
    enabled: Boolean(areaId),
    placeholderData: keepPreviousData,
  });
}

/** Area / sub-area writes. Forms handle their own field errors (meta.silent). */
export function useAreaMutations() {
  const qc = useQueryClient();
  const refresh = (message: string) => () => {
    qc.invalidateQueries({ queryKey: AREAS });
    // Area pickers on the customer screens.
    qc.invalidateQueries({ queryKey: ['admin', 'options'] });
    toast.success(message);
  };
  return {
    create: useMutation({ mutationFn: (body: AreaPayload) => areasApi.create(body), meta: { silent: true }, onSuccess: refresh('Service area created') }),
    update: useMutation({
      mutationFn: (v: { id: string; body: AreaPayload }) => areasApi.update(v.id, v.body),
      meta: { silent: true },
      onSuccess: refresh('Service area updated'),
    }),
    remove: useMutation({ mutationFn: (id: string) => areasApi.remove([id]), onSuccess: refresh('Service area deleted') }),
    createSub: useMutation({
      mutationFn: (v: { areaId: string; body: AreaPayload }) => areasApi.createSub(v.areaId, v.body),
      meta: { silent: true },
      onSuccess: refresh('Sub-area added'),
    }),
    updateSub: useMutation({
      mutationFn: (v: { id: string; body: AreaPayload }) => areasApi.updateSub(v.id, v.body),
      meta: { silent: true },
      onSuccess: refresh('Sub-area updated'),
    }),
    removeSub: useMutation({ mutationFn: (id: string) => areasApi.removeSub([id]), onSuccess: refresh('Sub-area deleted') }),
  };
}

'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { camelizeKeys } from '@/lib/api/case';
import { adminService } from '@/lib/api/services/admin.service';

export type MovieServer = Awaited<ReturnType<typeof adminService.getMovieServers>>['items'][number];

export interface MovieServerInput {
  name: string;
  url: string;
  details: string;
  rating: string;
}

export interface ProbeResult {
  id: string;
  reachable: boolean;
  status: number | null;
  durationMs: number | null;
  error: string | null;
  checkedAt: string;
}

const KEY = ['admin', 'movie-servers'] as const;

export function useMovieServers(params: { page: number; pageSize: number; search?: string }) {
  return useQuery({
    queryKey: [...KEY, 'list', params],
    queryFn: () => adminService.getMovieServers({ page: params.page, perPage: params.pageSize, search: params.search }),
    placeholderData: keepPreviousData,
  });
}

function toForm(input: MovieServerInput): FormData {
  const form = new FormData();
  form.append('name', input.name.trim());
  form.append('url', input.url.trim());
  form.append('details', input.details.trim());
  if (input.rating.trim() !== '') form.append('rating', input.rating.trim());
  return form;
}

/** POST /common/movieservers/add — tenant comes from the token, never the body. */
export function useCreateMovieServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MovieServerInput) => http.upload('/common/movieservers/add', toForm(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateMovieServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MovieServerInput }) =>
      http.upload(`/common/movieservers/update/${id}`, toForm(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** The legacy route deletes on GET. */
export function useDeleteMovieServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.get(`/common/movieservers/delete/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** POST /v1/movie-servers/{id}/test — server-side HEAD with a short timeout. */
export function useTestMovieServer() {
  return useMutation({
    mutationFn: async (id: string) => camelizeKeys<ProbeResult>(await http.post<unknown>(`/v1/movie-servers/${id}/test`)),
  });
}

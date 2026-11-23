import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import type { KnowledgeFormValues } from '../schemas/knowledge.schema';
import { mapEntries, mapEntry, mapStats, mapTestResult } from '../types';

const BASE = '/v1/admin/ai-knowledge';

export const kbKeys = {
  all: ['platform', 'ai-knowledge'] as const,
  list: (category: string, status: string, search: string) =>
    ['platform', 'ai-knowledge', 'list', category, status, search] as const,
  stats: ['platform', 'ai-knowledge', 'stats'] as const,
  detail: (id: string) => ['platform', 'ai-knowledge', 'detail', id] as const,
};

const filter = (v: string) => (v && v !== 'all' ? v : undefined);

/**
 * GET /v1/admin/ai-knowledge?category=&status=&search= — matching entries (super_admin only). `search` is the
 * server-side PHP `fetch` filter over question / answer / keywords / category (lane R10).
 */
export function useKnowledgeList(category: string, status: string, search: string) {
  return useQuery({
    queryKey: kbKeys.list(category, status, search),
    queryFn: async () =>
      mapEntries(
        await http.get<unknown>(BASE, {
          category: filter(category),
          status: filter(status),
          search: search.trim() || undefined,
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

/** GET /v1/admin/ai-knowledge/stats — whole-base totals and per-category counts (lane R10). */
export function useKnowledgeStats() {
  return useQuery({
    queryKey: kbKeys.stats,
    queryFn: async () => mapStats(await http.get<unknown>(`${BASE}/stats`)),
  });
}

/** GET /v1/admin/ai-knowledge/get/{id}. */
export function useKnowledgeEntry(id: string | null) {
  return useQuery({
    queryKey: kbKeys.detail(id ?? ''),
    queryFn: async () => mapEntry(await http.get<unknown>(`${BASE}/get/${id}`)),
    enabled: Boolean(id),
  });
}

function toBody(v: KnowledgeFormValues) {
  return {
    category: v.category,
    question: v.question.trim(),
    answer: v.answer.trim(),
    keywords: v.keywords.trim() || null,
    match_type: v.matchType,
    priority: v.priority,
    status: v.status,
  };
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: kbKeys.all });
}

/** POST /v1/admin/ai-knowledge/save or POST /v1/admin/ai-knowledge/update/{id}. */
export function useSaveKnowledge() {
  const invalidate = useInvalidate();
  return useMutation({
    meta: { silent: true }, // the form maps field errors itself
    mutationFn: ({ id, values }: { id?: string; values: KnowledgeFormValues }) =>
      http.post<unknown>(id ? `${BASE}/update/${id}` : `${BASE}/save`, toBody(values)),
    onSuccess: invalidate,
  });
}

/** POST /v1/admin/ai-knowledge/toggle/{id} — active ⇄ inactive. */
export function useToggleKnowledge() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => http.post<{ status?: string }>(`${BASE}/toggle/${id}`),
    onSuccess: invalidate,
  });
}

/** POST /v1/admin/ai-knowledge/delete/{id} (the Rust route is POST, not DELETE). */
export function useDeleteKnowledge() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => http.post<unknown>(`${BASE}/delete/${id}`),
    onSuccess: invalidate,
  });
}

/** POST /v1/admin/ai-knowledge/test-query — which entry would answer this question. */
export function useTestKnowledgeQuery() {
  return useMutation({
    mutationFn: async (query: string) =>
      mapTestResult(await http.post<unknown>(`${BASE}/test-query`, { query })),
  });
}

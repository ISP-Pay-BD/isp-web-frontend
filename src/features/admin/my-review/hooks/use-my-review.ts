'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

export interface MyReview {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  initials: string;
  isActive: boolean;
  updatedAt: string | null;
}

export interface MyReviewInput {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
}

const KEY = ['admin', 'my-review'] as const;

function toMyReview(value: unknown): MyReview | null {
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  return {
    name: str(r.name),
    role: str(r.role),
    company: str(r.company),
    quote: str(r.quote),
    rating: num(r.rating, 5),
    initials: str(r.avatar_initials),
    isActive: r.is_active === true || r.is_active === 1,
    updatedAt: str(r.updated_at) || str(r.created_at) || null,
  };
}

/** GET /v1/user/review — the signed-in staff user's own review, or `null`. */
export function useMyReview() {
  return useQuery({
    queryKey: KEY,
    queryFn: async ({ signal }) =>
      toMyReview(await http.get<unknown>('/v1/user/review', undefined, signal)),
  });
}

/** POST /v1/user/review — create or update; published immediately. */
export function useSaveMyReview() {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: async (input: MyReviewInput) =>
      toMyReview(await http.post<unknown>('/v1/user/review', input)),
    onSuccess: (saved) => qc.setQueryData(KEY, saved),
  });
}

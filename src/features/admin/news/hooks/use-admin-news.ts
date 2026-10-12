'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { isoDate } from '@/features/admin/sms/types';

export type NewsKind = 'news' | 'banner';
export type NewsAudience = 'all' | 'customers' | 'resellers' | 'employees';
export type NewsStatus = 'published' | 'draft';

/** One row of GET /common/news (table News_notice). */
export interface NewsItem {
  id: string;
  title: string;
  body: string;
  url: string;
  image: string;
  audience: NewsAudience;
  status: NewsStatus;
  kind: NewsKind;
  pinned: boolean;
  startsAt: string;
  endsAt: string;
  publishedAt: string;
}

export interface NewsStats {
  total: number;
  published: number;
  draft: number;
  pinned: number;
  bannersLive: number;
}

const AUDIENCES: NewsAudience[] = ['all', 'customers', 'resellers', 'employees'];

function mapNews(raw: unknown): NewsItem {
  const r = (raw ?? {}) as Record<string, unknown>;
  const audience = str(r.audience, 'all') as NewsAudience;
  return {
    id: str(r.id),
    title: str(r.name),
    body: str(r.details),
    url: str(r.url),
    image: str(r.image),
    audience: AUDIENCES.includes(audience) ? audience : 'all',
    status: str(r.status) === 'draft' ? 'draft' : 'published',
    kind: str(r.kind) === 'banner' ? 'banner' : 'news',
    pinned: num(r.pinned) === 1,
    startsAt: isoDate(r.starts_at),
    endsAt: isoDate(r.ends_at),
    publishedAt: isoDate(r.created_at),
  };
}

export const newsKeys = {
  list: (params: Record<string, unknown>) => ['admin', 'news', 'list', params] as const,
};

export interface NewsListParams {
  kind: NewsKind;
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  audience?: string;
}

export function useAdminNews({ kind, page, pageSize, search, status, audience }: NewsListParams) {
  const params = {
    kind,
    page,
    per_page: pageSize,
    search: search || undefined,
    status: status && status !== 'all' ? status : undefined,
    audience: audience && audience !== 'any' ? audience : undefined,
  };
  return useQuery({
    queryKey: newsKeys.list(params),
    // Backend route: `GET /api/common/news` (baseURL already ends in `/api`).
    queryFn: async () => {
      const res = await http.getPage<unknown>('/common/news', params);
      const s = (res.raw.stats ?? {}) as Record<string, unknown>;
      const stats: NewsStats = {
        total: num(s.total),
        published: num(s.published),
        draft: num(s.draft),
        pinned: num(s.pinned),
        bannersLive: num(s.banners_live),
      };
      return { items: res.items.map(mapNews), meta: res.meta, stats };
    },
    placeholderData: keepPreviousData,
  });
}

export interface NewsInput {
  title?: string;
  body?: string;
  url?: string;
  audience?: NewsAudience;
  status?: NewsStatus;
  kind?: NewsKind;
  pinned?: boolean;
  startsAt?: string;
  endsAt?: string;
  image?: File | null;
}

/** Multipart body (the endpoint also accepts an image upload). Only provided fields are sent. */
function toFormData(input: NewsInput): FormData {
  const fd = new FormData();
  const put = (key: string, value: string | undefined) => {
    if (value !== undefined) fd.append(key, value);
  };
  put('name', input.title);
  put('details', input.body);
  put('url', input.url);
  put('audience', input.audience);
  put('status', input.status);
  put('kind', input.kind);
  put('pinned', input.pinned === undefined ? undefined : input.pinned ? '1' : '0');
  put('starts_at', input.startsAt);
  put('ends_at', input.endsAt);
  if (input.image) fd.append('image', input.image);
  return fd;
}

export function useSaveNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: NewsInput }) =>
      http.upload(id ? `/common/news/update/${id}` : '/common/news/add', toFormData(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'news'] }),
  });
}

export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    // The backend exposes delete as GET /common/news/delete/{id}.
    mutationFn: (id: string) => http.get(`/common/news/delete/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'news'] }),
  });
}

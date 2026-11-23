'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import type { PublicBlogDetail, PublicBlogList, PublicBlogPost } from '../types';

type Row = Record<string, unknown>;

function strOrNull(value: unknown): string | null {
  const s = str(value).trim();
  return s === '' ? null : s;
}

/** Only absolute or root-relative image URLs can load on this site. */
export function blogImage(src: string | null): string | null {
  return src && (/^(https?:)?\/\//i.test(src) || src.startsWith('/')) ? src : null;
}

export function toPublicPost(value: unknown): PublicBlogPost {
  const r = (value ?? {}) as Row;
  return {
    id: str(r.id),
    title: str(r.title),
    slug: str(r.slug),
    category: str(r.category),
    author: str(r.author),
    thumbnail: strOrNull(r.thumbnail),
    excerpt: str(r.excerpt),
    content: str(r.content),
    isFeatured: r.is_featured === true || r.is_featured === 1,
    views: num(r.views),
    publishedAt: strOrNull(r.published_at) ?? strOrNull(r.created_at),
  };
}

function list(value: unknown): PublicBlogPost[] {
  return Array.isArray(value) ? value.map(toPublicPost) : [];
}

export const BLOG_PAGE_SIZE = 9;

/**
 * GET /v1/public/blogs?category&search&page&per_page → `{ items, recent, categories: { All: n, <cat>: n },
 * meta: { page, per_page, total, last_page } }` (paging: lane R10).
 */
export function usePublicBlogs(params: { category: string; search: string; page: number }) {
  return useQuery({
    queryKey: ['marketing', 'blogs', params],
    queryFn: async ({ signal }): Promise<PublicBlogList> => {
      const res = await http.get<Row>(
        '/v1/public/blogs',
        {
          category: params.category || undefined,
          search: params.search || undefined,
          page: params.page,
          per_page: BLOG_PAGE_SIZE,
        },
        signal,
      );
      const cats =
        res?.categories && typeof res.categories === 'object' ? (res.categories as Row) : {};
      const meta = res?.meta && typeof res.meta === 'object' ? (res.meta as Row) : {};
      const items = list(res?.items);
      return {
        items,
        recent: list(res?.recent),
        categories: Object.entries(cats).map(([name, n]) => ({ name, count: num(n) })),
        page: num(meta.page) || params.page,
        lastPage: Math.max(1, num(meta.last_page) || 1),
        total: num(meta.total) || items.length,
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** GET /v1/public/blogs/{slug} → `{ post, related }`; 404 ApiError when not published. */
export function usePublicBlog(slug: string) {
  return useQuery({
    queryKey: ['marketing', 'blog', slug],
    queryFn: async ({ signal }): Promise<PublicBlogDetail> => {
      const res = await http.get<Row>(
        `/v1/public/blogs/${encodeURIComponent(slug)}`,
        undefined,
        signal,
      );
      return { post: toPublicPost(res?.post), related: list(res?.related) };
    },
    enabled: slug !== '',
  });
}

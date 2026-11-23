'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import type {
  BlogInput,
  BlogPost,
  LandingTemplate,
  Review,
  ReviewInput,
  TemplateInput,
} from '../types';

type Row = Record<string, unknown>;

function strOrNull(value: unknown): string | null {
  const s = str(value).trim();
  return s === '' ? null : s;
}

function flag(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function rows(value: unknown, key = 'items'): Row[] {
  if (Array.isArray(value)) return value as Row[];
  const inner = (value as Row | null)?.[key];
  return Array.isArray(inner) ? (inner as Row[]) : [];
}

/** Rust `BlogPost`. */
export function toBlogPost(value: unknown): BlogPost {
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
    isFeatured: flag(r.is_featured),
    published: flag(r.status),
    views: num(r.views),
    publishedAt: strOrNull(r.published_at),
    createdAt: strOrNull(r.created_at),
    updatedAt: strOrNull(r.updated_at),
  };
}

/** Rust `Template`. */
export function toTemplate(value: unknown): LandingTemplate {
  const r = (value ?? {}) as Row;
  return {
    id: str(r.id),
    title: str(r.title),
    slug: str(r.slug),
    category: str(r.category),
    technology: str(r.technology),
    demoUrl: strOrNull(r.demo_url),
    image: strOrNull(r.image),
    priceType: str(r.price_type, 'Free'),
    price: num(r.price),
    description: str(r.description),
    features: str(r.features)
      .split(/\r?\n/)
      .map((f) => f.trim())
      .filter(Boolean),
    isFeatured: flag(r.is_featured),
    published: flag(r.status),
    sortOrder: num(r.sort_order),
    createdAt: strOrNull(r.created_at),
  };
}

/** Rust `Review` (admin shape, carries contact details). */
export function toReview(value: unknown): Review {
  const r = (value ?? {}) as Row;
  return {
    id: str(r.id),
    userId: strOrNull(r.user_id),
    name: str(r.name),
    role: str(r.role),
    company: str(r.company),
    email: str(r.email),
    phone: str(r.phone),
    quote: str(r.quote),
    initials: str(r.avatar_initials),
    avatarUrl: strOrNull(r.avatar_url),
    rating: num(r.rating, 5),
    sortOrder: num(r.sort_order),
    isActive: flag(r.is_active),
    createdAt: strOrNull(r.created_at),
    submitterName: str(r.submitter_name),
    submitterRole: str(r.submitter_role),
    tenantName: str(r.tenant_name),
    contactEmail: str(r.contact_email),
    contactPhone: str(r.contact_phone),
    contactCompany: str(r.contact_company),
  };
}

const KEYS = {
  blogs: ['platform', 'cms', 'blogs'] as const,
  templates: ['platform', 'cms', 'templates'] as const,
  reviews: ['platform', 'cms', 'reviews'] as const,
};

// ── Blogs ─────────────────────────────────────────────────────────

/** GET /v1/platform/blogs — every post, drafts included. */
export function usePlatformBlogs() {
  return useQuery({
    queryKey: KEYS.blogs,
    queryFn: async ({ signal }) =>
      rows(await http.get<unknown>('/v1/platform/blogs', undefined, signal)).map(toBlogPost),
  });
}

/** POST /v1/platform/blogs · PUT /v1/platform/blogs/{id}. */
export function useSaveBlog(id: string | null) {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: async (input: BlogInput) =>
      toBlogPost(
        id
          ? await http.put<unknown>(`/v1/platform/blogs/${id}`, input)
          : await http.post<unknown>('/v1/platform/blogs', input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.blogs }),
  });
}

/** PUT /v1/platform/blogs/{id} with the post's own values and a new publish flag. */
export function useSetBlogPublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ post, published }: { post: BlogPost; published: boolean }) =>
      toBlogPost(
        await http.put<unknown>(`/v1/platform/blogs/${post.id}`, {
          title: post.title,
          category: post.category,
          author: post.author,
          content: post.content,
          excerpt: post.excerpt,
          thumbnail: post.thumbnail ?? '',
          is_featured: post.isFeatured,
          status: published,
          published_at: post.publishedAt ?? undefined,
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.blogs }),
  });
}

/** DELETE /v1/platform/blogs/{id}. */
export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`/v1/platform/blogs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.blogs }),
  });
}

// ── Templates ─────────────────────────────────────────────────────

/** GET /v1/platform/templates — hidden ones included. */
export function usePlatformTemplates() {
  return useQuery({
    queryKey: KEYS.templates,
    queryFn: async ({ signal }) =>
      rows(await http.get<unknown>('/v1/platform/templates', undefined, signal)).map(toTemplate),
  });
}

/** POST /v1/platform/templates · POST /v1/platform/templates/{id}/update. */
export function useSaveTemplate(id: string | null) {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: async (input: TemplateInput) =>
      toTemplate(
        await http.post<unknown>(
          id ? `/v1/platform/templates/${id}/update` : '/v1/platform/templates',
          input,
        ),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.templates }),
  });
}

/** POST /v1/platform/templates/{id}/update with the template's own values and a new visibility. */
export function useSetTemplateVisible() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tpl, visible }: { tpl: LandingTemplate; visible: boolean }) =>
      toTemplate(
        await http.post<unknown>(`/v1/platform/templates/${tpl.id}/update`, {
          title: tpl.title,
          category: tpl.category,
          technology: tpl.technology,
          demo_url: tpl.demoUrl ?? '',
          image: tpl.image ?? '',
          price_type: tpl.priceType,
          price: tpl.price,
          description: tpl.description,
          features: tpl.features.join('\n'),
          is_featured: tpl.isFeatured,
          status: visible,
          sort_order: tpl.sortOrder,
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.templates }),
  });
}

/** DELETE /v1/platform/templates/{id}. */
export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`/v1/platform/templates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.templates }),
  });
}

// ── Reviews ───────────────────────────────────────────────────────

/** GET /v1/platform/reviews → `{ items, total }` with submitter contact details. */
export function usePlatformReviews() {
  return useQuery({
    queryKey: KEYS.reviews,
    queryFn: async ({ signal }) =>
      rows(await http.get<unknown>('/v1/platform/reviews', undefined, signal)).map(toReview),
  });
}

/** POST /v1/platform/reviews · POST /v1/platform/reviews/{id}/update. */
export function useSaveReview(id: string | null) {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: async (input: ReviewInput) =>
      toReview(
        await http.post<unknown>(
          id ? `/v1/platform/reviews/${id}/update` : '/v1/platform/reviews',
          input,
        ),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.reviews }),
  });
}

/** POST /v1/platform/reviews/{id}/toggle → `{ is_active }`. */
export function useToggleReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await http.post<{ is_active?: unknown }>(`/v1/platform/reviews/${id}/toggle`);
      return flag(res?.is_active);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.reviews }),
  });
}

/** DELETE /v1/platform/reviews/{id}. */
export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`/v1/platform/reviews/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.reviews }),
  });
}

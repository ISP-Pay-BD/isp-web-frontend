'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

export interface CustomerFeedbackRow {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  rating: number;
  category: string;
  categoryLabel: string;
  comment: string | null;
  ticketId: string | null;
  createdAt: string | null;
}

export interface CustomerFeedbackSummary {
  total: number;
  averageRating: number | null;
  /** count per star, index 0 = 1 star … index 4 = 5 stars */
  byRating: number[];
}

export interface CustomerFeedbackParams {
  page: number;
  pageSize: number;
  search?: string;
  rating?: string;
}

export const customerFeedbackKeys = {
  list: (params: Record<string, unknown>) => ['admin', 'customer-feedback', 'list', params] as const,
};

function mapRow(raw: unknown): CustomerFeedbackRow {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: str(r.id),
    customerId: str(r.customer_id),
    customerName: str(r.customer_name),
    customerMobile: str(r.customer_mobile),
    rating: num(r.rating),
    category: str(r.category),
    categoryLabel: str(r.category_label, str(r.category)),
    comment: r.comment ? str(r.comment) : null,
    ticketId: r.ticket_id ? str(r.ticket_id) : null,
    createdAt: r.created_at ? str(r.created_at) : null,
  };
}

function mapSummary(raw: unknown): CustomerFeedbackSummary {
  const r = (raw ?? {}) as Record<string, unknown>;
  const by = (r.by_rating ?? {}) as Record<string, unknown>;
  return {
    total: num(r.total),
    averageRating: r.average_rating === null || r.average_rating === undefined ? null : num(r.average_rating),
    byRating: [1, 2, 3, 4, 5].map((n) => num(by[String(n)])),
  };
}

/** GET /v1/reseller/customer-feedback — tenant-scoped CSAT list + unfiltered summary. */
export function useCustomerFeedbackList({ page, pageSize, search, rating }: CustomerFeedbackParams) {
  const params = {
    page,
    per_page: pageSize,
    search: search || undefined,
    rating: rating && rating !== 'all' ? rating : undefined,
  };
  return useQuery({
    queryKey: customerFeedbackKeys.list(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/reseller/customer-feedback', params);
      return { items: res.items.map(mapRow), meta: res.meta, summary: mapSummary(res.raw.summary) };
    },
    placeholderData: keepPreviousData,
  });
}

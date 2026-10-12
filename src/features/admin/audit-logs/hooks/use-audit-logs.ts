'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { str } from '@/lib/api/case';
import { getResellerId } from '@/lib/api/auth-utils';

export interface AuditLogEntry {
  id: string;
  at: string;
  actorId: string;
  actor: string;
  action: string;
  entity: string;
  detail: string;
  ip: string;
  userAgent: string;
}

export interface AuditLogParams {
  page: number;
  pageSize: number;
  search?: string;
  action?: string;
  from?: string;
  to?: string;
}

/** `details` is JSON on new rows, free text on old ones — flatten for display. */
function detailText(raw: unknown): string {
  const text = str(raw);
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed as Record<string, unknown>)
        .filter(([, v]) => v !== null && v !== '' && v !== undefined)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
        .join(' · ');
    }
  } catch {
    // plain text
  }
  return text;
}

/** ip_address is a plain IP (API) or {"public_ip","local_ip"} (web login). */
function ipText(raw: unknown): string {
  const text = str(raw);
  try {
    const parsed = JSON.parse(text) as { public_ip?: string; local_ip?: string } | null;
    if (parsed && typeof parsed === 'object') return str(parsed.public_ip) || str(parsed.local_ip);
  } catch {
    // plain IP
  }
  return text;
}

function toEntry(row: Record<string, unknown>): AuditLogEntry {
  return {
    id: str(row.id),
    at: str(row.created_at),
    actorId: str(row.user_id),
    actor: str(row.actor) || (row.user_id ? `User #${str(row.user_id)}` : 'system'),
    action: str(row.action),
    entity: str(row.entity),
    detail: detailText(row.details),
    ip: ipText(row.ip_address),
    userAgent: str(row.user_agent),
  };
}

/** GET /v1/reseller/customers/{id}/audit-logs — server-side paging, search, action + date filters. */
export function useAuditLogs(params: AuditLogParams) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: async () => {
      const res = await http.getPage<Record<string, unknown>>(`/v1/reseller/customers/${getResellerId()}/audit-logs`, {
        page: params.page,
        per_page: params.pageSize,
        search: params.search || undefined,
        action: params.action || undefined,
        from: params.from || undefined,
        to: params.to || undefined,
      });
      return {
        items: res.items.map(toEntry),
        meta: res.meta,
        actions: Array.isArray(res.raw.actions) ? (res.raw.actions as string[]) : [],
      };
    },
    placeholderData: keepPreviousData,
  });
}

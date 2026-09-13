'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { getAuthUserId } from '@/lib/api/auth-utils';
import type { AuditLogEntry } from '@/data/admin/extras.data';

export function useAuditLogs() {
  return useQuery({
    queryKey: ['admin', 'domain', 'auditLogs'],
    queryFn: async () => {
      const resellerId = getAuthUserId();
      const res = await http.get<unknown>(`/v1/reseller/customers/${resellerId}/audit-logs`);
      if (Array.isArray(res)) {
        return { items: res as AuditLogEntry[] };
      }
      return (res as { items?: AuditLogEntry[] }) ?? { items: [] };
    },
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { AuditLogEntry } from '@/data/admin/extras.data';

export function useAuditLogs() {
  return useQuery({
    queryKey: ['admin', 'domain', 'auditLogs'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'auditLogs');
      return res as { items: AuditLogEntry[] };
    },
  });
}

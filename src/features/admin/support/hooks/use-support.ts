'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { SupportTicket } from '@/data/shared/types';

export function useSupportTickets() {
  return useQuery({
    queryKey: ['admin', 'domain', 'support'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'support');
      return res as {
        tickets: SupportTicket[];
        stats: { open: number; pending: number; closed: number; avgResponseHours: number };
      };
    },
  });
}

export function useSupportTicket(id: string) {
  return useQuery({
    queryKey: ['admin', 'support', 'ticket', id],
    queryFn: () => mockFetch('support.ticket', id),
    enabled: Boolean(id),
  });
}

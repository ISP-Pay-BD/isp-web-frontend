'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type { SupportTicket } from '@/data/shared/types';

export function useSupportTickets() {
  return useQuery({
    queryKey: ['admin', 'domain', 'support'],
    queryFn: async () => {
      return await adminService.getAdminSupportTickets();
    },
  });
}

export function useSupportTicket(id: string) {
  return useQuery({
    queryKey: ['admin', 'support', 'ticket', id],
    queryFn: () => adminService.getAdminSupportTicketDetail(id),
    enabled: Boolean(id),
  });
}

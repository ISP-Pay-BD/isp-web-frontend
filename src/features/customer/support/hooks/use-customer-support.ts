'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';
import type { CreateTicketPayload, TicketReplyPayload } from '@/lib/mock-api/handlers/customer.handler';

export function useCustomerSupportTickets() {
  return useQuery({
    queryKey: ['customer', 'support', 'list'],
    queryFn: () => customerService.getSupportTickets(),
  });
}

export function useCustomerTicketDetail(id: string) {
  const queryClient = useQueryClient();

  const ticketQuery = useQuery({
    queryKey: ['customer', 'support', 'detail', id],
    queryFn: () => customerService.getTicketDetail(id),
    enabled: !!id,
  });

  const replyMutation = useMutation({
    mutationFn: (payload: TicketReplyPayload) => customerService.replyTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'support', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'support', 'list'] });
    },
  });

  return {
    ...ticketQuery,
    replyMutation,
  };
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => customerService.createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'support', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
    },
  });
}

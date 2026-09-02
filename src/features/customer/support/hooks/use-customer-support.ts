'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { CreateTicketPayload, TicketReplyPayload } from '@/lib/mock-api/handlers/customer.handler';

export function useCustomerSupportTickets() {
  return useQuery({
    queryKey: ['customer', 'support', 'list'],
    queryFn: () => mockFetch('customer.support.list'),
  });
}

export function useCustomerTicketDetail(id: string) {
  const queryClient = useQueryClient();

  const ticketQuery = useQuery({
    queryKey: ['customer', 'support', 'detail', id],
    queryFn: () => mockFetch('customer.support.get', id),
    enabled: !!id,
  });

  const replyMutation = useMutation({
    mutationFn: (payload: TicketReplyPayload) => mockFetch('customer.support.reply', payload),
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
    mutationFn: (payload: CreateTicketPayload) => mockFetch('customer.support.create', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'support', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
    },
  });
}

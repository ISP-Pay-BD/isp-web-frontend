'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerService, type CreateTicketPayload, type PageParams } from '@/lib/api/services/customer.service';
import { customerKeys } from '@/features/customer/shared/hooks/use-customer-account';

/** GET /v1/tickets — the caller's own tickets (JWT-scoped), paginated. */
export function useCustomerSupportTickets(params: PageParams) {
  return useQuery({
    queryKey: customerKeys.ticketsPage(params),
    queryFn: () => customerService.getTickets(params),
    placeholderData: keepPreviousData,
  });
}

/** GET /v1/tickets/{id} + POST /v1/tickets/{id}/message */
export function useCustomerTicketDetail(id: string) {
  const queryClient = useQueryClient();

  const ticketQuery = useQuery({
    queryKey: customerKeys.ticket(id),
    queryFn: () => customerService.getTicket(id),
    enabled: Boolean(id),
  });

  const replyMutation = useMutation({
    mutationFn: (message: string) => customerService.replyTicket(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.tickets });
    },
  });

  return { ...ticketQuery, replyMutation };
}

/** POST /v1/tickets — `{subject, category, priority, message}`. */
export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: (payload: CreateTicketPayload) => customerService.createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.tickets });
      queryClient.invalidateQueries({ queryKey: customerKeys.dashboard });
    },
  });
}

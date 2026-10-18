'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { mapTicket, mapTicketDetail, mapTicketStats, type TicketPriority, type TicketStatus } from '../types';

export const supportKeys = {
  list: (params: Record<string, unknown>) => ['admin', 'support', 'list', params] as const,
  detail: (id: string) => ['admin', 'support', 'ticket', id] as const,
};

export interface TicketListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  priority?: string;
}

/** The tenant's ticket desk: own + assigned tickets (customer tickets are assigned to their ISP). */
export function useSupportTickets({ page, pageSize, search, status, priority }: TicketListParams) {
  const params = {
    page,
    per_page: pageSize,
    q: search || undefined,
    status: status && status !== 'all' ? status : undefined,
    priority: priority && priority !== 'all' ? priority : undefined,
  };
  return useQuery({
    queryKey: supportKeys.list(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/staff-tickets', params);
      return { items: res.items.map(mapTicket), meta: res.meta, stats: mapTicketStats(res.raw.stats) };
    },
    placeholderData: keepPreviousData,
  });
}

export function useSupportTicket(id: string) {
  return useQuery({
    queryKey: supportKeys.detail(id),
    queryFn: async () => mapTicketDetail(await http.get<unknown>(`/v1/staff-tickets/${id}`)),
    enabled: Boolean(id),
  });
}

export interface CreateTicketInput {
  subject: string;
  category: string;
  priority: TicketPriority;
  message: string;
  customerId?: string;
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTicketInput) =>
      mapTicket(
        await http.post<unknown>('/v1/staff-tickets', {
          subject: input.subject,
          category: input.category,
          priority: input.priority,
          message: input.message,
          customer_id: input.customerId || undefined,
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'support', 'list'] }),
  });
}

export function useReplyTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => http.post(`/v1/staff-tickets/${id}/message`, { message }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supportKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ['admin', 'support', 'list'] });
    },
  });
}

export function useTicketStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: TicketStatus) => http.post(`/v1/staff-tickets/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supportKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ['admin', 'support', 'list'] });
    },
  });
}

export function useTransferTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (employeeIds: string[]) => http.post('/v1/staff-tickets/transfer', { ticket_ids: [id], employee_ids: employeeIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supportKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ['admin', 'support', 'list'] });
    },
  });
}

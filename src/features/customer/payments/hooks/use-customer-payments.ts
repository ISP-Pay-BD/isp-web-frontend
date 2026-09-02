'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { PayInvoicePayload } from '@/lib/mock-api/handlers/customer.handler';

export function useCustomerPayments() {
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ['customer', 'payments'],
    queryFn: () => mockFetch('customer.payments'),
  });

  const payMutation = useMutation({
    mutationFn: (payload: PayInvoicePayload) => mockFetch('customer.payments.pay', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'subscription'] });
    },
  });

  return {
    ...paymentsQuery,
    payMutation,
  };
}

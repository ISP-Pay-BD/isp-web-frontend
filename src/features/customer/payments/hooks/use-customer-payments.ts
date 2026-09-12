'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';
import type { PayInvoicePayload } from '@/lib/mock-api/handlers/customer.handler';

export function useCustomerPayments() {
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ['customer', 'payments'],
    queryFn: () => customerService.getPayments(),
  });

  const payMutation = useMutation({
    mutationFn: (payload: PayInvoicePayload) => customerService.payInvoice(payload),
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

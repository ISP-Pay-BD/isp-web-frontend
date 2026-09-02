'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { toast } from 'sonner';
import type { Payment } from '@/data/shared/types';

export function useCustomerPayments() {
  return useQuery({
    queryKey: ['admin', 'domain', 'payments'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'payments');
      return res as { items: Payment[] };
    },
  });
}

export function useCreateCustomerPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Payment>) => mockFetch('admin.customer-payments.create', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'payments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Payment recorded successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to record payment'),
  });
}

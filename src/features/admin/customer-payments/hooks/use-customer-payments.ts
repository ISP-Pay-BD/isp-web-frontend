'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { toast } from 'sonner';
import type { Payment } from '@/data/shared/types';

export function useCustomerPayments() {
  return useQuery({
    queryKey: ['admin', 'domain', 'payments'],
    queryFn: () => adminService.getCustomerPayments(),
  });
}

export function useCreateCustomerPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Payment>) => adminService.createPayment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'payments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Payment recorded successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to record payment'),
  });
}

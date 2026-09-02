'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { toast } from 'sonner';

export interface PopReseller {
  id: string;
  name: string;
  balanceBdt: number;
  customers: number;
  status: string;
  contact: string;
  area: string;
}

export interface PopTransaction {
  id: string;
  popId: string;
  popName: string;
  type: 'credit' | 'debit';
  amountBdt: number;
  date: string;
  note: string;
}

export function usePopData() {
  return useQuery({
    queryKey: ['admin', 'domain', 'pop'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'pop');
      return res as { resellers: PopReseller[]; transactions: PopTransaction[] };
    },
  });
}

export function useCreatePopFunding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { popId: string; amountBdt: number; note?: string }) =>
      mockFetch('admin.pop.funding.create', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'pop'] });
      toast.success('POP funding credited');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to credit funding'),
  });
}

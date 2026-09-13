'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
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
    queryFn: async (): Promise<{ resellers: PopReseller[]; transactions: PopTransaction[] }> => {
      try {
        const res = await adminService.getPopFunding();
        if (Array.isArray(res)) {
          return { resellers: [] as PopReseller[], transactions: res as PopTransaction[] };
        }
        return { resellers: [] as PopReseller[], transactions: [] as PopTransaction[] };
      } catch {
        return { resellers: [] as PopReseller[], transactions: [] as PopTransaction[] };
      }
    },
  });
}


export function useCreatePopFunding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { popId: string; amountBdt: number; note?: string }) =>
      adminService.createPopFunding(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'pop'] });
      toast.success('POP funding credited');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to credit funding'),
  });
}


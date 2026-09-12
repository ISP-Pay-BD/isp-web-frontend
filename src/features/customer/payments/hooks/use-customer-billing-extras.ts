'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';

export function useCustomerAutoPay() {
  return useQuery({
    queryKey: ['customer', 'domain', 'autoPay'],
    queryFn: async () => {
      try {
        return await http.get<Record<string, unknown>>('/v1/customer/subscription/index');
      } catch {
        return { enabled: false, preferredGateway: 'bkash', maxLimit: 5000 };
      }
    },
  });
}

export function useCustomerInvoicePreview() {
  return useQuery({
    queryKey: ['customer', 'domain', 'invoicePreview'],
    queryFn: async () => {
      try {
        return await http.get<Record<string, unknown>>('/v1/customer/json/invoice-print');
      } catch {
        return null;
      }
    },
  });
}

export function useCustomerHelp() {
  return useQuery({
    queryKey: ['customer', 'domain', 'help'],
    queryFn: async () => {
      try {
        const res = await http.get<{ articles?: { id: string; title: string; category: string; minutes: number }[] }>('/v1/customer/support/contact');
        return res?.articles || [];
      } catch {
        return [];
      }
    },
  });
}

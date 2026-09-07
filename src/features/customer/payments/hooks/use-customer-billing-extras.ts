'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export function useCustomerAutoPay() {
  return useQuery({
    queryKey: ['customer', 'domain', 'autoPay'],
    queryFn: () => mockFetch('customer.domain', 'autoPay'),
  });
}

export function useCustomerInvoicePreview() {
  return useQuery({
    queryKey: ['customer', 'domain', 'invoicePreview'],
    queryFn: () => mockFetch('customer.domain', 'invoicePreview'),
  });
}

export function useCustomerHelp() {
  return useQuery({
    queryKey: ['customer', 'domain', 'help'],
    queryFn: async () => {
      const res = (await mockFetch('customer.domain', 'help')) as {
        articles: { id: string; title: string; category: string; minutes: number }[];
      };
      return res.articles;
    },
  });
}

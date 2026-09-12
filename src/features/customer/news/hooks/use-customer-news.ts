'use client';

import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';

export function useCustomerNews() {
  return useQuery({
    queryKey: ['customer', 'news', 'list'],
    queryFn: () => customerService.getNews(),
  });
}

export function useCustomerNewsItem(id: string) {
  return useQuery({
    queryKey: ['customer', 'news', 'item', id],
    queryFn: () => customerService.getNewsById(id),
    enabled: !!id,
  });
}

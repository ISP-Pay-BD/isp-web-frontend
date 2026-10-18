'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { customerService, type PageParams } from '@/lib/api/services/customer.service';
import { customerKeys } from '@/features/customer/shared/hooks/use-customer-account';

/** GET /v1/news — the provider's notices (`{data, pagination}`). */
export function useCustomerNews(params: PageParams) {
  return useQuery({
    queryKey: customerKeys.news(params),
    queryFn: () => customerService.getNews(params),
    placeholderData: keepPreviousData,
  });
}

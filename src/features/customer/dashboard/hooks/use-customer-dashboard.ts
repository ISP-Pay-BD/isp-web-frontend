'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';
import { customerKeys } from '@/features/customer/shared/hooks/use-customer-account';

export { useCustomerDashboard } from '@/features/customer/shared/hooks/use-customer-account';

const LATEST_NOTICES = { page: 1, perPage: 3 };

/** Latest provider notices for the home card (GET /v1/news). */
export function useLatestNotices() {
  return useQuery({
    queryKey: customerKeys.news(LATEST_NOTICES),
    queryFn: () => customerService.getNews(LATEST_NOTICES),
  });
}

/** Live rx/tx of the PPPoE session (GET /v1/customer/usage — dials the router, so failures are not retried). */
export function useSessionUsage() {
  return useQuery({
    queryKey: customerKeys.usage,
    queryFn: () => customerService.getUsage(),
    retry: false,
  });
}

/** POST /v1/customer/autofix/reset-session?user_id=<own id> — returns `{status, message}`. */
export function useQuickReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => customerService.runAutoFix('reset-session'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.usage });
    },
  });
}

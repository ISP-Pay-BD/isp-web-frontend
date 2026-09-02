'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { UpdateWifiPayload } from '@/lib/mock-api/handlers/customer.handler';

export function useCustomerRouter() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customer', 'router', 'tools'],
    queryFn: () => mockFetch('customer.router.tools'),
  });

  const quickFixMutation = useMutation({
    mutationFn: (actionId: string) => mockFetch('customer.router.quickFix', actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'router', 'tools'] });
    },
  });

  const updateWifiMutation = useMutation({
    mutationFn: (payload: UpdateWifiPayload) => mockFetch('customer.router.updateWifi', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'router', 'tools'] });
    },
  });

  return {
    ...query,
    quickFixMutation,
    updateWifiMutation,
  };
}

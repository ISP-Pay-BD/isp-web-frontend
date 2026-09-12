'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';
import type { UpdateWifiPayload } from '@/lib/mock-api/handlers/customer.handler';

export function useCustomerRouter() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customer', 'router', 'tools'],
    queryFn: () => customerService.getRouterTools(),
  });

  const quickFixMutation = useMutation({
    mutationFn: (actionId?: string) => customerService.quickFixPing(actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'router', 'tools'] });
    },
  });

  const updateWifiMutation = useMutation({
    mutationFn: (payload: UpdateWifiPayload) => customerService.updateWifi(payload),
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

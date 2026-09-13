'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';
import type { UpdateWifiPayload } from '@/lib/mock-api/handlers/customer.handler';

/** UI tool ids → backend autofix actions (`POST /v1/customer/autofix/{action}`). */
const TOOL_ACTIONS: Record<string, { action: 'reboot' | 'reconnect' | 'flush-dns' | 'reset-session' | 'quick-fix'; issue?: string }> = {
  quick_fix: { action: 'quick-fix' },
  reset_session: { action: 'reset-session' },
  reconnect: { action: 'reconnect' },
  dns_flush: { action: 'flush-dns' },
};

export function useCustomerRouter() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customer', 'router', 'tools'],
    queryFn: () => customerService.getRouterTools(),
  });

  const quickFixMutation = useMutation({
    mutationFn: async (actionId?: string) => {
      const mapped = actionId ? TOOL_ACTIONS[actionId] : undefined;
      const res = mapped
        ? await customerService.runAutoFix(mapped.action, { issue: mapped.issue })
        : await customerService.quickFixPing();
      return {
        message: String((res as Record<string, unknown>)?.message ?? 'Action completed'),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'router', 'tools'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
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

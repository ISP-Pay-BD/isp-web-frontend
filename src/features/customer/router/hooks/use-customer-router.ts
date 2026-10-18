'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerService, type ChangeWifiPayload } from '@/lib/api/services/customer.service';
import { customerKeys } from '@/features/customer/shared/hooks/use-customer-account';
import { http } from '@/lib/api/client';
import { mapRouterActionResult } from '@/lib/api/adapters/customer.adapter';

/** GET /v1/customer/router-control/targets → `{user_id, targets[]}`. */
export function useRouterTargets() {
  return useQuery({
    queryKey: customerKeys.routerTargets,
    queryFn: () => customerService.getRouterTargets(),
  });
}

/** GET /v1/customer/router-control/devices — reads the router, refreshed on demand only. */
export function useRouterDevices() {
  return useQuery({
    queryKey: customerKeys.routerDevices,
    queryFn: () => customerService.getRouterDevices(),
    retry: false,
  });
}

export type RouterTool = 'reset-session' | 'flush-dns' | 'reboot';

/**
 * Self-service router actions. Each returns the backend's real outcome
 * (`success` / `pending` with manual steps / cooldown) — the page shows it.
 */
export function useRouterAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tool, targetId }: { tool: RouterTool; targetId?: string }) =>
      tool === 'reboot' ? customerService.rebootRouter(targetId) : customerService.runAutoFix(tool),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.routerDevices });
      queryClient.invalidateQueries({ queryKey: customerKeys.usage });
    },
  });
}

/** GET /v1/customer/ping-user — on demand (each call pings the router). */
export function usePingConnection() {
  return useMutation({
    mutationFn: () => customerService.pingConnection(),
  });
}

/** POST /v1/customer/router-control/wifi */
export function useChangeWifi() {
  return useMutation({
    mutationFn: (payload: ChangeWifiPayload) => customerService.changeWifi(payload),
  });
}

/**
 * POST /v1/customer/device/{block|unblock} `{mac_address}`. With an
 * ACS-managed router the backend queues a real TR-069 job (`queued` + job id,
 * applied at the router's next check-in); otherwise it returns `pending` with
 * router-admin guidance. The page shows whichever came back.
 */
export function useDeviceAccess() {
  return useMutation({
    mutationFn: async ({ mac, block }: { mac: string; block: boolean }) =>
      mapRouterActionResult(await http.post<unknown>(`/v1/customer/device/${block ? 'block' : 'unblock'}`, { mac_address: mac })),
  });
}

export const CAPABILITY_LABELS: Record<string, string> = {
  mikrotik_pppoe: 'Managed by your provider (PPPoE)',
  tr069: 'Remote managed (TR-069)',
  vendor_api: 'Vendor cloud managed',
  web_only: 'Manual — router admin page',
};

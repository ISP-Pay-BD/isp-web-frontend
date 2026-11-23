import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import type { UplinkFormValues } from '../schemas/uplink.schema';
import { mapCandidates, mapCheck, mapCheckAll, mapLogs, mapUplinkList } from '../types';

const BASE = '/v1/routers/uplinks';

export const uplinkKeys = {
  all: ['admin', 'uplinks'] as const,
  list: (routerId?: string) => ['admin', 'uplinks', 'list', routerId ?? 'all'] as const,
  candidates: (routerId: string) => ['admin', 'uplinks', 'candidates', routerId] as const,
  logs: (id: string) => ['admin', 'uplinks', 'logs', id] as const,
};

/** GET /v1/routers/uplinks?router_id= — monitored uplinks + summary counters. */
export function useUplinks(routerId?: string) {
  return useQuery({
    queryKey: uplinkKeys.list(routerId),
    queryFn: async () =>
      mapUplinkList(await http.get<unknown>(BASE, routerId ? { router_id: routerId } : undefined)),
  });
}

/** GET /v1/routers/uplinks/candidates/{router_id} — read live from the MikroTik, so no retries. */
export function useUplinkCandidates(routerId: string) {
  return useQuery({
    queryKey: uplinkKeys.candidates(routerId),
    queryFn: async () => mapCandidates(await http.get<unknown>(`${BASE}/candidates/${routerId}`)),
    enabled: Boolean(routerId),
    retry: false,
    staleTime: 60_000,
  });
}

/** GET /v1/routers/uplinks/logs/{id} — last incidents and alert dispatches. */
export function useUplinkLogs(id: string | null) {
  return useQuery({
    queryKey: uplinkKeys.logs(id ?? ''),
    queryFn: async () => mapLogs(await http.get<unknown>(`${BASE}/logs/${id}`)),
    enabled: Boolean(id),
  });
}

function toBody(v: UplinkFormValues) {
  return {
    router_id: Number(v.routerId),
    name: v.name.trim(),
    uplink_type: v.uplinkType,
    target: v.target.trim(),
    alert_channels: v.alertChannels,
    notify_mobile: v.notifyMobile.trim() || null,
    notify_whatsapp: v.notifyWhatsapp.trim() || null,
    fail_threshold: v.failThreshold,
  };
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: uplinkKeys.all });
}

/** POST /v1/routers/uplinks/create (runs an immediate check) or POST /v1/routers/uplinks/update/{id}. */
export function useSaveUplink() {
  const invalidate = useInvalidate();
  return useMutation({
    meta: { silent: true }, // the form maps field errors itself
    mutationFn: ({ id, values }: { id?: string; values: UplinkFormValues }) =>
      http.post<unknown>(id ? `${BASE}/update/${id}` : `${BASE}/create`, toBody(values)),
    onSuccess: invalidate,
  });
}

/** POST /v1/routers/uplinks/toggle/{id} — pause / resume monitoring. */
export function useToggleUplink() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => http.post<unknown>(`${BASE}/toggle/${id}`),
    onSuccess: invalidate,
  });
}

/** DELETE /v1/routers/uplinks/delete/{id} — also removes its logs. */
export function useDeleteUplink() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`${BASE}/delete/${id}`),
    onSuccess: invalidate,
  });
}

/** POST /v1/routers/uplinks/check/{id} — probe the router now. */
export function useCheckUplink() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => mapCheck(await http.post<unknown>(`${BASE}/check/${id}`)),
    onSuccess: invalidate,
  });
}

/** POST /v1/routers/uplinks/check-all — every enabled uplink of this ISP. */
export function useCheckAllUplinks() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async () => mapCheckAll(await http.post<unknown>(`${BASE}/check-all`)),
    onSuccess: invalidate,
  });
}

/** POST /v1/routers/uplinks/test-alert/{id} — sends a simulated outage over WhatsApp / SMS. */
export function useTestUplinkAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.post<unknown>(`${BASE}/test-alert/${id}`),
    onSuccess: (_res, id) => qc.invalidateQueries({ queryKey: uplinkKeys.logs(id) }),
  });
}

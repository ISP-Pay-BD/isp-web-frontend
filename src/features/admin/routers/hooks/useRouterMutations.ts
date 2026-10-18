import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import type { RouterFormValues } from '../schemas/router.schema';
import { routerKeys } from './useRouters';

function toBody(values: RouterFormValues) {
  return {
    name: values.name,
    host: values.host,
    port: values.port,
    username: values.username,
    // Blank keeps the stored password on edit; never sent back by the API.
    password: values.password || undefined,
    status: values.status,
    hotspot_name: values.hotspotName,
    dns_name: values.dnsName,
  };
}

/** POST /v1/routers or PUT /v1/routers/{id}. The backend probes the device before saving. */
export function useSaveRouter() {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true }, // the form maps field errors itself
    mutationFn: ({ id, values }: { id?: string; values: RouterFormValues }) =>
      id ? http.put<unknown>(`/v1/routers/${id}`, toBody(values)) : http.post<unknown>('/v1/routers', toBody(values)),
    onSuccess: () => qc.invalidateQueries({ queryKey: routerKeys.all }),
  });
}

export interface TestConnectionInput {
  id?: string;
  host: string;
  port: number;
  username: string;
  password?: string;
}

/** POST /v1/routers/test-connection — blank password + id reuses the stored one. */
export function useTestRouterConnection() {
  return useMutation({
    mutationFn: (input: TestConnectionInput) =>
      http.post<{ info?: Record<string, unknown> }>('/v1/routers/test-connection', {
        id: input.id,
        host: input.host,
        port: input.port,
        username: input.username,
        password: input.password || undefined,
      }),
  });
}

/** DELETE /v1/routers/{id} — tenants deactivate; only the platform owner removes the row. */
export function useDeleteRouter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<{ deleted: boolean; deactivated: boolean }>(`/v1/routers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: routerKeys.all }),
  });
}

/**
 * POST /v1/routers/{id}/setup-radius — adds/refreshes the tenant RADIUS server on the
 * router and enables RADIUS for PPP + incoming CoA. 409 while RADIUS is disabled in settings.
 */
export function useSetupRadius() {
  return useMutation({
    mutationFn: (id: string) => http.post<{ steps?: string[] }>(`/v1/routers/${id}/setup-radius`),
  });
}

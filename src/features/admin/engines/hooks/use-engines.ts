'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { str } from '@/lib/api/case';
import {
  toEngineCatalogItem,
  toEngineInstance,
  toStringList,
  toTenantAdminOption,
} from '../lib/engine-mappers';
import type {
  DeployEnginePayload,
  EngineActionPayload,
  EngineCatalogParams,
  EngineCatalogResult,
  EngineInstance,
  EngineInstancesParams,
  EngineInstancesResult,
} from '../types';

export const engineKeys = {
  all: ['engines'] as const,
  catalog: (params: EngineCatalogParams) => ['engines', 'catalog', params] as const,
  catalogAll: ['engines', 'catalog'] as const,
  entry: (slug: string) => ['engines', 'entry', slug] as const,
  instances: (params: EngineInstancesParams) => ['engines', 'instances', params] as const,
  instancesAll: ['engines', 'instances'] as const,
  tenantAdmins: (search: string) => ['engines', 'tenant-admins', search] as const,
};

/** GET /v1/engines/catalog — published engines (all for super_admin) + caller's instance. */
export function useEngineCatalog(params: EngineCatalogParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: engineKeys.catalog(params),
    queryFn: async ({ signal }): Promise<EngineCatalogResult> => {
      const res = await http.getPage<unknown>(
        '/v1/engines/catalog',
        {
          search: params.search || undefined,
          category: params.category || undefined,
          page: params.page ?? 1,
          per_page: params.perPage ?? 50,
        },
        { signal },
      );
      return {
        items: res.items.map(toEngineCatalogItem),
        total: res.meta.total,
        page: res.meta.page,
        perPage: res.meta.perPage,
        totalPages: res.meta.totalPages,
        categories: toStringList(res.raw.categories),
        scope: str(res.raw.scope) === 'platform' ? 'platform' : 'tenant',
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** GET /v1/engines/catalog/{slug} — 404 ApiError when the engine is not available. */
export function useEngineEntry(slug: string) {
  return useQuery({
    queryKey: engineKeys.entry(slug),
    queryFn: async ({ signal }) =>
      toEngineCatalogItem(
        await http.get<unknown>(`/v1/engines/catalog/${encodeURIComponent(slug)}`, undefined, signal),
      ),
    enabled: slug !== '',
  });
}

/** GET /v1/engines/instances — paginated (tenant-scoped unless super_admin). */
export function useEngineInstances(params: EngineInstancesParams, enabled = true) {
  return useQuery({
    queryKey: engineKeys.instances(params),
    queryFn: async ({ signal }): Promise<EngineInstancesResult> => {
      const res = await http.getPage<unknown>(
        '/v1/engines/instances',
        {
          engine_key: params.engineKey || undefined,
          status: params.status || undefined,
          search: params.search || undefined,
          page: params.page,
          per_page: params.perPage,
        },
        { signal },
      );
      return { items: res.items.map(toEngineInstance), total: res.meta.total };
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

/** Tenant admin picker for "Enable for tenant" — GET /v1/platform/admins (super_admin). */
export function useTenantAdminOptions(search: string, enabled = true) {
  return useQuery({
    queryKey: engineKeys.tenantAdmins(search),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>(
        '/v1/platform/admins',
        { search: search || undefined, role: 'admin', per_page: 20 },
        { signal },
      );
      return {
        items: res.items.map(toTenantAdminOption),
        total: res.meta.total,
      };
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

function useInvalidateEngines() {
  const qc = useQueryClient();
  return (slug?: string) =>
    Promise.all([
      qc.invalidateQueries({ queryKey: engineKeys.catalogAll }),
      qc.invalidateQueries({ queryKey: engineKeys.instancesAll }),
      slug
        ? qc.invalidateQueries({ queryKey: engineKeys.entry(slug) })
        : qc.invalidateQueries({ queryKey: ['engines', 'entry'] }),
    ]);
}

/** POST /v1/engines/instances/deploy — create (201) or re-enable (200) an instance. */
export function useDeployEngine(slug?: string) {
  const invalidate = useInvalidateEngines();
  return useMutation({
    mutationFn: async ({ pluginId, tenantId, config }: DeployEnginePayload) =>
      toEngineInstance(
        await http.post<unknown>('/v1/engines/instances/deploy', {
          plugin_id: pluginId,
          ...(tenantId ? { tenant_id: Number(tenantId) } : {}),
          ...(config ? { config } : {}),
        }),
      ),
    onSuccess: () => invalidate(slug),
  });
}

/** POST /v1/engines/instances/{id}/action — enable | disable | configure. */
export function useEngineAction(slug?: string) {
  const invalidate = useInvalidateEngines();
  return useMutation({
    mutationFn: async ({ id, action, config }: EngineActionPayload): Promise<EngineInstance> =>
      toEngineInstance(
        await http.post<unknown>(`/v1/engines/instances/${encodeURIComponent(id)}/action`, {
          action,
          ...(action === 'configure' ? { config: config ?? {} } : {}),
        }),
      ),
    onSuccess: () => invalidate(slug),
  });
}

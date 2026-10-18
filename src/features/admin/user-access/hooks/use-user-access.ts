'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { camelizeKeys } from '@/lib/api/case';
import type {
  AccessCandidate,
  AccessRole,
  CustomAccessRecord,
  PermissionMap,
  PermissionSectionDef,
  RolePermissions,
  RoleSummary,
} from '../types';

const ACCESS = ['admin', 'user-access'] as const;

/** GET /v1/reseller/access-catalog?role= — menus/actions + user counts per role. */
export function useAccessCatalog(role: AccessRole) {
  return useQuery({
    queryKey: [...ACCESS, 'catalog', role],
    queryFn: async () => {
      const raw = await http.get<{ sections: PermissionSectionDef[]; roles: unknown[] }>('/v1/reseller/access-catalog', { role });
      // Section/action keys are permission identifiers — never camelize them.
      return { sections: raw.sections, roles: camelizeKeys<RoleSummary[]>(raw.roles) };
    },
    placeholderData: keepPreviousData,
    staleTime: 10 * 60_000,
  });
}

/** GET /v1/reseller/role-permissions/{role} — the defaults this tenant's users actually get. */
export function useRolePermissions(role: AccessRole) {
  return useQuery({
    queryKey: [...ACCESS, 'role', role],
    queryFn: async () => {
      const raw = await http.get<Record<string, unknown>>(`/v1/reseller/role-permissions/${role}`);
      return {
        role,
        permissions: (raw.permissions ?? {}) as PermissionMap,
        exists: Boolean(raw.exists),
        editable: Boolean(raw.editable),
        source: raw.source === 'platform' ? 'platform' : 'tenant',
      } satisfies RolePermissions;
    },
  });
}

export function useSaveRolePermissions(role: AccessRole) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissions: PermissionMap) => http.post(`/v1/reseller/role-permissions/${role}`, { permissions }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...ACCESS, 'role', role] }),
  });
}

/** Fetchers used on demand ("reset to default" buttons). */
export function fetchPlatformDefaults(role: string): Promise<PermissionMap> {
  return http
    .get<{ permissions?: PermissionMap }>(`/v1/reseller/role-permissions/${role}/defaults`)
    .then((r) => r.permissions ?? {});
}

export function fetchTenantRoleDefaults(role: string): Promise<PermissionMap> {
  return http.get<{ permissions?: PermissionMap }>(`/v1/reseller/role-permissions/${role}`).then((r) => r.permissions ?? {});
}

function toRecord(raw: Record<string, unknown>): CustomAccessRecord {
  return {
    id: String(raw.id ?? ''),
    userId: String(raw.user_id ?? ''),
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    role: String(raw.role ?? ''),
    roleLabel: String(raw.role_label ?? raw.role ?? ''),
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    permissions: (raw.permissions ?? {}) as PermissionMap,
    updatedAt: String(raw.updated_at ?? ''),
  };
}

/** GET /v1/access?page=&per_page=&search=&role= */
export function useCustomAccessList(params: { page: number; pageSize: number; search?: string; role?: string }) {
  return useQuery({
    queryKey: [...ACCESS, 'custom', params],
    queryFn: async () => {
      const res = await http.getPage<Record<string, unknown>>('/v1/access', {
        page: params.page,
        per_page: params.pageSize,
        search: params.search || undefined,
        role: params.role && params.role !== 'all' ? params.role : undefined,
      });
      return { items: res.items.map(toRecord), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** GET /v1/access/candidates — own active staff/POPs without an override yet. */
export function useAccessCandidates(enabled: boolean) {
  return useQuery({
    queryKey: [...ACCESS, 'candidates'],
    queryFn: async () => (await http.get<{ items: AccessCandidate[] }>('/v1/access/candidates')).items ?? [],
    enabled,
  });
}

export function useCreateCustomAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; status: 'active' | 'inactive'; permissions: PermissionMap }) =>
      http.post<{ id: string }>('/v1/access', { user_id: Number(input.userId), status: input.status, permissions: input.permissions }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCESS }),
  });
}

export function useUpdateCustomAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: 'active' | 'inactive'; permissions: PermissionMap }) =>
      toRecord(await http.put<Record<string, unknown>>(`/v1/access/${input.id}`, { status: input.status, permissions: input.permissions })),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...ACCESS, 'custom'] }),
  });
}

export function useDeleteCustomAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`/v1/access/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCESS }),
  });
}

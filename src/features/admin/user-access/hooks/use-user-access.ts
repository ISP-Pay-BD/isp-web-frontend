'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { camelizeKeys } from '@/lib/api/case';
import { useAuthStore } from '@/stores/auth-store';
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
      const raw = await http.get<{ sections?: PermissionSectionDef[]; roles?: unknown[] }>(
        '/v1/reseller/access-catalog',
        { role },
      );
      // Section/action keys are permission identifiers — never camelize them.
      return { sections: raw.sections ?? [], roles: camelizeKeys<RoleSummary[]>(raw.roles ?? []) };
    },
    placeholderData: keepPreviousData,
    staleTime: 10 * 60_000,
  });
}

/** `{section: [actions]}`; the API sends `[]` for an empty map. */
function toPermissionMap(v: unknown): PermissionMap {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as PermissionMap) : {};
}

/**
 * `GET /v1/access/defaults` — the tenant's own default rows (Customer / Employee / Reseller, seeded on first read).
 * Since lane W2-R13 these feed the effective permissions of the tenant's users (the platform row is only the
 * fallback), so a tenant admin edits them here. Tenant admin only (403 for anyone else).
 */
async function fetchTenantDefault(
  role: string,
): Promise<{ id: string; permissions: PermissionMap } | null> {
  const raw = await http.get<{ items?: Record<string, unknown>[] }>('/v1/access/defaults');
  const row = (raw.items ?? []).find((r) => r.role === role || r.user_type === role);
  return row ? { id: String(row.id ?? ''), permissions: toPermissionMap(row.permissions) } : null;
}

/** Tenant admins edit the tenant rows; the `admin` role and every other viewer see the platform row. */
const usesTenantDefaults = (viewerRole: string | undefined, role: AccessRole) =>
  viewerRole === 'admin' && role !== 'admin';

/** The defaults this tenant's users actually get: the tenant row (W2-R13) or the platform row. */
export function useRolePermissions(role: AccessRole) {
  const viewerRole = useAuthStore((s) => s.user?.role);
  const tenant = usesTenantDefaults(viewerRole, role);
  return useQuery({
    queryKey: [...ACCESS, 'role', role, tenant ? 'tenant' : 'platform'],
    queryFn: async (): Promise<RolePermissions> => {
      if (tenant) {
        const row = await fetchTenantDefault(role);
        if (row?.id) {
          return {
            role,
            permissions: row.permissions,
            exists: true,
            editable: true,
            source: 'tenant',
            defaultId: row.id,
          };
        }
      }
      // GET /v1/reseller/role-permissions/{role} — platform-wide row, editable by the super admin only.
      const raw = await http.get<Record<string, unknown>>(`/v1/reseller/role-permissions/${role}`);
      return {
        role,
        permissions: toPermissionMap(raw.permissions),
        exists: Boolean(raw.exists),
        editable: Boolean(raw.editable),
        source: raw.source === 'platform' ? 'platform' : 'tenant',
      };
    },
  });
}

/** Tenant row → `PUT /v1/access/defaults/{id}`; platform row → `POST /v1/reseller/role-permissions/{role}`. */
export function useSaveRolePermissions(role: AccessRole, defaultId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissions: PermissionMap) =>
      defaultId
        ? http.put(`/v1/access/defaults/${defaultId}`, { permissions })
        : http.post(`/v1/reseller/role-permissions/${role}`, { permissions }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...ACCESS, 'role', role] }),
  });
}

/** Fetchers used on demand ("reset to default" buttons). */
export function fetchPlatformDefaults(role: string): Promise<PermissionMap> {
  return http
    .get<{ permissions?: unknown }>(`/v1/reseller/role-permissions/${role}/defaults`)
    .then((r) => toPermissionMap(r.permissions));
}

/** What a new custom-access row starts from: the tenant default for the role, else the platform default. */
export async function fetchTenantRoleDefaults(role: string): Promise<PermissionMap> {
  if (useAuthStore.getState().user?.role === 'admin' && role !== 'admin') {
    const row = await fetchTenantDefault(role).catch(() => null);
    if (row) return row.permissions;
  }
  return http
    .get<{ permissions?: unknown }>(`/v1/reseller/role-permissions/${role}`)
    .then((r) => toPermissionMap(r.permissions));
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
export function useCustomAccessList(params: {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
}) {
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
    queryFn: async () =>
      (await http.get<{ items: AccessCandidate[] }>('/v1/access/candidates')).items ?? [],
    enabled,
  });
}

export function useCreateCustomAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      userId: string;
      status: 'active' | 'inactive';
      permissions: PermissionMap;
    }) =>
      http.post<{ id: string }>('/v1/access', {
        user_id: Number(input.userId),
        status: input.status,
        permissions: input.permissions,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCESS }),
  });
}

export function useUpdateCustomAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      status: 'active' | 'inactive';
      permissions: PermissionMap;
    }) =>
      toRecord(
        await http.put<Record<string, unknown>>(`/v1/access/${input.id}`, {
          status: input.status,
          permissions: input.permissions,
        }),
      ),
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

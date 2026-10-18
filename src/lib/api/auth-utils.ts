import { ApiError } from './client';

type StoredUser = { id?: string | number; tenantId?: string | number; role?: string } | null;

export function getAuthUser(): StoredUser {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('isp-auth-storage');
    return raw ? (JSON.parse(raw)?.state?.user ?? null) : null;
  } catch {
    return null;
  }
}

function positive(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** The signed-in user's own id (customer `user_id`, employee id, admin id). */
export function getAuthUserId(): number {
  const id = positive(getAuthUser()?.id);
  if (!id) throw new ApiError('You are not signed in.', 401, 'UNAUTHORIZED');
  return id;
}

/**
 * The tenant (reseller/admin) id that scopes `/v1/reseller/{id}/…` routes.
 * Admins and reseller admins own their tenant; staff act for their employer.
 */
export function getResellerId(): number {
  const user = getAuthUser();
  const ownsTenant = user?.role === 'admin' || user?.role === 'resellerAdmin' || user?.role === 'super_admin';
  const id = ownsTenant ? positive(user?.id) : (positive(user?.tenantId) ?? positive(user?.id));
  if (!id) throw new ApiError('You are not signed in.', 401, 'UNAUTHORIZED');
  return id;
}

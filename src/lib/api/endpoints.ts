/**
 * Central endpoint constants.
 *
 * IMPORTANT: every path in this file must exist in the backend (`zapi`).
 * A previous revision declared a full `/v1/admin/*`, `/v1/customer/*`,
 * `/v1/employee/*` and `/v1/platform/*` surface that the backend never
 * implemented — the real routes live under `/v1/reseller/*` and
 * `/v1/customer/*`. Those dead entries were removed so nobody wires against
 * paths that 404.
 *
 * Prefer the per-domain service in `src/lib/api/services/` when one exists;
 * `auth` is the only surface currently expressed as constants.
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/v1/auth/login',
    refresh: '/v1/auth/refresh',
    me: '/v1/auth/me',
  },
} as const;

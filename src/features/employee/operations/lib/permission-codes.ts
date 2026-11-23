/**
 * `GET /v1/permissions/me` → `permissions: string[]` (Rust `effective_permissions`, lane W2-R13): flat menu codes
 * (`support_ticket`) plus action codes (`support_ticket.send_msg`). Rule from R13 "Paths for Next.js": an action is
 * allowed when its `menu.action` code is present; a bare `menu` code only covers the action when no other
 * `menu.*` code is listed (a role-shell grant). Anything else is hidden — the API is still the final judge (403).
 */
export function allowsAction(codes: readonly string[], menu: string, action: string): boolean {
  if (codes.includes(`${menu}.${action}`)) return true;
  if (!codes.includes(menu)) return false;
  return !codes.some((c) => c.startsWith(`${menu}.`));
}

export function mapPermissionCodes(raw: unknown): string[] {
  const list = (raw as { permissions?: unknown } | null)?.permissions;
  return Array.isArray(list) ? list.filter((c): c is string => typeof c === 'string') : [];
}

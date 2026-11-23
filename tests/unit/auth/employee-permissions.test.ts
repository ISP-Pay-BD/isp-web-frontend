import { describe, expect, it } from 'vitest';
import { mergePermissionCodes, transformBackendAuthUser } from '@/lib/api/adapters/auth.adapter';
import { canSee } from '@/lib/permissions/can';
import { employeeNavigation } from '@/config/navigation';

/** Rust `POST /v1/auth/login` / `GET /v1/auth/me` for an employee token (lane W2-R13). */
const employee = (permissions: number[], permission_codes?: string[]) =>
  transformBackendAuthUser({
    user_id: 7,
    role: 'employee',
    tenant_id: 2,
    permissions,
    permission_codes,
  });

const visibleIds = (user: ReturnType<typeof employee>) =>
  employeeNavigation.filter((i) => canSee(i, user.permissions, user.role)).map((i) => i.id);

describe('employee permissions from login / auth me', () => {
  it('maps PermissionIdMap ids and action codes onto the permission map', () => {
    const user = employee(
      [37, 65],
      ['customer_payment.create', 'support_ticket.read', 'support_ticket.send_msg'],
    );
    expect(user.permissions.customer_payment).toEqual(['create']);
    expect(user.permissions.support_ticket).toEqual(['read', 'send_msg']);
  });

  it('treats a bare role-shell menu code as read only, never a write', () => {
    expect(mergePermissionCodes({}, ['customer', 'support_ticket'])).toEqual({
      customer: ['read'],
      support_ticket: ['read'],
    });
  });

  it('ignores malformed codes and does not mutate the id map', () => {
    const base = { area: ['read'] };
    expect(mergePermissionCodes(base, ['', 3, null, 'area.update'])).toEqual({
      area: ['read', 'update'],
    });
    expect(base).toEqual({ area: ['read'] });
    expect(mergePermissionCodes(base, undefined)).toBe(base);
  });

  it('shows Collect payment / Add customer / Tickets only with the matching grant', () => {
    const none = visibleIds(employee([], ['profile_update', 'password_change']));
    expect(none).toContain('emp-salaries');
    for (const id of ['emp-collect-payment', 'emp-add-customer', 'emp-tickets'])
      expect(none).not.toContain(id);

    const shell = visibleIds(employee([], ['customer', 'customer_payment', 'support_ticket']));
    expect(shell).toContain('emp-tickets');
    expect(shell).not.toContain('emp-collect-payment');
    expect(shell).not.toContain('emp-add-customer');

    const full = visibleIds(
      employee([10, 37, 65], ['customer.create', 'customer_payment.create', 'support_ticket.read']),
    );
    expect(full).toEqual(
      expect.arrayContaining(['emp-collect-payment', 'emp-add-customer', 'emp-tickets']),
    );
  });

  it('leaves other roles unchanged (permission_codes only read for employees)', () => {
    const admin = transformBackendAuthUser({
      user_id: 1,
      role: 'admin',
      permissions: [1],
      permission_codes: ['customer.create'],
    });
    expect(admin.permissions).toEqual({ area: ['read'] });
  });
});

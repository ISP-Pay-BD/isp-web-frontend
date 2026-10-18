import { describe, expect, it } from 'vitest';
import { can, canSee, hasAnyPermission } from '@/lib/permissions/can';

describe('permissions/can', () => {
  const permissions = {
    customer: ['read', 'create'],
    payment: ['read'],
  };

  it('allows super_admin bypass', () => {
    expect(can({}, 'customer', 'delete', 'super_admin')).toBe(true);
  });

  it('lets the tenant admin through every check', () => {
    expect(can({}, 'accounting', 'delete', 'admin')).toBe(true);
  });

  it('checks menu access without action', () => {
    expect(can(permissions, 'customer')).toBe(true);
    expect(can(permissions, 'packages')).toBe(false);
  });

  it('checks specific action', () => {
    expect(can(permissions, 'customer', 'create')).toBe(true);
    expect(can(permissions, 'customer', 'delete')).toBe(false);
  });

  describe('POP (resellerAdmin)', () => {
    it('is judged by its own permission rows, like the API gate', () => {
      expect(can(permissions, 'customer', 'create', 'resellerAdmin')).toBe(true);
      expect(can(permissions, 'customer', 'delete', 'resellerAdmin')).toBe(false);
      expect(can(permissions, 'accounting', 'read', 'resellerAdmin')).toBe(false);
    });

    it('leaves menus the permission list cannot express to the API', () => {
      expect(can({}, 'voice_sms', 'read', 'resellerAdmin')).toBe(true);
      expect(can({}, 'Resellers', 'update', 'resellerAdmin')).toBe(true);
    });

    it('is not a blanket pass for employees', () => {
      expect(can({}, 'voice_sms', 'read', 'employee')).toBe(false);
    });
  });

  it('hasAnyPermission follows the same rule', () => {
    expect(hasAnyPermission({}, ['accounting', 'reports'], 'admin')).toBe(true);
    expect(hasAnyPermission(permissions, ['accounting', 'customer'], 'resellerAdmin')).toBe(true);
    expect(hasAnyPermission(permissions, ['accounting', 'reports'], 'resellerAdmin')).toBe(false);
  });
});

describe('permissions/canSee', () => {
  const popPermissions = { customer: ['read'], sms_message: ['read'] };

  it('shows an entry with no restriction to everyone', () => {
    expect(canSee({}, {}, 'employee')).toBe(true);
  });

  it('enforces roles for every role, including the ISP admin', () => {
    expect(canSee({ roles: ['admin'] }, {}, 'admin')).toBe(true);
    expect(canSee({ roles: ['admin'] }, popPermissions, 'resellerAdmin')).toBe(false);
  });

  it('defaults the permission action to read', () => {
    expect(canSee({ permission: { menu: 'sms_message' } }, popPermissions, 'resellerAdmin')).toBe(true);
    expect(canSee({ permission: { menu: 'hotspot' } }, popPermissions, 'resellerAdmin')).toBe(false);
  });

  it('hides a create shortcut from a read-only POP', () => {
    const addCustomer = { roles: ['admin', 'resellerAdmin'] as const, permission: { menu: 'customer', action: 'create' } };
    expect(canSee({ ...addCustomer, roles: [...addCustomer.roles] }, popPermissions, 'resellerAdmin')).toBe(false);
    expect(canSee({ ...addCustomer, roles: [...addCustomer.roles] }, {}, 'admin')).toBe(true);
  });
});

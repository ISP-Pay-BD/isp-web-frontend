import { describe, expect, it } from 'vitest';
import { can } from '@/lib/permissions/can';

describe('permissions/can', () => {
  const permissions = {
    customer: ['read', 'create'],
    payment: ['read'],
  };

  it('allows super_admin bypass', () => {
    expect(can({}, 'customer', 'delete', 'super_admin')).toBe(true);
  });

  it('checks menu access without action', () => {
    expect(can(permissions, 'customer')).toBe(true);
    expect(can(permissions, 'packages')).toBe(false);
  });

  it('checks specific action', () => {
    expect(can(permissions, 'customer', 'create')).toBe(true);
    expect(can(permissions, 'customer', 'delete')).toBe(false);
  });
});

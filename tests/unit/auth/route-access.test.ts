import { describe, expect, it } from 'vitest';
import {
  canAccessPath,
  isRoleAllowedForPrefix,
  isExpiredPathAllowed,
  ROLE_HOME,
} from '@/lib/auth/route-access';

describe('auth/route-access', () => {
  it('maps roles to home paths', () => {
    expect(ROLE_HOME.admin).toBe('/admin/dashboard');
    expect(ROLE_HOME.user).toBe('/customer/dashboard');
    expect(ROLE_HOME.super_admin).toBe('/platform/dashboard');
  });

  it('checks role prefix access', () => {
    expect(isRoleAllowedForPrefix('admin', '/admin/dashboard')).toBe(true);
    expect(isRoleAllowedForPrefix('user', '/admin/dashboard')).toBe(false);
    expect(isRoleAllowedForPrefix('super_admin', '/platform/tenants')).toBe(true);
  });

  it('allows expired billing paths only', () => {
    expect(isExpiredPathAllowed('user', '/customer/subscription')).toBe(true);
    expect(isExpiredPathAllowed('user', '/customer/dashboard')).toBe(false);
    expect(isExpiredPathAllowed('admin', '/admin/subscription')).toBe(true);
    expect(isExpiredPathAllowed('admin', '/admin/customers')).toBe(false);
  });

  it('blocks expired users from full portal routes', () => {
    const result = canAccessPath('user', 'inactive', '/customer/dashboard');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('expired');
  });

  it('allows active users on dashboard', () => {
    expect(canAccessPath('admin', 'active', '/admin/dashboard').allowed).toBe(true);
  });
});

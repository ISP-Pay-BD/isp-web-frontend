import { describe, expect, it } from 'vitest';
import {
  canAccessPath,
  isRoleAllowedForPrefix,
  isExpiredPathAllowed,
  getPostLoginRedirect,
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

  it('computes safe post-login destination without 403 cross-portal redirect', () => {
    // If a customer logs in with a redirect URL pointing to admin portal, fallback to customer home
    expect(getPostLoginRedirect('user', '/admin/dashboard')).toBe('/customer/dashboard');

    // If an admin logs in with redirect to customer portal, fallback to admin home
    expect(getPostLoginRedirect('admin', '/customer/profile')).toBe('/admin/dashboard');

    // If redirect points to 403 or login, fallback to role home
    expect(getPostLoginRedirect('user', '/403')).toBe('/customer/dashboard');
    expect(getPostLoginRedirect('admin', '/login')).toBe('/admin/dashboard');

    // If redirect is valid for role, preserve it
    expect(getPostLoginRedirect('user', '/customer/payments')).toBe('/customer/payments');
    expect(getPostLoginRedirect('admin', '/admin/packages')).toBe('/admin/packages');
    expect(getPostLoginRedirect('super_admin', '/platform/tenants')).toBe('/platform/tenants');
  });
});


import { describe, it, expect } from 'vitest';
import { transformBackendAuthUser, transformPermissionIdsToMap } from '@/lib/api/adapters/auth.adapter';

describe('auth.adapter', () => {
  it('correctly maps numeric permission IDs to module action records', () => {
    const ids = [1, 2, 5, 9, 10, 65, 66];
    const map = transformPermissionIdsToMap(ids);

    expect(map.area).toEqual(['read', 'create']);
    expect(map.packages).toEqual(['read']);
    expect(map.customer).toEqual(['read', 'create']);
    expect(map.support_ticket).toEqual(['read', 'create']);
  });

  it('transforms backend auth response into frontend User model', () => {
    const rawData = {
      user_id: 101,
      name: 'Rahim Admin',
      email: 'rahim@isppaybd.com',
      mobile: '01711000000',
      role: 'admin',
      status: 'active',
      tenant_id: 2,
      permissions: [1, 2, 3, 4],
    };

    const user = transformBackendAuthUser(rawData);
    expect(user.id).toBe('101');
    expect(user.name).toBe('Rahim Admin');
    expect(user.email).toBe('rahim@isppaybd.com');
    expect(user.phone).toBe('01711000000');
    expect(user.role).toBe('admin');
    expect(user.status).toBe('active');
    expect(user.tenantId).toBe('2');
    expect(user.permissions.area).toEqual(['read', 'create', 'update', 'delete']);
  });
});

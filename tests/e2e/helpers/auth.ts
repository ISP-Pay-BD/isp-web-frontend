import type { BrowserContext, Page } from '@playwright/test';

export interface TestUserSession {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'super_admin' | 'employee' | 'resellerAdmin';
  status: 'active' | 'inactive';
  tenantId: string;
}

export const ADMIN_SESSION: TestUserSession = {
  id: 'admin_e2e_01',
  name: 'ISP Master Admin',
  email: 'admin@isppaybd.com',
  role: 'admin',
  status: 'active',
  tenantId: 'tenant_001',
};

export const CUSTOMER_SESSION: TestUserSession = {
  id: 'cust_e2e_01',
  name: 'Karim Ahmed',
  email: 'karim@customer.com',
  role: 'user',
  status: 'active',
  tenantId: 'tenant_001',
};

export const PLATFORM_SESSION: TestUserSession = {
  id: 'platform_e2e_01',
  name: 'Super Platform Admin',
  email: 'superadmin@isppaybd.com',
  role: 'super_admin',
  status: 'active',
  tenantId: 'platform_system',
};

export const EMPLOYEE_SESSION: TestUserSession = {
  id: 'emp_e2e_01',
  name: 'Field Technician Employee',
  email: 'technician@isppaybd.com',
  role: 'employee',
  status: 'active',
  tenantId: 'tenant_001',
};

export async function loginAs(context: BrowserContext, page: Page, session: TestUserSession) {
  // 1. Set the server-side proxy cookie
  const cookiePayload = {
    userId: session.id,
    role: session.role,
    status: session.status,
  };

  await context.addCookies([
    {
      name: 'isp-auth-mock',
      value: encodeURIComponent(JSON.stringify(cookiePayload)),
      domain: '127.0.0.1',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'isp-auth-mock',
      value: encodeURIComponent(JSON.stringify(cookiePayload)),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // 2. Set client-side Zustand store in localStorage before DOM loads
  await page.addInitScript((s) => {
    const authState = {
      state: {
        user: {
          id: s.id,
          name: s.name,
          email: s.email,
          phone: '+8801700000000',
          role: s.role,
          status: s.status,
          tenantId: s.tenantId,
          organizationName: 'ISP Pay BD Network',
          permissions: {
            '*': ['*'],
            customers: ['read', 'write', 'delete'],
            billing: ['read', 'write'],
            network: ['read', 'write'],
            shop: ['read', 'write'],
            push: ['read', 'write'],
          },
        },
        token: 'e2e-synthetic-test-jwt-token',
        isAuthenticated: true,
      },
      version: 0,
    };
    window.localStorage.setItem('isp-auth-storage', JSON.stringify(authState));
    window.localStorage.setItem('isp_locale', 'en');
  }, session);
}

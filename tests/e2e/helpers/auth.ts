import type { BrowserContext, Page } from '@playwright/test';

export interface TestUserSession {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user' | 'super_admin' | 'employee' | 'resellerAdmin';
  status: 'active' | 'inactive';
  tenantId: string;
}

export const ADMIN_SESSION: TestUserSession = {
  id: '1001',
  name: 'Alpha Owner',
  email: 'owner@example.com',
  password: 'Alpha#12345',
  role: 'admin',
  status: 'active',
  tenantId: '1',
};

export const CUSTOMER_SESSION: TestUserSession = {
  id: '1005',
  name: 'Alpha User',
  email: 'user@alpha.example',
  password: 'Alpha#User1',
  role: 'user',
  status: 'active',
  tenantId: '1',
};

export const PLATFORM_SESSION: TestUserSession = {
  id: '4001',
  name: 'Super Admin',
  email: 'root@isppaybd.local',
  password: 'Sup3r#Root!',
  role: 'super_admin',
  status: 'active',
  tenantId: '4',
};

export const EMPLOYEE_SESSION: TestUserSession = {
  id: '1004',
  name: 'Alpha Emp',
  email: 'emp@alpha.example',
  password: 'Alpha#Emp1',
  role: 'employee',
  status: 'active',
  tenantId: '1',
};

const tokenCache = new Map<string, string>();

async function getRealToken(email: string, password?: string): Promise<string> {
  if (tokenCache.has(email)) return tokenCache.get(email)!;
  try {
    const res = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password: password || 'Alpha#12345' }),
    });
    const d = await res.json();
    const token = d?.data?.access_token;
    if (token) {
      tokenCache.set(email, token);
      return token;
    }
  } catch {
    // fallback
  }
  return 'e2e-synthetic-test-jwt-token';
}

export async function loginAs(context: BrowserContext, page: Page, session: TestUserSession) {
  // 1. Get real JWT access token from backend
  const realToken = await getRealToken(session.email, session.password);

  // 2. Set the server-side proxy cookie
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

  // 3. Set client-side Zustand store in localStorage before DOM loads
  await page.addInitScript((arg) => {
    const authState = {
      state: {
        user: {
          id: arg.session.id,
          name: arg.session.name,
          email: arg.session.email,
          phone: '+8801700000000',
          role: arg.session.role,
          status: arg.session.status,
          tenantId: arg.session.tenantId,
          organizationName: 'Alpha Broadband Network',
          permissions: {
            '*': ['*'],
            customers: ['read', 'write', 'delete'],
            billing: ['read', 'write'],
            network: ['read', 'write'],
            shop: ['read', 'write'],
            push: ['read', 'write'],
          },
        },
        token: arg.token,
        isAuthenticated: true,
      },
      version: 0,
    };
    window.localStorage.setItem('isp-auth-storage', JSON.stringify(authState));
    window.localStorage.setItem('isp_locale', 'en');
  }, { session, token: realToken });
}

export async function clearAuth(context: BrowserContext, page: Page) {
  await context.clearCookies();
  await page.addInitScript(() => {
    window.localStorage.removeItem('isp-auth-storage');
  });
}

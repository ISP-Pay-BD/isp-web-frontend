import {
  mockLogin,
  mockGetCurrentUser,
  mockForgotPassword,
  mockGetRolePermissions,
  mockUpdateRolePermissions,
  mockGetPermissionSections,
  mockListCustomAccess,
  type LoginPayload,
  type ForgotPasswordPayload,
  type UpdatePermissionsPayload,
} from './handlers/auth.handler';
import { getLandingData, getPricingData, getPluginsData, getContactData } from './handlers/marketing.handler';
import {
  listCustomers,
  getCustomer,
  listExpiredCustomers,
  getAdminDashboard,
  getCustomerDashboard,
  getAdminDomain,
  getCustomerDomain,
  getPlatformDomain,
  getEmployeeDomain,
  getSupportTicket,
  getNewsItem,
} from './handlers/data.handler';
import { mockDelay } from './delay';

type HandlerMap = {
  'auth.login': (payload: LoginPayload) => ReturnType<typeof mockLogin>;
  'auth.me': (userId: string) => ReturnType<typeof mockGetCurrentUser>;
  'auth.forgotPassword': (payload: ForgotPasswordPayload) => ReturnType<typeof mockForgotPassword>;
  'auth.rolePermissions.get': (role: string) => ReturnType<typeof mockGetRolePermissions>;
  'auth.rolePermissions.update': (payload: UpdatePermissionsPayload) => ReturnType<typeof mockUpdateRolePermissions>;
  'auth.permissionSections': () => ReturnType<typeof mockGetPermissionSections>;
  'auth.customAccess.list': () => ReturnType<typeof mockListCustomAccess>;
  'health.ping': () => Promise<{ ok: true; mode: 'mock' }>;
  'marketing.landing': () => ReturnType<typeof getLandingData>;
  'marketing.pricing': () => ReturnType<typeof getPricingData>;
  'marketing.plugins': () => ReturnType<typeof getPluginsData>;
  'marketing.contact': () => ReturnType<typeof getContactData>;
  'admin.customers.list': () => ReturnType<typeof listCustomers>;
  'admin.customers.get': (id: string) => ReturnType<typeof getCustomer>;
  'admin.customers.expired': () => ReturnType<typeof listExpiredCustomers>;
  'admin.dashboard': () => ReturnType<typeof getAdminDashboard>;
  'admin.domain': (domain: string) => ReturnType<typeof getAdminDomain>;
  'customer.dashboard': () => ReturnType<typeof getCustomerDashboard>;
  'customer.domain': (domain: string) => ReturnType<typeof getCustomerDomain>;
  'platform.domain': (domain: string) => ReturnType<typeof getPlatformDomain>;
  'employee.domain': () => ReturnType<typeof getEmployeeDomain>;
  'support.ticket': (id: string) => ReturnType<typeof getSupportTicket>;
  'news.item': (id: string) => ReturnType<typeof getNewsItem>;
};

const handlers: HandlerMap = {
  'auth.login': mockLogin,
  'auth.me': mockGetCurrentUser,
  'auth.forgotPassword': mockForgotPassword,
  'auth.rolePermissions.get': mockGetRolePermissions,
  'auth.rolePermissions.update': mockUpdateRolePermissions,
  'auth.permissionSections': mockGetPermissionSections,
  'auth.customAccess.list': mockListCustomAccess,
  'health.ping': async () => {
    await mockDelay(50);
    return { ok: true as const, mode: 'mock' as const };
  },
  'marketing.landing': getLandingData,
  'marketing.pricing': getPricingData,
  'marketing.plugins': getPluginsData,
  'marketing.contact': getContactData,
  'admin.customers.list': listCustomers,
  'admin.customers.get': getCustomer,
  'admin.customers.expired': listExpiredCustomers,
  'admin.dashboard': getAdminDashboard,
  'admin.domain': getAdminDomain,
  'customer.dashboard': getCustomerDashboard,
  'customer.domain': getCustomerDomain,
  'platform.domain': getPlatformDomain,
  'employee.domain': getEmployeeDomain,
  'support.ticket': getSupportTicket,
  'news.item': getNewsItem,
};

export type MockHandlerKey = keyof HandlerMap;

export async function mockFetch<K extends MockHandlerKey>(
  key: K,
  ...args: Parameters<HandlerMap[K]>
): Promise<Awaited<ReturnType<HandlerMap[K]>>> {
  const handler = handlers[key];
  // @ts-expect-error — tuple spread for mock handler registry
  return handler(...args);
}

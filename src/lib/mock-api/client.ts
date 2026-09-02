import { mockLogin, mockGetCurrentUser, type LoginPayload } from './handlers/auth.handler';
import { getLandingData, getPricingData, getPluginsData, getContactData } from './handlers/marketing.handler';
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listExpiredCustomers,
  createCustomerPayment,
  createPackage,
  updatePackage,
  deletePackage,
  createArea,
  updateArea,
  deleteArea,
  createPopFunding,
  rechargeAdminSubscription,
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
  'health.ping': () => Promise<{ ok: true; mode: 'mock' }>;
  'marketing.landing': () => ReturnType<typeof getLandingData>;
  'marketing.pricing': () => ReturnType<typeof getPricingData>;
  'marketing.plugins': () => ReturnType<typeof getPluginsData>;
  'marketing.contact': () => ReturnType<typeof getContactData>;
  'admin.customers.list': () => ReturnType<typeof listCustomers>;
  'admin.customers.get': (id: string) => ReturnType<typeof getCustomer>;
  'admin.customers.create': (payload: Parameters<typeof createCustomer>[0]) => ReturnType<typeof createCustomer>;
  'admin.customers.update': (id: string, payload: Parameters<typeof updateCustomer>[1]) => ReturnType<typeof updateCustomer>;
  'admin.customers.delete': (id: string) => ReturnType<typeof deleteCustomer>;
  'admin.customers.expired': () => ReturnType<typeof listExpiredCustomers>;
  'admin.customer-payments.create': (payload: Parameters<typeof createCustomerPayment>[0]) => ReturnType<typeof createCustomerPayment>;
  'admin.packages.create': (payload: Parameters<typeof createPackage>[0]) => ReturnType<typeof createPackage>;
  'admin.packages.update': (id: string, payload: Parameters<typeof updatePackage>[1]) => ReturnType<typeof updatePackage>;
  'admin.packages.delete': (id: string) => ReturnType<typeof deletePackage>;
  'admin.areas.create': (payload: Parameters<typeof createArea>[0]) => ReturnType<typeof createArea>;
  'admin.areas.update': (id: string, payload: Parameters<typeof updateArea>[1]) => ReturnType<typeof updateArea>;
  'admin.areas.delete': (id: string) => ReturnType<typeof deleteArea>;
  'admin.pop.funding.create': (payload: Parameters<typeof createPopFunding>[0]) => ReturnType<typeof createPopFunding>;
  'admin.subscription.recharge': (payload: Parameters<typeof rechargeAdminSubscription>[0]) => ReturnType<typeof rechargeAdminSubscription>;
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
  'admin.customers.create': createCustomer,
  'admin.customers.update': updateCustomer,
  'admin.customers.delete': deleteCustomer,
  'admin.customers.expired': listExpiredCustomers,
  'admin.customer-payments.create': createCustomerPayment,
  'admin.packages.create': createPackage,
  'admin.packages.update': updatePackage,
  'admin.packages.delete': deletePackage,
  'admin.areas.create': createArea,
  'admin.areas.update': updateArea,
  'admin.areas.delete': deleteArea,
  'admin.pop.funding.create': createPopFunding,
  'admin.subscription.recharge': rechargeAdminSubscription,
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

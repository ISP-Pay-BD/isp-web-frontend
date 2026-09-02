import { mockLogin, mockGetCurrentUser, mockForgotPassword, type LoginPayload, type ForgotPasswordPayload } from './handlers/auth.handler';
import { getLandingData, getPricingData, getPluginsData, getContactData } from './handlers/marketing.handler';
import {
  listCustomers,
  getCustomer,
  listExpiredCustomers,
  getAdminDashboard,
  getAdminDomain,
  getCustomerDashboard,
  getCustomerDomain,
  getPlatformDomain,
  getEmployeeDomain,
  getSupportTicket,
  getNewsItem,
} from './handlers/data.handler';
import {
  getPlatformDashboard,
  listTenants,
  getTenant,
  saveTenant,
  editTenant,
  removeTenant,
  listAdmins,
  listAdminPackages,
  getRevenueData,
  listContacts,
  updateContactStatus,
  listPlugins,
  listFileManager,
  listSupportTickets,
  getSupportTicketDetails,
  replySupportTicket,
  listShowcase,
  getSettings,
  updateSettings,
  getRedisLogs,
  toggleMaintenance,
  listUserAccess,
} from './handlers/platform.handler';
import { mockDelay } from './delay';

type HandlerMap = {
  'auth.login': (payload: LoginPayload) => ReturnType<typeof mockLogin>;
  'auth.me': (userId: string) => ReturnType<typeof mockGetCurrentUser>;
  'auth.forgotPassword': (payload: ForgotPasswordPayload) => ReturnType<typeof mockForgotPassword>;
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
  // Platform specific handlers
  'platform.dashboard': () => ReturnType<typeof getPlatformDashboard>;
  'platform.tenants.list': (params?: { q?: string; status?: string }) => ReturnType<typeof listTenants>;
  'platform.tenants.get': (id: string) => ReturnType<typeof getTenant>;
  'platform.tenants.create': (data: Parameters<typeof saveTenant>[0]) => ReturnType<typeof saveTenant>;
  'platform.tenants.update': (id: string, data: Parameters<typeof editTenant>[1]) => ReturnType<typeof editTenant>;
  'platform.tenants.delete': (id: string) => ReturnType<typeof removeTenant>;
  'platform.admins.list': () => ReturnType<typeof listAdmins>;
  'platform.admins.packages': () => ReturnType<typeof listAdminPackages>;
  'platform.revenue': () => ReturnType<typeof getRevenueData>;
  'platform.contacts': () => ReturnType<typeof listContacts>;
  'platform.contacts.updateStatus': (id: string, status: Parameters<typeof updateContactStatus>[1]) => ReturnType<typeof updateContactStatus>;
  'platform.plugins': () => ReturnType<typeof listPlugins>;
  'platform.file-manager': (path?: string) => ReturnType<typeof listFileManager>;
  'platform.support': () => ReturnType<typeof listSupportTickets>;
  'platform.support.get': (id: string) => ReturnType<typeof getSupportTicketDetails>;
  'platform.support.reply': (id: string, body: string) => ReturnType<typeof replySupportTicket>;
  'platform.showcase': () => ReturnType<typeof listShowcase>;
  'platform.settings': () => ReturnType<typeof getSettings>;
  'platform.settings.update': (data: Parameters<typeof updateSettings>[0]) => ReturnType<typeof updateSettings>;
  'platform.redis-logs': (level?: string) => ReturnType<typeof getRedisLogs>;
  'platform.maintenance': (enabled: boolean) => ReturnType<typeof toggleMaintenance>;
  'platform.user-access': () => ReturnType<typeof listUserAccess>;
};

const handlers: HandlerMap = {
  'auth.login': mockLogin,
  'auth.me': mockGetCurrentUser,
  'auth.forgotPassword': mockForgotPassword,
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
  // Platform specific handlers
  'platform.dashboard': getPlatformDashboard,
  'platform.tenants.list': listTenants,
  'platform.tenants.get': getTenant,
  'platform.tenants.create': saveTenant,
  'platform.tenants.update': editTenant,
  'platform.tenants.delete': removeTenant,
  'platform.admins.list': listAdmins,
  'platform.admins.packages': listAdminPackages,
  'platform.revenue': getRevenueData,
  'platform.contacts': listContacts,
  'platform.contacts.updateStatus': updateContactStatus,
  'platform.plugins': listPlugins,
  'platform.file-manager': listFileManager,
  'platform.support': listSupportTickets,
  'platform.support.get': getSupportTicketDetails,
  'platform.support.reply': replySupportTicket,
  'platform.showcase': listShowcase,
  'platform.settings': getSettings,
  'platform.settings.update': updateSettings,
  'platform.redis-logs': getRedisLogs,
  'platform.maintenance': toggleMaintenance,
  'platform.user-access': listUserAccess,
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

import {
  mockLogin,
  mockGetCurrentUser,
  type LoginPayload,
  mockForgotPassword,
  mockGetRolePermissions,
  mockUpdateRolePermissions,
  mockGetPermissionSections,
  mockListCustomAccess,
  type ForgotPasswordPayload,
  type UpdatePermissionsPayload
} from './handlers/auth.handler';
import { getLandingData, getPricingData, getPluginsData, getContactData } from './handlers/marketing.handler';
import {
  listCustomers,
  getCustomer,
  listExpiredCustomers,
  getAdminDashboard,
  getAdminDomain,
  getCustomerDomain,
  getPlatformDomain,
  getEmployeeDomain,
  getSupportTicket,
  getNewsItem,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createCustomerPayment,
  createPackage,
  updatePackage,
  deletePackage,
  createArea,
  updateArea,
  deleteArea,
  createPopFunding,
  rechargeAdminSubscription,
} from './handlers/data.handler';
import {
  getCustomerDashboard,
  getCustomerSubscription,
  renewSubscription,
  getCustomerPackages,
  getCustomerPayments,
  payCustomerInvoice,
  getCustomerSupportTickets,
  getCustomerTicket,
  createCustomerTicket,
  replyCustomerTicket,
  getCustomerRewards,
  redeemCustomerRewards,
  getCustomerNews,
  getCustomerNewsDetails,
  getCustomerRouterInfo,
  runRouterQuickFix,
  updateCustomerWifi,
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
  type PayInvoicePayload,
  type CreateTicketPayload,
  type TicketReplyPayload,
  type UpdateWifiPayload,
  type UpdateProfilePayload,
  type ChangePasswordPayload,
} from './handlers/customer.handler';
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
import {
  getEmployeeSalaries,
  getEmployeeAdvanceRequests,
  getEmployeeProfile,
  requestAdvanceSalary,
  updateEmployeeProfile,
  type AdvanceRequestPayload,
  type ProfileUpdatePayload,
} from './handlers/employee.handler';
import { mockDelay } from './delay';

type HandlerMap = {
  'admin.areas.create': (payload: Parameters<typeof createArea>[0]) => ReturnType<typeof createArea>;
  'admin.areas.delete': (id: string) => ReturnType<typeof deleteArea>;
  'admin.areas.update': (id: string, payload: Parameters<typeof updateArea>[1]) => ReturnType<typeof updateArea>;
  'admin.customer-payments.create': (payload: Parameters<typeof createCustomerPayment>[0]) => ReturnType<typeof createCustomerPayment>;
  'admin.customers.create': (payload: Parameters<typeof createCustomer>[0]) => ReturnType<typeof createCustomer>;
  'admin.customers.delete': (id: string) => ReturnType<typeof deleteCustomer>;
  'admin.customers.expired': () => ReturnType<typeof listExpiredCustomers>;
  'admin.customers.get': (id: string) => ReturnType<typeof getCustomer>;
  'admin.customers.list': () => ReturnType<typeof listCustomers>;
  'admin.customers.update': (id: string, payload: Parameters<typeof updateCustomer>[1]) => ReturnType<typeof updateCustomer>;
  'admin.dashboard': () => ReturnType<typeof getAdminDashboard>;
  'admin.domain': (domain: string) => ReturnType<typeof getAdminDomain>;
  'admin.packages.create': (payload: Parameters<typeof createPackage>[0]) => ReturnType<typeof createPackage>;
  'admin.packages.delete': (id: string) => ReturnType<typeof deletePackage>;
  'admin.packages.update': (id: string, payload: Parameters<typeof updatePackage>[1]) => ReturnType<typeof updatePackage>;
  'admin.pop.funding.create': (payload: Parameters<typeof createPopFunding>[0]) => ReturnType<typeof createPopFunding>;
  'admin.subscription.recharge': (payload: Parameters<typeof rechargeAdminSubscription>[0]) => ReturnType<typeof rechargeAdminSubscription>;
  'auth.customAccess.list': () => ReturnType<typeof mockListCustomAccess>;
  'auth.forgotPassword': (payload: ForgotPasswordPayload) => ReturnType<typeof mockForgotPassword>;
  'auth.login': (payload: LoginPayload) => ReturnType<typeof mockLogin>;
  'auth.me': (userId: string) => ReturnType<typeof mockGetCurrentUser>;
  'auth.permissionSections': () => ReturnType<typeof mockGetPermissionSections>;
  'auth.rolePermissions.get': (role: string) => ReturnType<typeof mockGetRolePermissions>;
  'auth.rolePermissions.update': (payload: UpdatePermissionsPayload) => ReturnType<typeof mockUpdateRolePermissions>;
  'customer.dashboard': () => ReturnType<typeof getCustomerDashboard>;
  'customer.domain': (domain: string) => ReturnType<typeof getCustomerDomain>;
  'customer.news.get': (id: string) => ReturnType<typeof getCustomerNewsDetails>;
  'customer.news.list': () => ReturnType<typeof getCustomerNews>;
  'customer.packages': () => ReturnType<typeof getCustomerPackages>;
  'customer.password.change': (payload: ChangePasswordPayload) => ReturnType<typeof changeCustomerPassword>;
  'customer.payments': () => ReturnType<typeof getCustomerPayments>;
  'customer.payments.pay': (payload: PayInvoicePayload) => ReturnType<typeof payCustomerInvoice>;
  'customer.profile.get': () => ReturnType<typeof getCustomerProfile>;
  'customer.profile.update': (payload: UpdateProfilePayload) => ReturnType<typeof updateCustomerProfile>;
  'customer.rewards': () => ReturnType<typeof getCustomerRewards>;
  'customer.rewards.redeem': (points: number) => ReturnType<typeof redeemCustomerRewards>;
  'customer.router.quickFix': (actionId: string) => ReturnType<typeof runRouterQuickFix>;
  'customer.router.tools': () => ReturnType<typeof getCustomerRouterInfo>;
  'customer.router.updateWifi': (payload: UpdateWifiPayload) => ReturnType<typeof updateCustomerWifi>;
  'customer.subscription': () => ReturnType<typeof getCustomerSubscription>;
  'customer.subscription.renew': (packageId?: string) => ReturnType<typeof renewSubscription>;
  'customer.support.create': (payload: CreateTicketPayload) => ReturnType<typeof createCustomerTicket>;
  'customer.support.get': (id: string) => ReturnType<typeof getCustomerTicket>;
  'customer.support.list': () => ReturnType<typeof getCustomerSupportTickets>;
  'customer.support.reply': (payload: TicketReplyPayload) => ReturnType<typeof replyCustomerTicket>;
  'employee.advance.list': () => ReturnType<typeof getEmployeeAdvanceRequests>;
  'employee.advance.request': (payload: AdvanceRequestPayload) => ReturnType<typeof requestAdvanceSalary>;
  'employee.domain': () => ReturnType<typeof getEmployeeDomain>;
  'employee.profile.get': () => ReturnType<typeof getEmployeeProfile>;
  'employee.profile.update': (payload: ProfileUpdatePayload) => ReturnType<typeof updateEmployeeProfile>;
  'employee.salaries.list': () => ReturnType<typeof getEmployeeSalaries>;
  'health.ping': () => Promise<{ ok: true; mode: 'mock' }>;
  'marketing.contact': () => ReturnType<typeof getContactData>;
  'marketing.landing': () => ReturnType<typeof getLandingData>;
  'marketing.plugins': () => ReturnType<typeof getPluginsData>;
  'marketing.pricing': () => ReturnType<typeof getPricingData>;
  'news.item': (id: string) => ReturnType<typeof getNewsItem>;
  'platform.admins.list': () => ReturnType<typeof listAdmins>;
  'platform.admins.packages': () => ReturnType<typeof listAdminPackages>;
  'platform.contacts': () => ReturnType<typeof listContacts>;
  'platform.contacts.updateStatus': (id: string, status: Parameters<typeof updateContactStatus>[1]) => ReturnType<typeof updateContactStatus>;
  'platform.dashboard': () => ReturnType<typeof getPlatformDashboard>;
  'platform.domain': (domain: string) => ReturnType<typeof getPlatformDomain>;
  'platform.file-manager': (path?: string) => ReturnType<typeof listFileManager>;
  'platform.maintenance': (enabled: boolean) => ReturnType<typeof toggleMaintenance>;
  'platform.plugins': () => ReturnType<typeof listPlugins>;
  'platform.redis-logs': (level?: string) => ReturnType<typeof getRedisLogs>;
  'platform.revenue': () => ReturnType<typeof getRevenueData>;
  'platform.settings': () => ReturnType<typeof getSettings>;
  'platform.settings.update': (data: Parameters<typeof updateSettings>[0]) => ReturnType<typeof updateSettings>;
  'platform.showcase': () => ReturnType<typeof listShowcase>;
  'platform.support': () => ReturnType<typeof listSupportTickets>;
  'platform.support.get': (id: string) => ReturnType<typeof getSupportTicketDetails>;
  'platform.support.reply': (id: string, body: string) => ReturnType<typeof replySupportTicket>;
  'platform.tenants.create': (data: Parameters<typeof saveTenant>[0]) => ReturnType<typeof saveTenant>;
  'platform.tenants.delete': (id: string) => ReturnType<typeof removeTenant>;
  'platform.tenants.get': (id: string) => ReturnType<typeof getTenant>;
  'platform.tenants.list': (params?: { q?: string; status?: string }) => ReturnType<typeof listTenants>;
  'platform.tenants.update': (id: string, data: Parameters<typeof editTenant>[1]) => ReturnType<typeof editTenant>;
  'platform.user-access': () => ReturnType<typeof listUserAccess>;
  'support.ticket': (id: string) => ReturnType<typeof getSupportTicket>;
};

const handlers: HandlerMap = {
  'admin.areas.create': createArea,
  'admin.areas.delete': deleteArea,
  'admin.areas.update': updateArea,
  'admin.customer-payments.create': createCustomerPayment,
  'admin.customers.create': createCustomer,
  'admin.customers.delete': deleteCustomer,
  'admin.customers.expired': listExpiredCustomers,
  'admin.customers.get': getCustomer,
  'admin.customers.list': listCustomers,
  'admin.customers.update': updateCustomer,
  'admin.dashboard': getAdminDashboard,
  'admin.domain': getAdminDomain,
  'admin.packages.create': createPackage,
  'admin.packages.delete': deletePackage,
  'admin.packages.update': updatePackage,
  'admin.pop.funding.create': createPopFunding,
  'admin.subscription.recharge': rechargeAdminSubscription,
  'auth.customAccess.list': mockListCustomAccess,
  'auth.forgotPassword': mockForgotPassword,
  'auth.login': mockLogin,
  'auth.me': mockGetCurrentUser,
  'auth.permissionSections': mockGetPermissionSections,
  'auth.rolePermissions.get': mockGetRolePermissions,
  'auth.rolePermissions.update': mockUpdateRolePermissions,
  'customer.dashboard': getCustomerDashboard,
  'customer.domain': getCustomerDomain,
  'customer.news.get': getCustomerNewsDetails,
  'customer.news.list': getCustomerNews,
  'customer.packages': getCustomerPackages,
  'customer.password.change': changeCustomerPassword,
  'customer.payments': getCustomerPayments,
  'customer.payments.pay': payCustomerInvoice,
  'customer.profile.get': getCustomerProfile,
  'customer.profile.update': updateCustomerProfile,
  'customer.rewards': getCustomerRewards,
  'customer.rewards.redeem': redeemCustomerRewards,
  'customer.router.quickFix': runRouterQuickFix,
  'customer.router.tools': getCustomerRouterInfo,
  'customer.router.updateWifi': updateCustomerWifi,
  'customer.subscription': getCustomerSubscription,
  'customer.subscription.renew': renewSubscription,
  'customer.support.create': createCustomerTicket,
  'customer.support.get': getCustomerTicket,
  'customer.support.list': getCustomerSupportTickets,
  'customer.support.reply': replyCustomerTicket,
  'employee.advance.list': getEmployeeAdvanceRequests,
  'employee.advance.request': requestAdvanceSalary,
  'employee.domain': getEmployeeDomain,
  'employee.profile.get': getEmployeeProfile,
  'employee.profile.update': updateEmployeeProfile,
  'employee.salaries.list': getEmployeeSalaries,
  'health.ping': async () => {
    await mockDelay(50);
    return { ok: true as const, mode: 'mock' as const };
  },
  'marketing.contact': getContactData,
  'marketing.landing': getLandingData,
  'marketing.plugins': getPluginsData,
  'marketing.pricing': getPricingData,
  'news.item': getNewsItem,
  'platform.admins.list': listAdmins,
  'platform.admins.packages': listAdminPackages,
  'platform.contacts': listContacts,
  'platform.contacts.updateStatus': updateContactStatus,
  'platform.dashboard': getPlatformDashboard,
  'platform.domain': getPlatformDomain,
  'platform.file-manager': listFileManager,
  'platform.maintenance': toggleMaintenance,
  'platform.plugins': listPlugins,
  'platform.redis-logs': getRedisLogs,
  'platform.revenue': getRevenueData,
  'platform.settings': getSettings,
  'platform.settings.update': updateSettings,
  'platform.showcase': listShowcase,
  'platform.support': listSupportTickets,
  'platform.support.get': getSupportTicketDetails,
  'platform.support.reply': replySupportTicket,
  'platform.tenants.create': saveTenant,
  'platform.tenants.delete': removeTenant,
  'platform.tenants.get': getTenant,
  'platform.tenants.list': listTenants,
  'platform.tenants.update': editTenant,
  'platform.user-access': listUserAccess,
  'support.ticket': getSupportTicket,
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

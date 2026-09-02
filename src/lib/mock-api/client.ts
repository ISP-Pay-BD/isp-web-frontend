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
  getAdminDomain,
  getCustomerDomain,
  getPlatformDomain,
  getEmployeeDomain,
  getSupportTicket,
  getNewsItem,
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
  'customer.subscription': () => ReturnType<typeof getCustomerSubscription>;
  'customer.subscription.renew': (packageId?: string) => ReturnType<typeof renewSubscription>;
  'customer.packages': () => ReturnType<typeof getCustomerPackages>;
  'customer.payments': () => ReturnType<typeof getCustomerPayments>;
  'customer.payments.pay': (payload: PayInvoicePayload) => ReturnType<typeof payCustomerInvoice>;
  'customer.support.list': () => ReturnType<typeof getCustomerSupportTickets>;
  'customer.support.get': (id: string) => ReturnType<typeof getCustomerTicket>;
  'customer.support.create': (payload: CreateTicketPayload) => ReturnType<typeof createCustomerTicket>;
  'customer.support.reply': (payload: TicketReplyPayload) => ReturnType<typeof replyCustomerTicket>;
  'customer.rewards': () => ReturnType<typeof getCustomerRewards>;
  'customer.rewards.redeem': (points: number) => ReturnType<typeof redeemCustomerRewards>;
  'customer.news.list': () => ReturnType<typeof getCustomerNews>;
  'customer.news.get': (id: string) => ReturnType<typeof getCustomerNewsDetails>;
  'customer.router.tools': () => ReturnType<typeof getCustomerRouterInfo>;
  'customer.router.quickFix': (actionId: string) => ReturnType<typeof runRouterQuickFix>;
  'customer.router.updateWifi': (payload: UpdateWifiPayload) => ReturnType<typeof updateCustomerWifi>;
  'customer.profile.get': () => ReturnType<typeof getCustomerProfile>;
  'customer.profile.update': (payload: UpdateProfilePayload) => ReturnType<typeof updateCustomerProfile>;
  'customer.password.change': (payload: ChangePasswordPayload) => ReturnType<typeof changeCustomerPassword>;
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
  'customer.subscription': getCustomerSubscription,
  'customer.subscription.renew': renewSubscription,
  'customer.packages': getCustomerPackages,
  'customer.payments': getCustomerPayments,
  'customer.payments.pay': payCustomerInvoice,
  'customer.support.list': getCustomerSupportTickets,
  'customer.support.get': getCustomerTicket,
  'customer.support.create': createCustomerTicket,
  'customer.support.reply': replyCustomerTicket,
  'customer.rewards': getCustomerRewards,
  'customer.rewards.redeem': redeemCustomerRewards,
  'customer.news.list': getCustomerNews,
  'customer.news.get': getCustomerNewsDetails,
  'customer.router.tools': getCustomerRouterInfo,
  'customer.router.quickFix': runRouterQuickFix,
  'customer.router.updateWifi': updateCustomerWifi,
  'customer.profile.get': getCustomerProfile,
  'customer.profile.update': updateCustomerProfile,
  'customer.password.change': changeCustomerPassword,
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

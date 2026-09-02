import { mockDelay } from '../delay';
import { customers, expiredCustomers, freeUserRequests, getCustomerById } from '@/data/admin/customers.data';
import { customerPayments, getPaymentsByCustomerId } from '@/data/admin/customer-payments.data';
import { packages, popPackages } from '@/data/admin/packages.data';
import { areas } from '@/data/admin/areas.data';
import { adminDashboardStats, customerDashboardStats, resellerDashboardStats } from '@/data/admin/dashboard.data';
import * as accounting from '@/data/admin/accounting.data';
import * as hr from '@/data/admin/hr.data';
import * as bandwidth from '@/data/admin/bandwidth.data';
import * as networkOps from '@/data/admin/network-ops.data';
import * as purchase from '@/data/admin/purchase.data';
import * as inventory from '@/data/admin/inventory.data';
import * as wallet from '@/data/admin/wallet.data';
import * as reports from '@/data/admin/reports.data';
import { supportTickets, adminSupportStats, getTicketById } from '@/data/customer/support.data';
import { customerSubscription, customerPackages, customerRewards, routerTools, connectedDevices } from '@/data/customer/subscription.data';
import { newsItems, getNewsById } from '@/data/customer/news.data';
import { customerProfile, customerNotifications } from '@/data/customer/profile.data';
import { tenants, platformRevenue } from '@/data/platform/tenants.data';
import * as platformContacts from '@/data/platform/contacts.data';
import * as employee from '@/data/employee/salaries.data';

export async function listCustomers() {
  await mockDelay();
  return { items: customers, total: customers.length };
}

export async function getCustomer(id: string) {
  await mockDelay();
  const customer = getCustomerById(id);
  if (!customer) throw new Error('Customer not found');
  return { customer, payments: getPaymentsByCustomerId(id) };
}

export async function listExpiredCustomers() {
  await mockDelay();
  return { items: expiredCustomers, total: expiredCustomers.length };
}

export async function getAdminDashboard() {
  await mockDelay();
  return adminDashboardStats;
}

export async function getCustomerDashboard() {
  await mockDelay();
  return { stats: customerDashboardStats, subscription: customerSubscription };
}

export async function getAdminDomain(domain: string) {
  await mockDelay();
  const map: Record<string, unknown> = {
    packages: { items: packages, popPackages },
    areas: { items: areas },
    payments: { items: customerPayments },
    accounting,
    hr,
    bandwidth,
    network: networkOps,
    purchase,
    inventory,
    wallet,
    reports,
    support: { tickets: supportTickets, stats: adminSupportStats },
    freeRequests: freeUserRequests,
    resellerDashboard: resellerDashboardStats,
  };
  return map[domain] ?? { items: [] };
}

export async function getCustomerDomain(domain: string) {
  await mockDelay();
  const map: Record<string, unknown> = {
    subscription: customerSubscription,
    packages: customerPackages,
    payments: getPaymentsByCustomerId('cust_001'),
    rewards: customerRewards,
    router: { ...routerTools, devices: connectedDevices },
    support: { tickets: supportTickets.filter((t) => t.customerId === 'cust_001') },
    news: newsItems,
    profile: customerProfile,
    notifications: customerNotifications,
  };
  return map[domain] ?? {};
}

export async function getPlatformDomain(domain: string) {
  await mockDelay();
  const map: Record<string, unknown> = {
    tenants: { items: tenants, revenue: platformRevenue },
    contacts: platformContacts,
    support: platformContacts.platformSupportTickets,
    files: platformContacts.platformFileManager,
    showcase: platformContacts.productShowcase,
  };
  return map[domain] ?? {};
}

export async function getEmployeeDomain() {
  await mockDelay();
  return employee;
}

export async function getSupportTicket(id: string) {
  await mockDelay();
  const ticket = getTicketById(id);
  if (!ticket) throw new Error('Ticket not found');
  return ticket;
}

export async function getNewsItem(id: string) {
  await mockDelay();
  const item = getNewsById(id);
  if (!item) throw new Error('News not found');
  return item;
}

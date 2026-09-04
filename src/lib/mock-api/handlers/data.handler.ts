import { mockDelay } from '../delay';
import { customers, freeUserRequests, getCustomerById } from '@/data/admin/customers.data';
import { customerPayments, getPaymentsByCustomerId } from '@/data/admin/customer-payments.data';
import { packages, popPackages } from '@/data/admin/packages.data';
import { areas } from '@/data/admin/areas.data';
import { adminDashboardStats, customerDashboardStats, resellerDashboardStats } from '@/data/admin/dashboard.data';
import * as accounting from '@/data/admin/accounting.data';
import * as hr from '@/data/admin/hr.data';
import * as bandwidth from '@/data/admin/bandwidth.data';
import * as networkOps from '@/data/admin/network-ops.data';
import { supportTickets, adminSupportStats, getTicketById } from '@/data/customer/support.data';
import { customerSubscription, customerPackages, customerRewards, routerTools, connectedDevices } from '@/data/customer/subscription.data';
import { newsItems, getNewsById } from '@/data/customer/news.data';
import { customerProfile, customerNotifications } from '@/data/customer/profile.data';
import { tenants, platformRevenue } from '@/data/platform/tenants.data';
import * as platformContacts from '@/data/platform/contacts.data';
import * as employee from '@/data/employee/salaries.data';
import {
  adminSubscription,
  adminSubscriptionPlans,
  type AdminSubscription,
} from '@/data/admin/subscription.data';
import { tenantBillingPayments, tenantBillingSummary } from '@/data/admin/tenant-billing.data';

// In-memory clones for interactive mock mutations
let adminCustomers = [...customers];
let adminPayments = [...customerPayments];
let adminPackages = [...packages];
let adminAreas = [...areas];
const adminPopPackages = [...popPackages];
const adminPopResellers = [...networkOps.popResellers];
let adminPopTransactions = [...networkOps.popTransactions];
let adminTenantSubscription: AdminSubscription = { ...adminSubscription };
let adminTenantBilling = [...tenantBillingPayments];

export async function listCustomers() {
  await mockDelay();
  return { items: adminCustomers, total: adminCustomers.length };
}

export async function getCustomer(id: string) {
  await mockDelay();
  const customer = adminCustomers.find((c) => c.id === id) ?? getCustomerById(id);
  if (!customer) throw new Error('Customer not found');
  const payments = adminPayments.filter((p) => p.customerId === id);
  return { customer, payments };
}

export async function createCustomer(payload: Partial<typeof customers[0]>) {
  await mockDelay();
  const newId = `cust_${String(adminCustomers.length + 1).padStart(3, '0')}`;
  const newCust = {
    id: newId,
    name: payload.name || 'New Customer',
    username: payload.username || `user_${newId}`,
    phone: payload.phone || '01700000000',
    email: payload.email,
    packageId: payload.packageId || 'pkg_10',
    packageName: payload.packageName || 'Home 10 Mbps',
    areaId: payload.areaId || 'area_uttara',
    areaName: payload.areaName || 'Uttara',
    resellerId: payload.resellerId,
    status: (payload.status || 'active') as typeof customers[0]['status'],
    expiryDate: payload.expiryDate || '2026-10-30',
    balanceBdt: payload.balanceBdt ?? 0,
    connectionType: (payload.connectionType || 'pppoe') as typeof customers[0]['connectionType'],
    macAddress: payload.macAddress || 'AA:BB:CC:DD:EE:FF',
    ipAddress: payload.ipAddress || '103.15.20.100',
    online: true,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  adminCustomers = [newCust, ...adminCustomers];
  return newCust;
}

export async function updateCustomer(id: string, payload: Partial<typeof customers[0]>) {
  await mockDelay();
  const idx = adminCustomers.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Customer not found');
  adminCustomers[idx] = { ...adminCustomers[idx]!, ...payload };
  return adminCustomers[idx]!;
}

export async function deleteCustomer(id: string) {
  await mockDelay();
  adminCustomers = adminCustomers.filter((c) => c.id !== id);
  return { success: true };
}

export async function listExpiredCustomers() {
  await mockDelay();
  const expired = adminCustomers.filter((c) => c.status === 'expired');
  return { items: expired, total: expired.length };
}

export async function createCustomerPayment(payload: Partial<typeof customerPayments[0]>) {
  await mockDelay();
  const newPayment = {
    id: `pay_${String(adminPayments.length + 1).padStart(4, '0')}`,
    customerId: payload.customerId || 'cust_001',
    customerName: payload.customerName || 'Customer',
    amountBdt: Number(payload.amountBdt) || 1000,
    method: (payload.method || 'bkash') as typeof customerPayments[0]['method'],
    status: (payload.status || 'completed') as typeof customerPayments[0]['status'],
    invoiceNo: payload.invoiceNo || `INV-2026-${String(adminPayments.length + 1).padStart(4, '0')}`,
    paidAt: new Date().toISOString(),
    note: payload.note,
  };
  adminPayments = [newPayment, ...adminPayments];
  return newPayment;
}

export async function createPackage(payload: Partial<typeof packages[0]>) {
  await mockDelay();
  const newPkg = {
    id: `pkg_${Date.now()}`,
    name: payload.name || 'New Package',
    speedMbps: Number(payload.speedMbps) || 10,
    priceBdt: Number(payload.priceBdt) || 800,
    validityDays: Number(payload.validityDays) || 30,
    type: (payload.type || 'home') as typeof packages[0]['type'],
    visible: payload.visible !== false,
  };
  adminPackages = [...adminPackages, newPkg];
  return newPkg;
}

export async function updatePackage(id: string, payload: Partial<typeof packages[0]>) {
  await mockDelay();
  const idx = adminPackages.findIndex((p) => p.id === id);
  if (idx !== -1) {
    adminPackages[idx] = { ...adminPackages[idx]!, ...payload };
    return adminPackages[idx]!;
  }
  return payload;
}

export async function deletePackage(id: string) {
  await mockDelay();
  adminPackages = adminPackages.filter((p) => p.id !== id);
  return { success: true };
}

export async function createArea(payload: { name: string; subareas?: string[] }) {
  await mockDelay();
  const newId = `area_${Date.now()}`;
  const subs = (payload.subareas || []).map((name, i) => ({
    id: `sub_${newId}_${i}`,
    name,
    areaCode: name.toUpperCase().slice(0, 3),
    status: 'active' as const,
  }));
  const newArea = { id: newId, name: payload.name, subareas: subs };
  adminAreas = [...adminAreas, newArea];
  return newArea;
}

export async function updateArea(id: string, payload: { name: string }) {
  await mockDelay();
  const idx = adminAreas.findIndex((a) => a.id === id);
  if (idx !== -1) {
    adminAreas[idx] = { ...adminAreas[idx]!, name: payload.name };
    return adminAreas[idx]!;
  }
  return payload;
}

export async function deleteArea(id: string) {
  await mockDelay();
  adminAreas = adminAreas.filter((a) => a.id !== id);
  return { success: true };
}

export async function addSubArea(areaId: string, payload: { name: string; areaCode: string }) {
  await mockDelay();
  const area = adminAreas.find((a) => a.id === areaId);
  if (!area) return { error: 'Area not found' };
  const newSub = {
    id: `sub_${Date.now()}`,
    name: payload.name,
    areaCode: payload.areaCode,
    status: 'active' as const,
  };
  area.subareas = [...area.subareas, newSub];
  return newSub;
}

export async function updateSubArea(areaId: string, subId: string, payload: { name: string; areaCode: string; status: 'active' | 'inactive' }) {
  await mockDelay();
  const area = adminAreas.find((a) => a.id === areaId);
  if (!area) return { error: 'Area not found' };
  const subIdx = area.subareas.findIndex((s) => s.id === subId);
  if (subIdx === -1) return { error: 'Sub-area not found' };
  area.subareas[subIdx] = { ...area.subareas[subIdx]!, ...payload };
  return area.subareas[subIdx]!;
}

export async function deleteSubArea(areaId: string, subId: string) {
  await mockDelay();
  const area = adminAreas.find((a) => a.id === areaId);
  if (!area) return { error: 'Area not found' };
  area.subareas = area.subareas.filter((s) => s.id !== subId);
  return { success: true };
}

export async function createPopFunding(payload: { popId: string; amountBdt: number; note?: string }) {
  await mockDelay();
  const pop = adminPopResellers.find((r) => r.id === payload.popId);
  if (pop) {
    pop.balanceBdt += payload.amountBdt;
  }
  const tx = {
    id: `ptx_${Date.now()}`,
    popId: payload.popId,
    popName: pop?.name || payload.popId,
    type: 'credit' as const,
    amountBdt: payload.amountBdt,
    date: new Date().toISOString().slice(0, 10),
    note: payload.note || 'Admin funding credit',
  };
  adminPopTransactions = [tx, ...adminPopTransactions];
  return { success: true, transaction: tx };
}

export async function rechargeAdminSubscription(payload: { planId: string; method?: string }) {
  await mockDelay();
  const plan = adminSubscriptionPlans.find((p) => p.id === payload.planId);
  if (!plan) throw new Error('Plan not found');
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + plan.validityDays);
  adminTenantSubscription = {
    ...adminTenantSubscription,
    planId: plan.id,
    planName: plan.name,
    priceBdt: plan.priceBdt,
    maxCustomers: plan.maxCustomers,
    status: 'active',
    expiryDate: expiry.toISOString().slice(0, 10),
  };
  const payment = {
    id: `tbill_${Date.now()}`,
    invoiceNo: `IPB-SUB-2026-${String(adminTenantBilling.length + 1).padStart(4, '0')}`,
    amountBdt: plan.priceBdt,
    method: (payload.method || 'bkash') as typeof tenantBillingPayments[0]['method'],
    status: 'completed' as const,
    paidAt: new Date().toISOString(),
    planName: plan.name,
    period: new Date().toLocaleString('en-GB', { month: 'short', year: 'numeric' }),
    note: `Self recharge via ${payload.method || 'bkash'}`,
  };
  adminTenantBilling = [payment, ...adminTenantBilling];
  return { subscription: adminTenantSubscription, payment };
}

export async function getAdminDashboard() {
  await mockDelay();
  return {
    ...adminDashboardStats,
    totalCustomers: adminCustomers.length,
    activeCustomers: adminCustomers.filter((c) => c.status === 'active').length,
    expiredCustomers: adminCustomers.filter((c) => c.status === 'expired').length,
    suspendedCustomers: adminCustomers.filter((c) => c.status === 'suspended').length,
    onlineUsers: adminCustomers.filter((c) => c.online).length,
  };
}

export async function getCustomerDashboard() {
  await mockDelay();
  return { stats: customerDashboardStats, subscription: customerSubscription };
}

export async function getAdminDomain(domain: string) {
  await mockDelay();
  const map: Record<string, unknown> = {
    packages: { items: adminPackages, popPackages: adminPopPackages },
    areas: { items: adminAreas },
    payments: { items: adminPayments },
    accounting,
    hr,
    bandwidth,
    network: {
      ...networkOps,
      popResellers: adminPopResellers,
      popTransactions: adminPopTransactions,
    },
    pop: {
      resellers: adminPopResellers,
      transactions: adminPopTransactions,
    },
    support: { tickets: supportTickets, stats: adminSupportStats },
    freeRequests: freeUserRequests,
    resellerDashboard: resellerDashboardStats,
    subscription: {
      subscription: adminTenantSubscription,
      plans: adminSubscriptionPlans,
    },
    tenantBilling: {
      items: adminTenantBilling,
      summary: {
        ...tenantBillingSummary,
        totalPaidBdt: adminTenantBilling
          .filter((p) => p.status === 'completed')
          .reduce((s, p) => s + p.amountBdt, 0),
        pendingBdt: adminTenantBilling
          .filter((p) => p.status === 'pending')
          .reduce((s, p) => s + p.amountBdt, 0),
      },
    },
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

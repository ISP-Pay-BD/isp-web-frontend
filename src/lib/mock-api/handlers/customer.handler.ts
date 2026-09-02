import { mockDelay } from '../delay';
import { customerSubscription, customerPackages, customerRewards, routerTools, connectedDevices } from '@/data/customer/subscription.data';
import { supportTickets, getTicketById } from '@/data/customer/support.data';
import { newsItems, getNewsById } from '@/data/customer/news.data';
import { customerProfile, customerNotifications } from '@/data/customer/profile.data';
import { getPaymentsByCustomerId } from '@/data/admin/customer-payments.data';
import type { Payment, SupportTicket, NewsItem } from '@/data/shared/types';

export interface CustomerDashboardData {
  subscription: typeof customerSubscription;
  paymentsSummary: {
    totalPaidBdt: number;
    pendingDueBdt: number;
    lastPaymentDate: string;
    recentPayments: Payment[];
  };
  openTicketsCount: number;
  recentTickets: SupportTicket[];
  latestNotices: NewsItem[];
  emergencyContact: {
    phone: string;
    whatsapp: string;
    email: string;
    supportHours: string;
  };
  trafficData: Array<{
    timestamp: string;
    timeLabel: string;
    downloadMbps: number;
    uploadMbps: number;
  }>;
}

export interface CustomerSubscriptionData {
  subscription: typeof customerSubscription;
  routerInfo: {
    pppoeUsername: string;
    routerModel: string;
    ipAddress: string;
    macAddress: string;
  };
  availablePackages: typeof customerPackages;
}

export interface CustomerPaymentsData {
  summary: {
    totalPaidBdt: number;
    pendingDueBdt: number;
    successfulCount: number;
    pendingCount: number;
  };
  payments: Payment[];
}

export interface PayInvoicePayload {
  amount: number;
  method: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'card' | 'bank';
  accountNumber?: string;
  trxId?: string;
}

export interface CreateTicketPayload {
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  message: string;
}

export interface TicketReplyPayload {
  ticketId: string;
  message: string;
}

export interface UpdateWifiPayload {
  ssid: string;
  password: string;
  securityMode?: string;
  hideSsid?: boolean;
}

export interface UpdateProfilePayload {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// In-memory mutable states for session realism
let activeSubscription = { ...customerSubscription };
let activeProfile = { ...customerProfile };
let activeRouterTools = { ...routerTools };
const activeTickets = [...supportTickets];
const activePayments = [...getPaymentsByCustomerId('cust_001')];
let activeRewards = { ...customerRewards };

export async function getCustomerDashboard(): Promise<CustomerDashboardData> {
  await mockDelay(60);

  const customerId = activeProfile.customerId;
  const payments = activePayments.filter((p) => p.customerId === customerId);
  const paidPayments = payments.filter((p) => p.status === 'completed');
  const totalPaidBdt = paidPayments.reduce((sum, p) => sum + p.amountBdt, 0);
  const pendingDueBdt = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amountBdt, 0);

  const userTickets = activeTickets.filter((t) => t.customerId === customerId);
  const openTickets = userTickets.filter((t) => t.status === 'open' || t.status === 'pending');

  const now = new Date();
  const trafficData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getTime() - (11 - i) * 5 * 60 * 1000);
    const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const base = activeSubscription.speedMbps;
    const jitterDown = Math.max(1, +(base * (0.6 + Math.sin(i * 0.8) * 0.35)).toFixed(1));
    const jitterUp = Math.max(0.5, +(base * (0.3 + Math.cos(i * 0.7) * 0.2)).toFixed(1));
    return {
      timestamp: d.toISOString(),
      timeLabel,
      downloadMbps: jitterDown,
      uploadMbps: jitterUp,
    };
  });

  return {
    subscription: activeSubscription,
    paymentsSummary: {
      totalPaidBdt,
      pendingDueBdt,
      lastPaymentDate: paidPayments[0]?.paidAt ?? activeSubscription.startDate,
      recentPayments: payments.slice(0, 5),
    },
    openTicketsCount: openTickets.length,
    recentTickets: userTickets.slice(0, 4),
    latestNotices: newsItems.slice(0, 4),
    emergencyContact: {
      phone: '01700-000000',
      whatsapp: '01700000000',
      email: 'support@demo.isppaybd.com',
      supportHours: '24/7 Helpline & Network NOC',
    },
    trafficData,
  };
}

export async function getCustomerSubscription(): Promise<CustomerSubscriptionData> {
  await mockDelay(60);
  return {
    subscription: activeSubscription,
    routerInfo: {
      pppoeUsername: activeProfile.username,
      routerModel: activeRouterTools.routerModel,
      ipAddress: activeProfile.ipAddress,
      macAddress: activeProfile.macAddress,
    },
    availablePackages: customerPackages,
  };
}

export async function renewSubscription(packageId?: string) {
  await mockDelay(100);
  if (packageId) {
    const pkg = customerPackages.find((p) => p.id === packageId);
    if (pkg) {
      activeSubscription = {
        ...activeSubscription,
        packageId: pkg.id,
        packageName: pkg.name,
        speedMbps: pkg.speedMbps,
        priceBdt: pkg.priceBdt,
        status: 'active',
        expiryDate: '2026-11-01',
      };
    }
  } else {
    activeSubscription = {
      ...activeSubscription,
      status: 'active',
      expiryDate: '2026-11-01',
    };
  }

  return { success: true, message: 'Subscription successfully recharged!', subscription: activeSubscription };
}

export async function getCustomerPackages() {
  await mockDelay(50);
  return {
    currentPackageId: activeSubscription.packageId,
    packages: customerPackages,
  };
}

export async function getCustomerPayments(): Promise<CustomerPaymentsData> {
  await mockDelay(60);
  const payments = activePayments;
  const totalPaidBdt = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amountBdt, 0);
  const pendingDueBdt = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amountBdt, 0);

  return {
    summary: {
      totalPaidBdt,
      pendingDueBdt,
      successfulCount: payments.filter((p) => p.status === 'completed').length,
      pendingCount: payments.filter((p) => p.status === 'pending').length,
    },
    payments,
  };
}

export async function payCustomerInvoice(payload: PayInvoicePayload) {
  await mockDelay(150);
  const newPay: Payment = {
    id: `pay_${Date.now()}`,
    customerId: activeProfile.customerId,
    customerName: activeProfile.name,
    amountBdt: payload.amount,
    method: payload.method as Payment['method'],
    status: 'completed',
    invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    paidAt: new Date().toISOString(),
    note: payload.trxId ? `TrxID: ${payload.trxId}` : `Instant gateway recharge via ${payload.method}`,
  };

  activePayments.unshift(newPay);
  activeSubscription = {
    ...activeSubscription,
    status: 'active',
    expiryDate: '2026-11-01',
  };

  return {
    success: true,
    message: `Payment of ৳${payload.amount.toLocaleString()} completed successfully!`,
    payment: newPay,
  };
}

export async function getCustomerSupportTickets() {
  await mockDelay(60);
  return {
    tickets: activeTickets.filter((t) => t.customerId === activeProfile.customerId),
  };
}

export async function getCustomerTicket(id: string) {
  await mockDelay(50);
  const ticket = activeTickets.find((t) => t.id === id) ?? getTicketById(id);
  if (!ticket) throw new Error('Ticket not found');
  return ticket;
}

export async function createCustomerTicket(payload: CreateTicketPayload) {
  await mockDelay(120);
  const newTicket: SupportTicket = {
    id: `tkt_${String(activeTickets.length + 1).padStart(3, '0')}`,
    subject: `[${payload.category}] ${payload.subject}`,
    status: 'open',
    priority: payload.priority,
    customerId: activeProfile.customerId,
    customerName: activeProfile.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: `msg_${Date.now()}`,
        sender: 'customer',
        senderName: activeProfile.name,
        body: payload.message,
        sentAt: new Date().toISOString(),
      },
    ],
  };

  activeTickets.unshift(newTicket);
  return { success: true, message: 'Support ticket submitted successfully!', ticket: newTicket };
}

export async function replyCustomerTicket(payload: TicketReplyPayload) {
  await mockDelay(80);
  const ticket = activeTickets.find((t) => t.id === payload.ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const newMsg = {
    id: `msg_${Date.now()}`,
    sender: 'customer' as const,
    senderName: activeProfile.name,
    body: payload.message,
    sentAt: new Date().toISOString(),
  };

  ticket.messages.push(newMsg);
  ticket.updatedAt = new Date().toISOString();
  if (ticket.status === 'closed') {
    ticket.status = 'open';
  }

  return { success: true, message: 'Reply sent successfully!', messageObj: newMsg };
}

export async function getCustomerRewards() {
  await mockDelay(50);
  return activeRewards;
}

export async function redeemCustomerRewards(points: number) {
  await mockDelay(100);
  if (points > activeRewards.pointsBalance) {
    throw new Error('Insufficient points balance');
  }
  const discountBdt = Math.floor(points / 2);
  activeRewards = {
    ...activeRewards,
    pointsBalance: activeRewards.pointsBalance - points,
    transactions: [
      {
        id: `rw_${Date.now()}`,
        type: 'redeem',
        points: -points,
        label: `Bill discount redemption (৳${discountBdt})`,
        date: new Date().toISOString().split('T')[0]!,
      },
      ...activeRewards.transactions,
    ],
  };

  return {
    success: true,
    discountBdt,
    remainingPoints: activeRewards.pointsBalance,
    message: `Redeemed ${points} points for ৳${discountBdt} bill discount voucher!`,
  };
}

export async function getCustomerNews() {
  await mockDelay(40);
  return { items: newsItems };
}

export async function getCustomerNewsDetails(id: string) {
  await mockDelay(40);
  const item = getNewsById(id);
  if (!item) throw new Error('Announcement not found');
  return item;
}

export async function getCustomerRouterInfo() {
  await mockDelay(60);
  return {
    router: activeRouterTools,
    connectedDevices,
    ipAddress: activeProfile.ipAddress,
    macAddress: activeProfile.macAddress,
    connectionStatus: activeSubscription.status === 'active' ? 'online' : 'offline',
  };
}

export async function runRouterQuickFix(actionId: string) {
  await mockDelay(250);
  activeRouterTools = {
    ...activeRouterTools,
    lastReconnect: new Date().toISOString(),
  };
  const actionLabels: Record<string, string> = {
    reset_session: 'PPPoE session successfully refreshed with MikroTik NAS.',
    reconnect: 'Physical fiber line and session re-established.',
    dns_flush: 'Local and gateway DNS caches flushed cleanly.',
    quick_fix: 'Diagnostics completed: latency 4ms, 0% packet loss.',
  };
  return {
    success: true,
    message: actionLabels[actionId] ?? 'Diagnostic tool completed successfully!',
    timestamp: new Date().toISOString(),
  };
}

export async function updateCustomerWifi(payload: UpdateWifiPayload) {
  await mockDelay(180);
  activeRouterTools = {
    ...activeRouterTools,
    wifiSsid: payload.ssid,
  };
  return {
    success: true,
    message: 'WiFi SSID and WPA2 security passphrase updated successfully! Connected devices will re-authenticate.',
    wifiSsid: payload.ssid,
  };
}

export async function getCustomerProfile() {
  await mockDelay(40);
  return {
    profile: activeProfile,
    notifications: customerNotifications,
  };
}

export async function updateCustomerProfile(payload: UpdateProfilePayload) {
  await mockDelay(100);
  activeProfile = {
    ...activeProfile,
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
  };
  return {
    success: true,
    message: 'Profile contact details updated successfully!',
    profile: activeProfile,
  };
}

export async function changeCustomerPassword(payload: ChangePasswordPayload) {
  await mockDelay(150);
  if (!payload.currentPassword) {
    throw new Error('Current password is required');
  }
  if (payload.newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }
  if (payload.newPassword !== payload.confirmPassword) {
    throw new Error('New passwords do not match');
  }

  return {
    success: true,
    message: 'Account password changed successfully! Please use your new password next time.',
  };
}

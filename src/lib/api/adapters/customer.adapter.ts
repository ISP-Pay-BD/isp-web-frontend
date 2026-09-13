import type {
  CustomerDashboardData,
  CustomerSubscriptionData,
  CustomerPaymentsData,
} from '@/lib/mock-api/handlers/customer.handler';
import { customerSubscription, customerPackages } from '@/data/customer/subscription.data';
import { newsItems } from '@/data/customer/news.data';
import { customerProfile } from '@/data/customer/profile.data';
import type { Payment, SupportTicket, PaymentMethod, PaymentStatus } from '@/data/shared/types';

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

/**
 * Maps the real backend payload of `GET /api/v1/customer/users/{id}`:
 * `{ pppoe, details, package, payment_received, payment_pending, payment_failed,
 *    payment_total, total_support_ticket, statistics, admin_details, notices }`
 * Also tolerates the older `{ user, subscription, payments }` shape.
 */
export function transformBackendCustomerDashboard(raw: Record<string, unknown>): CustomerDashboardData {
  const details = asRecord(raw.details || raw.user || raw.subscriber || raw);
  const pkg = asRecord(raw.package);
  const legacySubscription = asRecord(raw.subscription);
  const legacyPayments = asRecord(raw.payments || raw.payments_summary);
  const admin = asRecord(raw.admin_details);

  const sub: typeof customerSubscription = {
    ...customerSubscription,
    userId: String(details.id || customerSubscription.userId),
    packageId: String(details.package_id || pkg.id || customerSubscription.packageId),
    packageName: String(pkg.name || legacySubscription.package_name || details.package_name || customerSubscription.packageName),
    speedMbps: Number(pkg.speed || pkg.speed_mbps || legacySubscription.speed_mbps || details.speed || customerSubscription.speedMbps),
    priceBdt: Number(pkg.amount || pkg.price || pkg.monthly_fee || legacySubscription.amount || customerSubscription.priceBdt),
    status: 'active',
    expiryDate: String(details.will_expire || legacySubscription.expire_date || details.expire_date || customerSubscription.expiryDate),
  };

  const recoveryPayments = Array.isArray(raw.recent_payments)
    ? (raw.recent_payments as Payment[])
    : ((legacyPayments.recent_payments || legacyPayments.recentPayments || []) as Payment[]);

  const paymentsSummary = {
    totalPaidBdt: Number(
      raw.payment_received || legacyPayments.total_paid || legacyPayments.totalPaidBdt || 0,
    ),
    pendingDueBdt: Number(
      raw.payment_pending ?? legacyPayments.pending_due ?? legacyPayments.pendingDueBdt ?? 0,
    ),
    lastPaymentDate: String(
      legacyPayments.last_payment_date || legacyPayments.lastPaymentDate || details.last_paid || '',
    ),
    recentPayments: recoveryPayments,
  };

  const openTickets = Array.isArray(raw.recent_tickets)
    ? (raw.recent_tickets as unknown as SupportTicket[])
    : [];

  return {
    subscription: sub,
    paymentsSummary,
    openTicketsCount: Number(raw.total_support_ticket ?? raw.open_tickets_count ?? 0),
    recentTickets: openTickets.slice(0, 4),
    latestNotices: Array.isArray(raw.notices) ? (raw.notices as typeof newsItems) : newsItems.slice(0, 4),
    emergencyContact: {
      phone: String(admin.phone || admin.mobile || raw.support_phone || '01700-000000'),
      whatsapp: String(admin.whatsapp || admin.phone || raw.support_whatsapp || '01700000000'),
      email: String(admin.email || raw.support_email || 'support@demo.isppaybd.com'),
      supportHours: '24/7 Helpline & Network NOC',
    },
    trafficData: Array.isArray(raw.traffic_data)
      ? (raw.traffic_data as CustomerDashboardData['trafficData'])
      : [
          { timestamp: '00:00', timeLabel: '12 AM', downloadMbps: 12.4, uploadMbps: 4.1 },
          { timestamp: '04:00', timeLabel: '4 AM', downloadMbps: 5.2, uploadMbps: 1.8 },
          { timestamp: '08:00', timeLabel: '8 AM', downloadMbps: 18.9, uploadMbps: 8.2 },
          { timestamp: '12:00', timeLabel: '12 PM', downloadMbps: 35.1, uploadMbps: 14.7 },
          { timestamp: '16:00', timeLabel: '4 PM', downloadMbps: 28.6, uploadMbps: 11.3 },
          { timestamp: '20:00', timeLabel: '8 PM', downloadMbps: 45.8, uploadMbps: 18.2 },
        ],
  };
}

/**
 * Maps the customer profile out of the `details` block returned by
 * `GET /api/v1/customer/users/{id}` into the shape the profile page expects.
 */
export function transformBackendCustomerProfile(raw: Record<string, unknown>): typeof customerProfile {
  const details = asRecord(raw.details || raw.user || raw.subscriber || raw);
  const name = String(details.name || details.full_name || customerProfile.name);

  return {
    ...customerProfile,
    userId: String(details.id || customerProfile.userId),
    customerId: String(details.id || customerProfile.customerId),
    name,
    username: String(details.username || customerProfile.username),
    phone: String(details.phone || details.mobile || customerProfile.phone),
    email: String(details.email || customerProfile.email),
    address: String(details.address || customerProfile.address),
    addressBn: String(details.address_bn || customerProfile.addressBn),
    nid: String(details.nid || customerProfile.nid),
    areaName: String(details.area_name || details.area || customerProfile.areaName),
    connectionType: 'pppoe',
    macAddress: String(details.mac_address || customerProfile.macAddress),
    ipAddress: String(details.static_ip || details.ip || customerProfile.ipAddress),
    createdAt: String(details.created_at || customerProfile.createdAt),
    avatarInitials: name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  };
}

export function transformBackendCustomerSubscription(raw: Record<string, unknown>): CustomerSubscriptionData {
  const subRaw = (raw.subscription || raw) as Record<string, unknown>;
  const routerRaw = (raw.router || raw.router_info || {}) as Record<string, unknown>;

  return {
    subscription: {
      ...customerSubscription,
      packageName: String(subRaw.package_name || customerSubscription.packageName),
      speedMbps: Number(subRaw.speed || customerSubscription.speedMbps),
      priceBdt: Number(subRaw.amount || subRaw.price || customerSubscription.priceBdt),
      status: 'active',
      expiryDate: String(subRaw.expire_date || subRaw.will_expire || customerSubscription.expiryDate),
    },
    routerInfo: {
      pppoeUsername: String(routerRaw.pppoe_id || routerRaw.username || 'demo_001'),
      routerModel: String(routerRaw.model || routerRaw.router_model || 'MikroTik hAP ac2'),
      ipAddress: String(routerRaw.ip || routerRaw.ip_address || '103.145.112.45'),
      macAddress: String(routerRaw.mac || routerRaw.mac_address || 'AA:11:22:33:44:01'),
    },
    availablePackages: Array.isArray(raw.packages)
      ? (raw.packages as typeof customerPackages)
      : customerPackages,
  };
}

export function transformBackendCustomerPayments(raw: Record<string, unknown>): CustomerPaymentsData {
  const source = raw.payments || raw.data || raw;
  const list = Array.isArray(source) ? (source as Record<string, unknown>[]) : [];

  const payments: Payment[] = list.map((p, idx) => {
    const rawMethod = String(p.payment_type || p.method || 'bkash').toLowerCase();
    const method: PaymentMethod = (['bkash', 'nagad', 'cash', 'bank', 'sslcommerz'].includes(rawMethod)
      ? rawMethod
      : 'bkash') as PaymentMethod;

    const rawStatus = String(p.status || '').toLowerCase();
    const status: PaymentStatus = (rawStatus === 'completed' || rawStatus === 'success' || rawStatus === 'paid'
      ? 'completed'
      : rawStatus === 'failed'
        ? 'failed'
        : 'pending') as PaymentStatus;

    return {
      id: String(p.id || `pay_${idx + 1}`),
      customerId: String(p.user_id || p.customer_id || 'cust_001'),
      customerName: String(p.customer_name || 'Customer'),
      amountBdt: Number(p.amount || p.amount_bdt || 0),
      method,
      status,
      invoiceNo: String(p.invoice_no || p.invoice_id || `INV-2026-${1000 + idx}`),
      paidAt: String(p.date || p.paid_at || p.created_at || new Date().toISOString()),
      note: p.note || p.notes ? String(p.note || p.notes) : undefined,
    };
  });

  const totalPaid = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amountBdt, 0);

  return {
    summary: {
      totalPaidBdt: totalPaid,
      pendingDueBdt: 0,
      successfulCount: payments.filter((p) => p.status === 'completed').length,
      pendingCount: payments.filter((p) => p.status === 'pending').length,
    },
    payments,
  };
}

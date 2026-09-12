import type {
  CustomerDashboardData,
  CustomerSubscriptionData,
  CustomerPaymentsData,
} from '@/lib/mock-api/handlers/customer.handler';
import { customerSubscription, customerPackages } from '@/data/customer/subscription.data';
import { supportTickets } from '@/data/customer/support.data';
import { newsItems } from '@/data/customer/news.data';
import type { Payment, SupportTicket, PaymentMethod, PaymentStatus } from '@/data/shared/types';

export function transformBackendCustomerDashboard(raw: Record<string, unknown>): CustomerDashboardData {
  const user = (raw.user || raw.subscriber || raw) as Record<string, unknown>;
  const subscriptionRaw = (raw.subscription || {}) as Record<string, unknown>;
  const paymentsRaw = (raw.payments || raw.payments_summary || {}) as Record<string, unknown>;

  const sub: typeof customerSubscription = {
    ...customerSubscription,
    packageName: String(subscriptionRaw.package_name || user.package_name || customerSubscription.packageName),
    speedMbps: Number(subscriptionRaw.speed_mbps || user.speed || customerSubscription.speedMbps),
    priceBdt: Number(subscriptionRaw.amount || subscriptionRaw.monthly_fee || customerSubscription.priceBdt),
    status: 'active',
    expiryDate: String(subscriptionRaw.expire_date || user.will_expire || customerSubscription.expiryDate),
  };

  const paymentsSummary = {
    totalPaidBdt: Number(paymentsRaw.total_paid || paymentsRaw.totalPaidBdt || 4800),
    pendingDueBdt: Number(paymentsRaw.pending_due || paymentsRaw.pendingDueBdt || 0),
    lastPaymentDate: String(paymentsRaw.last_payment_date || paymentsRaw.lastPaymentDate || '2026-03-01'),
    recentPayments: (paymentsRaw.recent_payments || paymentsRaw.recentPayments || []) as Payment[],
  };

  const openTickets = Array.isArray(raw.recent_tickets)
    ? (raw.recent_tickets as unknown as SupportTicket[])
    : supportTickets;

  return {
    subscription: sub,
    paymentsSummary,
    openTicketsCount: Number(raw.open_tickets_count || 0),
    recentTickets: openTickets.slice(0, 4),
    latestNotices: Array.isArray(raw.notices) ? (raw.notices as typeof newsItems) : newsItems.slice(0, 4),
    emergencyContact: {
      phone: String(raw.support_phone || '01700-000000'),
      whatsapp: String(raw.support_whatsapp || '01700000000'),
      email: String(raw.support_email || 'support@demo.isppaybd.com'),
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
  const list = Array.isArray(raw.payments || raw.data || raw)
    ? ((raw.payments || raw.data || raw) as Record<string, unknown>[])
    : [];

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
      totalPaidBdt: totalPaid || 4800,
      pendingDueBdt: 0,
      successfulCount: payments.filter((p) => p.status === 'completed').length,
      pendingCount: payments.filter((p) => p.status === 'pending').length,
    },
    payments,
  };
}

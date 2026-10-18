import { describe, it, expect } from 'vitest';
import {
  mapCustomerDashboard,
  mapCustomerSubscription,
  mapCustomerPayment,
  mapCustomerTicket,
  mapCustomerCheckout,
  mapRouterActionResult,
} from '@/lib/api/adapters/customer.adapter';

describe('customer.adapter', () => {
  it('maps GET /v1/customer/dashboard (nested home aggregate)', () => {
    const result = mapCustomerDashboard({
      user_id: 42,
      role: 'user',
      customer: {
        id: 42,
        package_id: 7,
        name: 'Rahim Uddin',
        phone: '01711000000',
        username: 'rahim_pppoe',
        package_name: 'Home 20',
        balance_cents: 12345,
        expires_at: '2026-12-31 23:59:59',
        status: 'active',
      },
      package: { id: 7, package_name: 'Home 20', bandwidth: '20', price: '1200.00' },
      subscription: { package_id: 7, status: 'inactive', expires_at: '2026-12-31 23:59:59', pppoe_id: 'rahim_pppoe' },
      recent_payments: [{ id: 9, invoice: 'INV-1', amount: '1200', status: 'successful', paid_via: 'bkash', method_trx: 'TX1' }],
      router: { id: 3, name: 'POP-1', status: 'active' },
      open_tickets: [{ id: 5, subject: 'Slow', status: 'opened', priority: 'high', datetime: '2026-10-01, 10:00:00' }],
    });

    expect(result.name).toBe('Rahim Uddin');
    expect(result.subscriptionStatus).toBe('inactive');
    expect(result.isActive).toBe(false);
    expect(result.package).toMatchObject({ id: '7', name: 'Home 20', bandwidth: '20 Mbps', priceBdt: 1200 });
    expect(result.balanceBdt).toBeCloseTo(123.45);
    expect(result.recentPayments[0]).toMatchObject({ status: 'paid', method: 'bkash', trxId: 'TX1', invoice: 'INV-1' });
    expect(result.openTickets[0].status).toBe('open');
    expect(result.router).toEqual({ name: 'POP-1', status: 'active' });
  });

  it('maps GET /v1/customer/subscription/index without inventing router data', () => {
    const result = mapCustomerSubscription({
      details: { id: 42, name: 'Rahim', mobile: '017', nid_number: '123', will_expire: '2026-12-31 00:00:00', conn_status: 'conn' },
      packages: [
        { id: 7, package_name: 'Home 20', bandwidth: '20Mbps', price: 1200 },
        { id: 8, package_name: 'Home 40', bandwidth: '40', price: 1800 },
      ],
      package_id: 7,
      pending_package_id: 8,
      subscription_status: 'active',
    });

    expect(result.isActive).toBe(true);
    expect(result.currentPackage?.name).toBe('Home 20');
    expect(result.currentPackage?.bandwidth).toBe('20Mbps');
    expect(result.pendingPackage?.priceBdt).toBe(1800);
    expect(result.account.nidNumber).toBe('123');
  });

  it('maps payment rows: successful = paid, paid_via = method, placeholders are empty', () => {
    const result = mapCustomerPayment({ id: 1, invoice: 'INV-9', amount: '500', status: 'successful', paid_via: '--', method_trx: '--' });
    expect(result).toMatchObject({ status: 'paid', invoice: 'INV-9', amountBdt: 500, method: '', trxId: '' });
  });

  it('maps ticket messages {sender, msg, datetime} and marks the caller’s own', () => {
    const ticket = mapCustomerTicket(
      {
        id: 5,
        subject: 'No internet',
        status: 'processing',
        details: JSON.stringify([
          { sender: '42', msg: 'Down since morning', datetime: '01-10-26, 09:00 am' },
          { sender: '2', msg: 'Checking', datetime: '01-10-26, 09:30 am' },
        ]),
      },
      '42',
    );
    expect(ticket.status).toBe('pending');
    expect(ticket.messages.map((m) => m.fromMe)).toEqual([true, false]);
    expect(ticket.messages[1].body).toBe('Checking');
  });

  it('resolves the renew payment page against the backend origin', () => {
    const checkout = mapCustomerCheckout({ msg: 'Invoice created', payment_url: '/payment/make-payment/12', payment_id: '12' });
    expect(checkout.paymentId).toBe('12');
    expect(checkout.paymentUrl).toMatch(/^https?:\/\/.+\/payment\/make-payment\/12$/);
  });

  it('reports router cooldown and manual steps from the backend result', () => {
    const result = mapRouterActionResult({ status: 'pending', transport_used: 'cooldown', message: 'wait', steps: ['a'] });
    expect(result).toMatchObject({ status: 'pending', isCooldown: true, message: 'wait', steps: ['a'] });
  });
});

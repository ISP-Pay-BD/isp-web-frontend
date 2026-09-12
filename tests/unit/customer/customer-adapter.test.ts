import { describe, it, expect } from 'vitest';
import {
  transformBackendCustomerDashboard,
  transformBackendCustomerSubscription,
  transformBackendCustomerPayments,
} from '@/lib/api/adapters/customer.adapter';

describe('customer.adapter', () => {
  it('transforms backend customer dashboard response into frontend format', () => {
    const backendData = {
      user: {
        package_name: 'Platinum 100M',
        speed: 100,
        conn_status: 'active',
        will_expire: '2026-12-31',
      },
      subscription: {
        amount: 2500,
      },
      payments: {
        total_paid: 7500,
        pending_due: 0,
        last_payment_date: '2026-03-01',
      },
      open_tickets_count: 2,
    };

    const result = transformBackendCustomerDashboard(backendData);
    expect(result.subscription.packageName).toBe('Platinum 100M');
    expect(result.subscription.speedMbps).toBe(100);
    expect(result.subscription.priceBdt).toBe(2500);
    expect(result.paymentsSummary.totalPaidBdt).toBe(7500);
    expect(result.openTicketsCount).toBe(2);
    expect(result.emergencyContact.phone).toBeDefined();
  });

  it('transforms backend subscription payload accurately', () => {
    const raw = {
      subscription: {
        package_name: 'Diamond Fiber',
        speed: 80,
        price: 1800,
        status: 'active',
        expire_date: '2026-04-15',
      },
      router: {
        pppoe_id: 'pppoe_shohan_01',
        router_model: 'MikroTik hAP ac2',
        ip_address: '103.145.112.99',
        mac_address: 'CC:2D:E0:11:22:33',
      },
    };

    const result = transformBackendCustomerSubscription(raw);
    expect(result.subscription.packageName).toBe('Diamond Fiber');
    expect(result.subscription.speedMbps).toBe(80);
    expect(result.routerInfo.pppoeUsername).toBe('pppoe_shohan_01');
    expect(result.routerInfo.routerModel).toBe('MikroTik hAP ac2');
  });

  it('transforms backend payments array and computes summary', () => {
    const raw = {
      payments: [
        { id: '1', invoice_no: 'INV-101', amount: 1500, payment_type: 'bkash', status: 'success', date: '2026-03-01' },
        { id: '2', invoice_no: 'INV-102', amount: 1500, payment_type: 'nagad', status: 'success', date: '2026-02-01' },
      ],
    };

    const result = transformBackendCustomerPayments(raw);
    expect(result.payments).toHaveLength(2);
    expect(result.summary.totalPaidBdt).toBe(3000);
    expect(result.summary.successfulCount).toBe(2);
  });
});

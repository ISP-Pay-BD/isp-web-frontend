import { describe, it, expect } from 'vitest';
import {
  transformBackendCustomer,
  transformBackendDashboardStats,
  transformBackendArea,
} from '@/lib/api/adapters/admin.adapter';

describe('admin.adapter', () => {
  it('transforms backend customer payload into frontend Customer model', () => {
    const raw = {
      id: 55,
      name: 'Tanvir Hossain',
      pppoe_id: '*920', // MikroTik internal id, not the login
      pppoe_name: 'tanvir_uttara',
      mobile: '01812345678',
      email: 'tanvir@gmail.com',
      conn_status: 'active',
      will_expire: '2026-11-30',
      balance: 1500,
      area_name: 'Uttara Sector 11',
      package_name: 'Speed 50 Mbps',
    };

    const customer = transformBackendCustomer(raw);
    expect(customer.id).toBe('55');
    expect(customer.name).toBe('Tanvir Hossain');
    expect(customer.username).toBe('tanvir_uttara');
    expect(customer.phone).toBe('01812345678');
    expect(customer.status).toBe('active');
    expect(customer.expiryDate).toBe('2026-11-30');
    expect(customer.balanceBdt).toBe(1500);
    expect(customer.areaName).toBe('Uttara Sector 11');
    expect(customer.packageName).toBe('Speed 50 Mbps');
  });

  it('transforms backend dashboard metrics correctly (real payload keys, no sample fallbacks)', () => {
    const raw = {
      total_customers: 250,
      users_active: 230,
      users_expired: 20,
      today_collection: 45000,
      customers_payment_received: 550000,
      pop_online: 185,
      ticket_stats: { open: 2, ongoing: 1, solved: 6, closed: 1, total: 10 },
      customer_payment_statistics: { months: ['Jan', 'Feb'], successful: [100, 200], pending: [10, 0], failed: [0, 0] },
      routers: [{ id: 1, name: 'Core', host: '10.0.0.1', users_total: 5, users_online: 3, users_offline: 2 }],
      geo_revenue: [{ area_name: 'Mirpur', customer_count: 4, active_count: 3, revenue: 1200 }],
    };

    const stats = transformBackendDashboardStats(raw);
    expect(stats.totalCustomers).toBe(250);
    expect(stats.activeCustomers).toBe(230);
    expect(stats.todayCollectionBdt).toBe(45000);
    expect(stats.monthlyCollectionBdt).toBe(550000);
    expect(stats.connectedCustomers).toBe(185);
    expect(stats.ticketStats.solvedRate).toBe(70);
    expect(stats.monthlyTrend).toEqual([
      { month: 'Jan', collected: 100, pending: 10 },
      { month: 'Feb', collected: 200, pending: 0 },
    ]);
    expect(stats.routers[0]).toMatchObject({ totalUsers: 5, activeUsers: 3, inactiveUsers: 2 });
    expect(stats.geoRevenue[0]).toEqual({ area: 'Mirpur', revenueBdt: 1200, customers: 4, active: 3 });
    // Nothing invented when the backend sends nothing.
    const empty = transformBackendDashboardStats({});
    expect(empty.paymentMethods).toEqual([]);
    expect(empty.routers).toEqual([]);
    expect(empty.customerQuota).toBeNull();
  });

  it('transforms backend area and subareas correctly', () => {
    // Real zapi rows: areas.id / areas.area_name; sub_areas use area_name too.
    const raw = {
      id: 12,
      area_name: 'Mirpur',
      subareas: [
        { id: 1, area_name: 'Section 1', area_code: 'MIR-1', status: 'active' },
        { id: 2, area_name: 'Section 2', area_code: 'MIR-2', status: 'active' },
      ],
    };

    const area = transformBackendArea(raw);
    expect(area.id).toBe('12');
    expect(area.name).toBe('Mirpur');
    expect(area.subareas).toHaveLength(2);
    expect(area.subareas[0].name).toBe('Section 1');
  });
});

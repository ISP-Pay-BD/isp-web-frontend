import { describe, it, expect } from 'vitest';
import {
  transformBackendCustomer,
  transformBackendCustomersList,
  transformBackendDashboardStats,
  transformBackendArea,
} from '@/lib/api/adapters/admin.adapter';

describe('admin.adapter', () => {
  it('transforms backend customer payload into frontend Customer model', () => {
    const raw = {
      id: 55,
      name: 'Tanvir Hossain',
      pppoe_id: 'tanvir_uttara',
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

  it('transforms backend dashboard metrics correctly', () => {
    const raw = {
      total_customers: 250,
      active_customers: 230,
      expired_customers: 20,
      today_collection: 45000,
      monthly_collection: 550000,
      online_users: 185,
    };

    const stats = transformBackendDashboardStats(raw);
    expect(stats.totalCustomers).toBe(250);
    expect(stats.activeCustomers).toBe(230);
    expect(stats.todayCollectionBdt).toBe(45000);
    expect(stats.onlineUsers).toBe(185);
  });

  it('transforms backend area and subareas correctly', () => {
    const raw = {
      area_id: 12,
      area_name: 'Mirpur',
      subareas: [
        { id: 1, subarea_name: 'Section 1', area_code: 'MIR-1', status: 'active' },
        { id: 2, subarea_name: 'Section 2', area_code: 'MIR-2', status: 'active' },
      ],
    };

    const area = transformBackendArea(raw);
    expect(area.id).toBe('12');
    expect(area.name).toBe('Mirpur');
    expect(area.subareas).toHaveLength(2);
    expect(area.subareas[0].name).toBe('Section 1');
  });
});

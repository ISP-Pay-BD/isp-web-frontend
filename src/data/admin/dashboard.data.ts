import { customers } from './customers.data';
import { monthlyCollectionBdt, todayCollectionBdt } from './customer-payments.data';
import { dailyChart } from '../shared/generators';

export const adminDashboardStats = {
  totalCustomers: customers.length,
  activeCustomers: customers.filter((c) => c.status === 'active').length,
  expiredCustomers: customers.filter((c) => c.status === 'expired').length,
  suspendedCustomers: customers.filter((c) => c.status === 'suspended').length,
  todayCollectionBdt: todayCollectionBdt || 45200,
  monthlyCollectionBdt: monthlyCollectionBdt || 1285000,
  onlineUsers: customers.filter((c) => c.online).length,
  newCustomersThisMonth: 28,
  pendingTickets: 7,
  chartData: dailyChart(14, 42000, 4),
  revenueByPackage: [
    { package: 'Home 20 Mbps', amountBdt: 420000 },
    { package: 'Home 10 Mbps', amountBdt: 280000 },
    { package: 'Home 50 Mbps', amountBdt: 198000 },
    { package: 'Corporate 50 Mbps', amountBdt: 150000 },
  ],
  recentActivities: [
    { id: 'act_1', text: 'Payment ৳1,200 received from Rahim Uddin (bKash)', time: '2 min ago' },
    { id: 'act_2', text: 'New customer registered — Mirpur 10', time: '15 min ago' },
    { id: 'act_3', text: 'MikroTik sync completed — 80 users updated', time: '1 hr ago' },
    { id: 'act_4', text: 'POP Uttara funding ৳50,000 credited', time: '3 hr ago' },
    { id: 'act_5', text: 'SMS blast sent — 120 expiry reminders', time: '5 hr ago' },
  ],
};

export const customerDashboardStats = {
  packageName: 'Home 20 Mbps',
  speedMbps: 20,
  expiryDate: '2026-10-15',
  daysRemaining: 43,
  quotaUsedGb: 128.4,
  quotaTotalGb: 500,
  online: true,
  uploadMbps: 18.2,
  downloadMbps: 19.6,
  lastPaymentBdt: 1200,
  lastPaymentDate: '2026-09-01',
  uptimeHours: 168,
};

export const resellerDashboardStats = {
  totalCustomers: customers.filter((c) => c.resellerId === 'pop_uttara').length,
  activeCustomers: 280,
  todayCollectionBdt: 18500,
  popBalanceBdt: 85000,
  chartData: dailyChart(7, 15000, 2),
};

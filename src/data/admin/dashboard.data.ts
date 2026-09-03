import { customers } from './customers.data';
import { monthlyCollectionBdt, todayCollectionBdt } from './customer-payments.data';
import { dailyChart } from '../shared/generators';

export const adminDashboardStats = {
  totalCustomers: customers.length,
  activeCustomers: customers.filter((c) => c.status === 'active').length || 248,
  expiredCustomers: customers.filter((c) => c.status === 'expired').length || 18,
  suspendedCustomers: customers.filter((c) => c.status === 'suspended').length || 8,
  newCustomers: 28,
  inactiveCustomers: 14,
  todayCollectionBdt: todayCollectionBdt || 45200,
  monthlyCollectionBdt: monthlyCollectionBdt || 1285000,
  customersPaymentReceivedCount: 840,
  customersExpaymentTotal: 54000,
  customersExpaymentCount: 45,
  customersPaymentTotal: 1450000,
  customersPaymentPending: 165000,
  onlineUsers: customers.filter((c) => c.online).length || 215,
  newCustomersThisMonth: 28,
  pendingTickets: 7,
  customerQuota: {
    used: 248,
    limit: 500,
    percent: 49.6,
  },
  efficiencyRate: 92.8,
  retentionRate: 96.2,
  weeklyGrowth: 8.4,
  totalDataGb: 48250.5,
  // Section: Package & Service Metrics
  totalPackages: 12,
  totalAreas: 8,
  // Section: Employee Metrics
  employeeActive: 18,
  employeeInactive: 2,
  employeePaymentReceived: 385000,
  employeePaymentPending: 45000,
  // Section: Network & Router Metrics
  routerActive: 6,
  routerInactive: 1,
  allResellers: 12,
  // Router / POP Live Sessions
  routers: [
    {
      id: 1,
      name: 'Core MikroTik CCR1036 (Dhaka NOC)',
      host: '192.168.88.1',
      status: 'online' as const,
      totalUsers: 1420,
      activeUsers: 1180,
      inactiveUsers: 240,
      lastUpdated: 'Just now',
    },
    {
      id: 2,
      name: 'POP Router RB4011 (Uttara Sector 7)',
      host: '10.10.20.1',
      status: 'online' as const,
      totalUsers: 480,
      activeUsers: 412,
      inactiveUsers: 68,
      lastUpdated: '1 min ago',
    },
    {
      id: 3,
      name: 'POP Router CCR2004 (Mirpur-10 Hub)',
      host: '10.10.30.1',
      status: 'online' as const,
      totalUsers: 620,
      activeUsers: 540,
      inactiveUsers: 80,
      lastUpdated: '2 mins ago',
    },
    {
      id: 4,
      name: 'Edge Gateway (Chittagong GEC)',
      host: '10.20.10.1',
      status: 'online' as const,
      totalUsers: 340,
      activeUsers: 285,
      inactiveUsers: 55,
      lastUpdated: '5 mins ago',
    },
  ],
  // Monthly payment report chart (Jan - Sep)
  monthlyTrend: [
    { month: 'Jan', collection: 980000, target: 950000 },
    { month: 'Feb', collection: 1040000, target: 1000000 },
    { month: 'Mar', collection: 1120000, target: 1050000 },
    { month: 'Apr', collection: 1090000, target: 1100000 },
    { month: 'May', collection: 1180000, target: 1150000 },
    { month: 'Jun', collection: 1210000, target: 1200000 },
    { month: 'Jul', collection: 1250000, target: 1220000 },
    { month: 'Aug', collection: 1270000, target: 1250000 },
    { month: 'Sep', collection: 1285000, target: 1280000 },
  ],
  // Weekly revenue daily bars
  weeklyCollections: [
    { day: 'Sat', amount: 48000 },
    { day: 'Sun', amount: 52000 },
    { day: 'Mon', amount: 46000 },
    { day: 'Tue', amount: 58000 },
    { day: 'Wed', amount: 62000 },
    { day: 'Thu', amount: 54000 },
    { day: 'Fri', amount: 41000 },
  ],
  // Payment methods breakdown
  paymentMethods: [
    { name: 'bKash', percent: 48, amountBdt: 616800, color: '#e2136e' },
    { name: 'Nagad', percent: 26, amountBdt: 334100, color: '#f7941d' },
    { name: 'Cash', percent: 16, amountBdt: 205600, color: '#10b981' },
    { name: 'Bank / Other', percent: 10, amountBdt: 128500, color: '#6366f1' },
  ],
  // Support ticket resolution health
  ticketStats: {
    open: 7,
    ongoing: 12,
    solved: 145,
    closed: 210,
    solvedRate: 94,
  },
  // Consolidated Revenue vs Collection
  revenueOverview: [
    { month: 'May', billed: 1220000, collected: 1180000 },
    { month: 'Jun', billed: 1260000, collected: 1210000 },
    { month: 'Jul', billed: 1300000, collected: 1250000 },
    { month: 'Aug', billed: 1320000, collected: 1270000 },
    { month: 'Sep', billed: 1340000, collected: 1285000 },
  ],
  // Daily Bandwidth consumption hourly curve
  bandwidthHourly: [
    { time: '00:00', gbps: 2.1 },
    { time: '04:00', gbps: 0.9 },
    { time: '08:00', gbps: 3.4 },
    { time: '12:00', gbps: 5.8 },
    { time: '16:00', gbps: 7.2 },
    { time: '20:00', gbps: 9.6 },
    { time: '23:59', gbps: 6.4 },
  ],
  // Geo Revenue breakdown by territory
  geoRevenue: [
    { area: 'Dhaka North (Mirpur / Uttara)', revenueBdt: 580000, customers: 520, active: 485 },
    { area: 'Dhaka South (Dhanmondi / Gulshan)', revenueBdt: 420000, customers: 360, active: 342 },
    { area: 'Chittagong Central & GEC', revenueBdt: 210000, customers: 180, active: 168 },
    { area: 'Sylhet Metro Zone', revenueBdt: 125000, customers: 110, active: 104 },
  ],
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

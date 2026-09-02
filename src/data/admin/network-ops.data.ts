export const routers = [
  { id: 'rtr_1', name: 'Uttara Core', ip: '103.15.20.1', model: 'CCR1036', status: 'online', users: 420, uptime: '45d 12h', area: 'Uttara' },
  { id: 'rtr_2', name: 'Mirpur POP', ip: '103.15.21.1', model: 'RB4011', status: 'online', users: 280, uptime: '30d 8h', area: 'Mirpur' },
  { id: 'rtr_3', name: 'Dhanmondi Edge', ip: '103.15.22.1', model: 'hAP ac3', status: 'offline', users: 0, uptime: '0', area: 'Dhanmondi' },
  { id: 'rtr_4', name: 'Bashundhara GPON', ip: '103.15.23.1', model: 'RB5009', status: 'online', users: 195, uptime: '22d 4h', area: 'Bashundhara' },
  { id: 'rtr_5', name: 'CTG Main', ip: '103.15.24.1', model: 'CCR2004', status: 'online', users: 310, uptime: '60d 1h', area: 'Chittagong' },
  { id: 'rtr_6', name: 'Mohammadpur Edge', ip: '103.15.25.1', model: 'RB2011', status: 'online', users: 88, uptime: '15d 6h', area: 'Mohammadpur' },
];

export const ipPools = [
  { id: 'pool_1', name: 'Uttara Static', range: '103.15.30.0/24', used: 45, total: 254, routerId: 'rtr_1' },
  { id: 'pool_2', name: 'Mirpur Static', range: '103.15.31.0/24', used: 32, total: 254, routerId: 'rtr_2' },
  { id: 'pool_3', name: 'PPPoE Pool Uttara', range: '10.10.1.0/24', used: 180, total: 254, routerId: 'rtr_1' },
  { id: 'pool_4', name: 'Hotspot Pool', range: '192.168.88.0/24', used: 12, total: 254, routerId: 'rtr_3' },
];

export const oltDevices = [
  { id: 'olt_1', name: 'Uttara GPON-1', vendor: 'Huawei', ip: '10.0.1.10', onuTotal: 128, onuOnline: 118, area: 'Uttara' },
  { id: 'olt_2', name: 'Mirpur GPON-1', vendor: 'ZTE', ip: '10.0.2.10', onuTotal: 96, onuOnline: 90, area: 'Mirpur' },
  { id: 'olt_3', name: 'Bashundhara GPON-1', vendor: 'Huawei', ip: '10.0.3.10', onuTotal: 64, onuOnline: 61, area: 'Bashundhara' },
];

export const hotspotProfiles = [
  { id: 'hs_1', name: 'Cafe 2Mbps', speedMbps: 2, priceBdt: 20, validityHours: 24, activeUsers: 8 },
  { id: 'hs_2', name: 'Hotel 5Mbps', speedMbps: 5, priceBdt: 50, validityHours: 24, activeUsers: 3 },
  { id: 'hs_3', name: 'Event 10Mbps', speedMbps: 10, priceBdt: 100, validityHours: 8, activeUsers: 0 },
];

export const smsMessages = Array.from({ length: 25 }, (_, i) => ({
  id: `sms_${i + 1}`,
  to: `017${String(10000000 + i).slice(-8)}`,
  message: ['Your bill ৳1200 is due on Oct 1.', 'Your connection expired. Renew now.', 'Payment received. Thank you!', 'Welcome to Demo ISP!'][i % 4]!,
  status: (i % 7 === 0 ? 'failed' : 'delivered') as 'delivered' | 'failed' | 'pending',
  sentAt: `2026-09-0${(i % 2) + 1}T${String(10 + (i % 8)).padStart(2, '0')}:00:00`,
}));

export const smsTemplates = [
  { id: 'tpl_1', name: 'Expiry Reminder', body: 'Dear {name}, your connection expires on {date}. Pay ৳{amount} to renew.' },
  { id: 'tpl_2', name: 'Payment Received', body: 'Payment ৳{amount} received. TrxID: {trxid}. Valid till {date}.' },
  { id: 'tpl_3', name: 'Welcome SMS', body: 'Welcome {name}! Username: {username}. Support: 01700-000000' },
  { id: 'tpl_4', name: 'Expired Notice', body: 'Your internet is disconnected. Pay ৳{amount} via bKash to restore.' },
  { id: 'tpl_5', name: 'Maintenance Alert', body: 'Scheduled maintenance on {date} {time}. Brief outage expected.' },
];

export const voiceSmsCampaigns = [
  { id: 'vs_1', name: 'Expiry voice blast', recipients: 45, status: 'completed', sentAt: '2026-09-01T08:00:00' },
  { id: 'vs_2', name: 'Payment reminder', recipients: 120, status: 'scheduled', sentAt: '2026-09-03T09:00:00' },
];

export const whatsappThreads = Array.from({ length: 12 }, (_, i) => ({
  id: `wa_${i + 1}`,
  phone: `017${String(10000000 + i * 7).slice(-8)}`,
  name: ['Rahim Uddin', 'Jamal Islam', 'Nadia Begum', 'Karim Ahmed', 'Farhana Khan'][i % 5]!,
  lastMessage: ['When will my line be fixed?', 'Payment done via bKash', 'Need speed upgrade', 'Router not working'][i % 4]!,
  unread: i % 4 === 0 ? 1 : 0,
  updatedAt: `2026-09-0${(i % 2) + 1}T${String(14 + (i % 5)).padStart(2, '0')}:00:00`,
}));

export const whatsappTemplates = [
  { id: 'wtp_1', name: 'payment_received', body: 'Payment ৳{{amount}} received. Valid till {{date}}.' },
  { id: 'wtp_2', name: 'expiry_reminder', body: 'Hi {{name}}, your plan expires {{date}}.' },
];

export const walletData = {
  balanceBdt: 12500,
  currency: 'BDT',
  lowBalanceAlertBdt: 2000,
  transactions: [
    { id: 'wtx_1', type: 'topup', amountBdt: 10000, date: '2026-08-01', note: 'Wallet top-up via bKash' },
    { id: 'wtx_2', type: 'debit', amountBdt: -2500, date: '2026-08-15', note: 'SMS pack — 5000 credits' },
    { id: 'wtx_3', type: 'debit', amountBdt: -1200, date: '2026-08-20', note: 'WhatsApp API credits' },
    { id: 'wtx_4', type: 'topup', amountBdt: 5000, date: '2026-09-01', note: 'Manual top-up' },
  ],
};

export const popResellers = [
  { id: 'pop_uttara', name: 'Demo POP Uttara', balanceBdt: 85000, customers: 320, status: 'active', contact: '01711000001', area: 'Uttara' },
  { id: 'pop_mirpur', name: 'Demo POP Mirpur', balanceBdt: 42000, customers: 180, status: 'active', contact: '01711000002', area: 'Mirpur' },
  { id: 'pop_dhanmondi', name: 'Demo POP Dhanmondi', balanceBdt: 28000, customers: 95, status: 'active', contact: '01711000003', area: 'Dhanmondi' },
  { id: 'pop_chittagong', name: 'Demo POP Chittagong', balanceBdt: 65000, customers: 210, status: 'active', contact: '01711000004', area: 'Chittagong' },
];

export const popTransactions = [
  { id: 'ptx_1', popId: 'pop_uttara', popName: 'Demo POP Uttara', type: 'credit', amountBdt: 50000, date: '2026-09-01', note: 'Funding from admin' },
  { id: 'ptx_2', popId: 'pop_uttara', popName: 'Demo POP Uttara', type: 'debit', amountBdt: -12000, date: '2026-09-02', note: 'Customer collections remitted' },
  { id: 'ptx_3', popId: 'pop_mirpur', popName: 'Demo POP Mirpur', type: 'credit', amountBdt: 30000, date: '2026-08-28', note: 'Funding' },
  { id: 'ptx_4', popId: 'pop_chittagong', popName: 'Demo POP Chittagong', type: 'debit', amountBdt: -8500, date: '2026-09-01', note: 'Package purchase' },
];

export const inventoryItems = [
  { id: 'inv_1', name: 'ONU XPON Huawei', sku: 'ONU-HW-001', stock: 45, unit: 'pcs', reorderAt: 10, costBdt: 1200 },
  { id: 'inv_2', name: 'ONU XPON ZTE', sku: 'ONU-ZTE-001', stock: 32, unit: 'pcs', reorderAt: 10, costBdt: 1100 },
  { id: 'inv_3', name: 'Fiber Cable 100m', sku: 'FIB-100', stock: 12, unit: 'roll', reorderAt: 5, costBdt: 3500 },
  { id: 'inv_4', name: 'MikroTik hAP ac2', sku: 'RTR-HAP2', stock: 8, unit: 'pcs', reorderAt: 3, costBdt: 6500 },
  { id: 'inv_5', name: 'RJ45 Connector', sku: 'RJ45-100', stock: 500, unit: 'pcs', reorderAt: 100, costBdt: 3 },
  { id: 'inv_6', name: 'Patch Cord 3m', sku: 'PATCH-3M', stock: 85, unit: 'pcs', reorderAt: 20, costBdt: 80 },
];

export const purchaseOrders = [
  { id: 'po_1', vendor: 'Tech Distribution BD', items: 3, totalBdt: 85000, status: 'received', date: '2026-08-28' },
  { id: 'po_2', vendor: 'Fiber World Ltd', items: 2, totalBdt: 42000, status: 'pending', date: '2026-09-01' },
];

export const recycleBinItems = [
  { id: 'rb_1', type: 'customer', label: 'Deleted User user_099', deletedAt: '2026-08-30T10:00:00', deletedBy: 'admin@demo.isppaybd.com' },
  { id: 'rb_2', type: 'package', label: 'Old Home 3 Mbps', deletedAt: '2026-08-25T14:00:00', deletedBy: 'admin@demo.isppaybd.com' },
  { id: 'rb_3', type: 'payment', label: 'Duplicate payment pay_0042', deletedAt: '2026-08-20T09:00:00', deletedBy: 'admin@demo.isppaybd.com' },
];

export const btrcReportRows = [
  { month: '2026-08', subscribers: 1250, newConnections: 45, disconnections: 12, revenueBdt: 1285000 },
  { month: '2026-07', subscribers: 1217, newConnections: 38, disconnections: 15, revenueBdt: 1198000 },
  { month: '2026-06', subscribers: 1194, newConnections: 42, disconnections: 10, revenueBdt: 1150000 },
];

export const networkMapNodes = [
  { id: 'node_core', type: 'core', name: 'Uttara Core', lat: 23.8759, lng: 90.3795, status: 'online' },
  { id: 'node_pop1', type: 'pop', name: 'Mirpur POP', lat: 23.8067, lng: 90.3683, status: 'online' },
  { id: 'node_pop2', type: 'pop', name: 'Dhanmondi Edge', lat: 23.7465, lng: 90.3760, status: 'offline' },
];

export const rewardsProgram = {
  enabled: true,
  pointsPerReferral: 200,
  pointsPerRenewal: 50,
  redemptionRate: 1,
  activeMembers: 340,
};

export const softwareSettings = {
  appName: 'Demo ISP Network',
  timezone: 'Asia/Dhaka',
  currency: 'BDT',
  expiryGraceDays: 3,
  autoDisconnect: true,
  smsEnabled: true,
  whatsappEnabled: true,
  maintenanceMode: false,
};

export const userAccessRoles = [
  { id: 'role_admin', name: 'Full Admin', users: 2, permissions: 85 },
  { id: 'role_support', name: 'Support Only', users: 3, permissions: 12 },
  { id: 'role_accounts', name: 'Accounts', users: 1, permissions: 24 },
  { id: 'role_reseller', name: 'POP Reseller', users: 4, permissions: 18 },
];

import { getPaymentsByCustomerId } from '../admin/customer-payments.data';
import { packages } from '../admin/packages.data';

export const customerSubscription = {
  userId: 'user_001',
  packageId: 'pkg_20',
  packageName: 'Home 20 Mbps',
  speedMbps: 20,
  priceBdt: 1200,
  startDate: '2026-09-01',
  expiryDate: '2026-10-01',
  status: 'active' as const,
  autoRenew: false,
  quotaUsedGb: 128,
  quotaTotalGb: 500,
};

export const customerPackages = packages.filter((p) => p.type === 'home' && p.visible);

export const customerPayments = getPaymentsByCustomerId('cust_001');

export const customerRewards = {
  pointsBalance: 850,
  referralCode: 'RAHIM-UTT-20',
  referralsCount: 5,
  pendingReferrals: 1,
  transactions: [
    { id: 'rw_1', type: 'earn', points: 200, label: 'Referral: Karim', date: '2026-08-10' },
    { id: 'rw_2', type: 'redeem', points: -150, label: 'Renewal discount', date: '2026-09-01' },
    { id: 'rw_3', type: 'earn', points: 100, label: 'Loyalty bonus', date: '2026-09-01' },
  ],
};

export const routerTools = {
  pppoeUsername: 'demo_001',
  routerModel: 'MikroTik hAP ac2',
  lastReconnect: '2026-09-02T06:00:00',
  wifiSsid: 'Rahim-Home-5G',
  quickFixActions: [
    { id: 'reset_session', label: 'Reset PPPoE Session', icon: 'RefreshCw' },
    { id: 'reconnect', label: 'Reconnect Line', icon: 'Wifi' },
    { id: 'dns_flush', label: 'Flush DNS Cache', icon: 'Globe' },
    { id: 'quick_fix', label: 'Run Quick Fix', icon: 'Zap' },
  ],
};

export const connectedDevices = [
  { id: 'dev_1', name: 'Samsung Galaxy A54', mac: 'AA:11:22:33:44:01', ip: '192.168.88.101', connectedAt: '2026-09-02T07:00:00' },
  { id: 'dev_2', name: 'Laptop-Dell', mac: 'AA:11:22:33:44:02', ip: '192.168.88.102', connectedAt: '2026-09-02T08:30:00' },
  { id: 'dev_3', name: 'Smart TV', mac: 'AA:11:22:33:44:03', ip: '192.168.88.103', connectedAt: '2026-09-01T20:00:00' },
];

export const customerProfile = {
  userId: 'user_001',
  customerId: 'cust_001',
  name: 'Rahim Uddin',
  username: 'user_001',
  phone: '01711001001',
  email: 'user001@demo.local',
  address: 'House 12, Road 5, Sector 11, Uttara, Dhaka',
  addressBn: 'বাড়ি ১২, রোড ৫, সেক্টর ১১, উত্তরা, ঢাকা',
  nid: '1234567890123',
  areaName: 'Uttara — Sector 11',
  connectionType: 'pppoe' as const,
  macAddress: 'AA:BB:00:CC:00:01',
  ipAddress: '103.15.20.101',
  createdAt: '2024-03-15',
  avatarInitials: 'RU',
};

export const customerNotifications = [
  { id: 'n_1', title: 'Payment received', body: '৳1,200 payment confirmed. Valid till Oct 15.', read: false, at: '2026-09-01T10:30:00' },
  { id: 'n_2', title: 'Maintenance notice', body: 'Scheduled maintenance Sept 5, 2–4 AM.', read: true, at: '2026-09-01T09:00:00' },
  { id: 'n_3', title: 'New package available', body: 'Home 100 Mbps now available.', read: true, at: '2026-08-28T11:00:00' },
];

export const customerAutoPay = {
  enabled: true,
  method: 'bkash' as const,
  maskedAccount: '•••• 8812',
  retryCount: 2,
  nextChargeAt: '2026-10-01',
  lastChargeAt: '2026-09-01',
  lastStatus: 'success' as const,
};

export const customerInvoicePreview = {
  id: 'pay_101',
  invoiceNo: 'INV-2026-0901',
  packageName: 'Home 40 Mbps',
  period: 'Sep 2026',
  subtotalBdt: 1200,
  taxBdt: 180,
  totalBdt: 1380,
  status: 'paid' as const,
  paidAt: '2026-09-01',
};

export const helpArticles = [
  { id: 'h1', title: 'How to pay with bKash', category: 'Billing', minutes: 2 },
  { id: 'h2', title: 'Reset Wi-Fi password', category: 'Router', minutes: 3 },
  { id: 'h3', title: 'Why is my speed slow?', category: 'Network', minutes: 4 },
];

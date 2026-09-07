export interface AuditLogEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  ip: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface AdminNewsItem {
  id: string;
  title: string;
  titleBn: string;
  body: string;
  publishedAt: string;
  pinned: boolean;
  status: 'published' | 'draft';
  audience: 'all' | 'customers' | 'resellers';
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  at: string;
}

export interface CorporateQueueJob {
  id: string;
  customerName: string;
  packageName: string;
  routerName: string;
  action: 'create_pppoe' | 'update_speed' | 'suspend' | 'resume' | 'sync_mac';
  status: 'queued' | 'running' | 'success' | 'failed';
  attempts: number;
  createdAt: string;
  lastError?: string;
}

export interface SidebarPin {
  id: string;
  label: string;
  href: string;
  icon: string;
  order: number;
}

export interface CustomerAuditEvent {
  id: string;
  customerId: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export interface PaymentGatewayDetail {
  id: string;
  name: string;
  provider: 'bkash' | 'nagad' | 'rocket' | 'sslcommerz';
  enabled: boolean;
  mode: 'live' | 'sandbox';
  merchantNumber?: string;
  appKeyMasked: string;
  webhookUrl: string;
  successRatePct: number;
  lastSettlementAt: string;
  todayVolumeBdt: number;
}

export const auditLogsData: AuditLogEntry[] = [
  {
    id: 'aud_01',
    at: '2026-09-07T14:22:00',
    actor: 'admin@demo.isppaybd.com',
    action: 'customer.update',
    entity: 'Customer',
    entityId: 'cust_001',
    ip: '103.15.20.8',
    detail: 'Changed package Home 20 → Home 50 Mbps',
    severity: 'info',
  },
  {
    id: 'aud_02',
    at: '2026-09-07T13:05:00',
    actor: 'reseller@uttara.pop',
    action: 'payment.create',
    entity: 'Payment',
    entityId: 'pay_8821',
    ip: '103.15.21.44',
    detail: 'Manual cash collection ৳1,500',
    severity: 'info',
  },
  {
    id: 'aud_03',
    at: '2026-09-07T11:40:00',
    actor: 'system',
    action: 'router.sync_failed',
    entity: 'Router',
    entityId: 'rtr_mirpur',
    ip: '127.0.0.1',
    detail: 'API timeout after 3 retries',
    severity: 'critical',
  },
  {
    id: 'aud_04',
    at: '2026-09-06T22:18:00',
    actor: 'admin@demo.isppaybd.com',
    action: 'user_access.update',
    entity: 'Role',
    entityId: 'role_collector',
    ip: '103.15.20.8',
    detail: 'Granted customer_payment.create',
    severity: 'warning',
  },
  {
    id: 'aud_05',
    at: '2026-09-06T18:02:00',
    actor: 'system',
    action: 'cron.invoice',
    entity: 'Cron',
    entityId: 'daily_invoice',
    ip: '127.0.0.1',
    detail: 'Generated 128 due invoices',
    severity: 'info',
  },
];

export const adminNewsData: AdminNewsItem[] = [
  {
    id: 'news_1',
    title: 'Scheduled maintenance — Sept 5, 2–4 AM',
    titleBn: 'নির্ধারিত রক্ষণাবেক্ষণ — ৫ সেপ্টেম্বর, রাত ২–৪টা',
    body: 'Core routers in Uttara POP will undergo firmware update. Expect brief disconnections.',
    publishedAt: '2026-09-01T10:00:00',
    pinned: true,
    status: 'published',
    audience: 'all',
  },
  {
    id: 'news_2',
    title: 'New Home 100 Mbps package available',
    titleBn: 'নতুন Home 100 Mbps প্যাকেজ',
    body: 'Upgrade to 100 Mbps for ৳3,500/month. Contact support or self-upgrade in portal.',
    publishedAt: '2026-08-28T09:00:00',
    pinned: false,
    status: 'published',
    audience: 'customers',
  },
  {
    id: 'news_draft',
    title: 'Eid office hours (draft)',
    titleBn: 'ঈদের ছুটিতে অফিস সময়',
    body: 'Draft notice for Eid holiday support hours.',
    publishedAt: '2026-09-07T08:00:00',
    pinned: false,
    status: 'draft',
    audience: 'all',
  },
];

export const aiChatSeedMessages: AiChatMessage[] = [
  {
    id: 'ai_1',
    role: 'assistant',
    content:
      'Assalamualaikum. I can help with ISP ops — expired customers, MikroTik sync, payment reconciliation, and BTRC report tips. What do you need?',
    at: '2026-09-07T09:00:00',
  },
  {
    id: 'ai_2',
    role: 'user',
    content: 'How many customers expire in the next 3 days in Uttara?',
    at: '2026-09-07T09:01:00',
  },
  {
    id: 'ai_3',
    role: 'assistant',
    content:
      'In the demo data, 12 customers in Uttara expire within 3 days. Filter Customers → Expired / Due Soon, then Area = Uttara. Want a sample SMS reminder draft?',
    at: '2026-09-07T09:01:12',
  },
];

export const corporateQueuesData: CorporateQueueJob[] = [
  {
    id: 'cq_01',
    customerName: 'Acme Logistics HQ',
    packageName: 'Corporate 100 Mbps',
    routerName: 'Uttara-Core-01',
    action: 'create_pppoe',
    status: 'success',
    attempts: 1,
    createdAt: '2026-09-07T10:15:00',
  },
  {
    id: 'cq_02',
    customerName: 'GreenBank Branch-12',
    packageName: 'Corporate 50 Mbps',
    routerName: 'Mirpur-Edge-02',
    action: 'update_speed',
    status: 'running',
    attempts: 1,
    createdAt: '2026-09-07T14:01:00',
  },
  {
    id: 'cq_03',
    customerName: 'City Hospital WAN',
    packageName: 'Corporate 30 Mbps',
    routerName: 'Bashundhara-OLT-1',
    action: 'suspend',
    status: 'failed',
    attempts: 3,
    createdAt: '2026-09-07T12:40:00',
    lastError: 'Router API unreachable (timeout)',
  },
  {
    id: 'cq_04',
    customerName: 'TechPark Building C',
    packageName: 'Corporate 100 Mbps',
    routerName: 'Uttara-Core-01',
    action: 'sync_mac',
    status: 'queued',
    attempts: 0,
    createdAt: '2026-09-07T14:20:00',
  },
];

export const sidebarPinsData: SidebarPin[] = [
  { id: 'pin_1', label: 'Customers', href: '/admin/customers', icon: 'Users', order: 1 },
  { id: 'pin_2', label: 'Customer Payments', href: '/admin/customer-payments', icon: 'Banknote', order: 2 },
  { id: 'pin_3', label: 'Support Tickets', href: '/admin/support', icon: 'LifeBuoy', order: 3 },
  { id: 'pin_4', label: 'Hierarchy', href: '/admin/hierarchy', icon: 'GitBranch', order: 4 },
];

export const customerAuditEvents: CustomerAuditEvent[] = [
  {
    id: 'ca_01',
    customerId: 'cust_001',
    at: '2026-09-07T14:22:00',
    actor: 'admin@demo.isppaybd.com',
    action: 'Package changed',
    detail: 'Home 20 → Home 50 Mbps',
  },
  {
    id: 'ca_02',
    customerId: 'cust_001',
    at: '2026-09-05T11:10:00',
    actor: 'system',
    action: 'MAC bound',
    detail: 'Bound AA:BB:CC:DD:EE:11 on PPPoE session',
  },
  {
    id: 'ca_03',
    customerId: 'cust_001',
    at: '2026-09-01T09:00:00',
    actor: 'collector@uttara',
    action: 'Payment recorded',
    detail: 'Cash ৳1,500 — invoice INV-2026-0901',
  },
];

export const paymentGatewayDetails: PaymentGatewayDetail[] = [
  {
    id: 'bkash',
    name: 'bKash Merchant',
    provider: 'bkash',
    enabled: true,
    mode: 'live',
    merchantNumber: '01711-223344',
    appKeyMasked: 'bKash_****a91c',
    webhookUrl: 'https://demo.isppaybd.com/webhooks/bkash',
    successRatePct: 98.4,
    lastSettlementAt: '2026-09-07T06:00:00',
    todayVolumeBdt: 185400,
  },
  {
    id: 'nagad',
    name: 'Nagad Merchant',
    provider: 'nagad',
    enabled: true,
    mode: 'live',
    merchantNumber: '01899-112233',
    appKeyMasked: 'ngd_live_****31f0',
    webhookUrl: 'https://demo.isppaybd.com/webhooks/nagad',
    successRatePct: 97.1,
    lastSettlementAt: '2026-09-07T06:05:00',
    todayVolumeBdt: 92400,
  },
  {
    id: 'rocket',
    name: 'Dutch Bangla Rocket',
    provider: 'rocket',
    enabled: false,
    mode: 'sandbox',
    merchantNumber: '01933-445566-7',
    appKeyMasked: 'rkt_sand_****001a',
    webhookUrl: 'https://demo.isppaybd.com/webhooks/rocket',
    successRatePct: 0,
    lastSettlementAt: '—',
    todayVolumeBdt: 0,
  },
  {
    id: 'sslcommerz',
    name: 'SSLCommerz Aggregator',
    provider: 'sslcommerz',
    enabled: true,
    mode: 'live',
    appKeyMasked: 'ssl_store_****88cc',
    webhookUrl: 'https://demo.isppaybd.com/webhooks/sslcommerz',
    successRatePct: 99.0,
    lastSettlementAt: '2026-09-07T05:55:00',
    todayVolumeBdt: 41200,
  },
];

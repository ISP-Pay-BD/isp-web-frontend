export interface PlatformContact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  message?: string;
  createdAt: string;
}

export interface PlatformAdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'inactive';
  tenantId?: string;
  tenantSlug?: string;
  packageName?: string;
  lastLogin: string;
  createdAt: string;
}

export interface AdminPackageTier {
  id: string;
  name: string;
  maxCustomers: number;
  priceBdt: number;
  durationDays: number;
  packageType: 'prepaid' | 'postpaid';
  features: string[];
  isActive: boolean;
  tenantCount: number;
}

export interface PlatformSupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  subject: string;
  category: 'Billing' | 'Technical' | 'MikroTik' | 'Account';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    sender: 'tenant_admin' | 'platform_support';
    senderName: string;
    body: string;
    sentAt: string;
  }[];
}

export interface PlatformFileItem {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'file';
  size: number | null;
  ext?: string;
  modifiedAt: string;
}

export interface ProductShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: 'Billing' | 'MikroTik' | 'Customer Portal' | 'Reporting';
  featured: boolean;
  views: number;
  createdAt: string;
}

export interface PlatformSoftwareSettings {
  appName: string;
  baseDomain: string;
  supportEmail: string;
  supportPhone: string;
  yearlyDiscountMonths: number;
  yearlyDiscountPercent: number;
  maintenanceMode: boolean;
  allowSelfRegistration: boolean;
  sessionTimeoutMinutes: number;
  primaryBrandColor: string;
  notificationWebhookUrl?: string;
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  channel: 'redis' | 'auth' | 'billing' | 'mikrotik' | 'system';
  message: string;
  details?: string;
  ip?: string;
}

export const initialPlatformContacts: PlatformContact[] = [
  { id: 'con_1', name: 'Ahmed Rahman', company: 'FastNet BD', email: 'ahmed@fastnet.bd', phone: '01715000001', source: 'Landing form', status: 'qualified', message: 'Interested in MikroTik sync and automated bKash billing for 4,000 users.', createdAt: '2026-09-01' },
  { id: 'con_2', name: 'Sara Islam', company: 'New ISP Startup', email: 'sara@startup.bd', phone: '01715000002', source: 'Referral', status: 'new', message: 'Setting up a new fiber network in Gazipur, need software quote.', createdAt: '2026-09-02' },
  { id: 'con_3', name: 'Karim Chowdhury', company: 'LinkWave', email: 'karim@linkwave.com', phone: '01715000003', source: 'Demo request', status: 'contacted', message: 'Requested live walkthrough of POP reseller balance and billing modules.', createdAt: '2026-08-28' },
  { id: 'con_4', name: 'Nadia Akter', company: 'CityNet Sylhet', email: 'nadia@citynet.bd', phone: '01715000004', source: 'Pricing page', status: 'won', message: 'Onboarded to Starter tier. Subdomain portal created.', createdAt: '2026-08-15' },
  { id: 'con_5', name: 'Imran Hossain', company: 'FiberOne BD', email: 'imran@fiberone.bd', phone: '01715000005', source: 'Plugin inquiry', status: 'lost', message: 'Decided to continue with self-hosted free script for now.', createdAt: '2026-08-01' },
  { id: 'con_6', name: 'Mehedi Hasan', company: 'Delta Broadband', email: 'mehedi@deltabd.net', phone: '01815000006', source: 'Contact us', status: 'new', message: 'Need custom OLT integration support for Huawei SmartAX.', createdAt: '2026-09-02' },
];

export const initialPlatformAdmins: PlatformAdminUser[] = [
  { id: 'padm_1', name: 'Super Admin', email: 'super@demo.isppaybd.com', phone: '01710000006', role: 'super_admin', status: 'active', lastLogin: '2026-09-02T08:00:00', createdAt: '2024-01-01' },
  { id: 'padm_2', name: 'Platform Admin Two', email: 'admin2@isppaybd.com', phone: '01710000007', role: 'admin', status: 'active', lastLogin: '2026-09-01T16:00:00', createdAt: '2024-03-10' },
  { id: 'padm_3', name: 'Platform Admin Three', email: 'admin3@isppaybd.com', phone: '01710000008', role: 'admin', status: 'inactive', lastLogin: '2026-08-20T10:00:00', createdAt: '2024-05-15' },
  { id: 'padm_101', name: 'Ahmed Rahman (FastNet)', email: 'admin@fastnet.bd', phone: '01715000001', role: 'admin', status: 'active', tenantId: 'tenant_fastnet', tenantSlug: 'fastnet', packageName: 'Scale Enterprise', lastLogin: '2026-09-02T09:30:00', createdAt: '2023-11-15' },
  { id: 'padm_102', name: 'Tanvir Hossain (SkyLink)', email: 'admin@skylink.bd', phone: '01815000002', role: 'admin', status: 'active', tenantId: 'tenant_skylink', tenantSlug: 'skylink', packageName: 'Starter Growth', lastLogin: '2026-09-02T07:15:00', createdAt: '2026-08-01' },
  { id: 'padm_103', name: 'Rafiqul Islam (NetLink)', email: 'admin@netlink-ctg.com', phone: '01915000003', role: 'admin', status: 'active', tenantId: 'tenant_netlink', tenantSlug: 'netlink', packageName: 'Growth Standard', lastLogin: '2026-09-01T14:40:00', createdAt: '2024-02-20' },
];

export const initialAdminPackages: AdminPackageTier[] = [
  { id: 'apkg_starter', name: 'Starter Tier', maxCustomers: 500, priceBdt: 2500, durationDays: 30, packageType: 'prepaid', features: ['Up to 500 subscribers', '1 MikroTik router', 'SMS notifications', 'Standard billing'], isActive: true, tenantCount: 18 },
  { id: 'apkg_growth', name: 'Growth Tier', maxCustomers: 2000, priceBdt: 6000, durationDays: 30, packageType: 'prepaid', features: ['Up to 2,000 subscribers', '5 MikroTik routers', 'Auto-reconciliation', 'POP resellers', 'WhatsApp alerts'], isActive: true, tenantCount: 22 },
  { id: 'apkg_scale', name: 'Scale Tier', maxCustomers: 10000, priceBdt: 15000, durationDays: 30, packageType: 'prepaid', features: ['Unlimited subscribers', 'Unlimited routers', 'OLT manager plugin', 'Custom branding', 'Dedicated DB'], isActive: true, tenantCount: 8 },
  { id: 'apkg_yearly_spec', name: 'Enterprise Annual', maxCustomers: 5000, priceBdt: 60000, durationDays: 365, packageType: 'postpaid', features: ['Annual billing (2 months free)', 'Full white-label portal', 'Priority 24/7 SLA', 'Data migration assistance'], isActive: true, tenantCount: 4 },
];

export const initialPlatformSupportTickets: PlatformSupportTicket[] = [
  {
    id: 'pst_1',
    tenantId: 'tenant_fastnet',
    tenantName: 'FastNet BD',
    tenantSlug: 'fastnet',
    subject: 'API rate limit increase for bKash webhook batching',
    category: 'Billing',
    status: 'open',
    priority: 'high',
    createdAt: '2026-09-01 11:20',
    updatedAt: '2026-09-02 09:15',
    messages: [
      { id: 'pmsg_1', sender: 'tenant_admin', senderName: 'Ahmed Rahman', body: 'We have over 1,500 daily renewals and bKash webhooks are hitting the 60 req/min limit during 8-10 PM peak hours. Please increase to 180 req/min.', sentAt: '2026-09-01 11:20' },
      { id: 'pmsg_2', sender: 'platform_support', senderName: 'Super Admin', body: 'We have reviewed your request. Increased rate limit to 200 req/min for FastNet cluster. Please test tonight and let us know.', sentAt: '2026-09-02 09:15' },
    ],
  },
  {
    id: 'pst_2',
    tenantId: 'tenant_skylink',
    tenantName: 'SkyLink Internet',
    tenantSlug: 'skylink',
    subject: 'Trial extension request by 7 days',
    category: 'Account',
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-08-30 14:00',
    updatedAt: '2026-08-31 10:00',
    messages: [
      { id: 'pmsg_3', sender: 'tenant_admin', senderName: 'Tanvir Hossain', body: 'Our MikroTik engineer was unavailable this week. Could we please have 7 more trial days to complete billing verification?', sentAt: '2026-08-30 14:00' },
    ],
  },
  {
    id: 'pst_3',
    tenantId: 'tenant_netlink',
    tenantName: 'NetLink CTG',
    tenantSlug: 'netlink',
    subject: 'Huawei OLT SmartAX plugin sync clarification',
    category: 'Technical',
    status: 'resolved',
    priority: 'low',
    createdAt: '2026-08-25 16:30',
    updatedAt: '2026-08-27 12:10',
    messages: [
      { id: 'pmsg_4', sender: 'tenant_admin', senderName: 'Rafiqul Islam', body: 'Which SNMP MIB version is recommended for MA5608T?', sentAt: '2026-08-25 16:30' },
      { id: 'pmsg_5', sender: 'platform_support', senderName: 'Network Tech', body: 'Please use SNMPv2c with community string configured under Plugin Settings > OLT > Huawei Profile 2.', sentAt: '2026-08-27 12:10' },
    ],
  },
];

export const initialPlatformFileManager: PlatformFileItem[] = [
  { id: 'fm_1', name: 'tenant-logos', path: 'tenant-logos', type: 'folder', size: null, modifiedAt: '2026-09-01 18:30' },
  { id: 'fm_2', name: 'system-backups', path: 'system-backups', type: 'folder', size: null, modifiedAt: '2026-09-02 03:00' },
  { id: 'fm_3', name: 'release-notes-v2.4.md', path: 'release-notes-v2.4.md', type: 'file', size: 12400, ext: 'md', modifiedAt: '2026-08-28 14:20' },
  { id: 'fm_4', name: 'api-documentation.pdf', path: 'api-documentation.pdf', type: 'file', size: 2450000, ext: 'pdf', modifiedAt: '2026-08-15 10:11' },
  { id: 'fm_5', name: 'database_schema_v2.sql', path: 'database_schema_v2.sql', type: 'file', size: 450000, ext: 'sql', modifiedAt: '2026-08-01 19:45' },
  { id: 'fm_6', name: 'isppaybd-logo-white.svg', path: 'tenant-logos/isppaybd-logo-white.svg', type: 'file', size: 34200, ext: 'svg', modifiedAt: '2026-07-20 11:00' },
  { id: 'fm_7', name: 'fastnet-logo.png', path: 'tenant-logos/fastnet-logo.png', type: 'file', size: 84000, ext: 'png', modifiedAt: '2026-08-12 15:40' },
];

export const initialProductShowcase: ProductShowcaseItem[] = [
  { id: 'show_1', title: 'bKash Auto-Reconciliation Engine', subtitle: 'Zero manual matching for ISP payments', description: 'Automated reverse matching between bKash merchant TrxID, SMS webhooks and PPPoE subscriber ledger.', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: '/images/brand/logo.svg', category: 'Billing', featured: true, views: 1420, createdAt: '2026-07-10' },
  { id: 'show_2', title: 'MikroTik RouterOS 7.x Live Sync', subtitle: 'PPPoE secrets & active queues management', description: 'Real-time disconnection on expiry, pool reallocation, and automatic reconnection when payment clears.', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: '/images/brand/logo.svg', category: 'MikroTik', featured: true, views: 2310, createdAt: '2026-08-01' },
  { id: 'show_3', title: 'POP Reseller Hierarchy & Wallet', subtitle: 'Multi-tier sub-ISP balance control', description: 'Credit fund distribution, wholesale bandwidth cost calculation, and branded receipt printing for POPs.', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: '/images/brand/logo.svg', category: 'Billing', featured: false, views: 980, createdAt: '2026-08-15' },
  { id: 'show_4', title: 'Customer Self-Care & Router WiFi Tool', subtitle: 'Subscribers manage password and bill', description: 'Mobile responsive customer portal with bKash/Nagad instant pay, WiFi SSID change, and support ticketing.', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: '/images/brand/logo.svg', category: 'Customer Portal', featured: true, views: 1870, createdAt: '2026-08-28' },
];

export const initialPlatformSettings: PlatformSoftwareSettings = {
  appName: 'ISP Pay BD Platform',
  baseDomain: 'isppaybd.com',
  supportEmail: 'support@isppaybd.com',
  supportPhone: '+8801710000000',
  yearlyDiscountMonths: 2,
  yearlyDiscountPercent: 17,
  maintenanceMode: false,
  allowSelfRegistration: true,
  sessionTimeoutMinutes: 120,
  primaryBrandColor: '#f75803',
  notificationWebhookUrl: 'https://hooks.isppaybd.com/platform/events',
};

export const initialSystemLogs: SystemLogEntry[] = [
  { id: 'log_1', timestamp: '2026-09-02 16:30:12', level: 'info', channel: 'redis', message: 'Redis cache keys synced: 1,420 tenant sessions alive. Memory: 82.4 MB.' },
  { id: 'log_2', timestamp: '2026-09-02 16:25:40', level: 'info', channel: 'billing', message: 'Tenant [fastnet] recorded bKash transaction ৳1,000 (Trx: BKA728192).' },
  { id: 'log_3', timestamp: '2026-09-02 16:15:02', level: 'warning', channel: 'mikrotik', message: 'Tenant [citynet] router CCR1009 connection latency spiked to 410ms.' },
  { id: 'log_4', timestamp: '2026-09-02 15:55:20', level: 'error', channel: 'auth', message: 'Failed super_admin password attempt from IP 103.220.12.4' },
  { id: 'log_5', timestamp: '2026-09-02 15:40:11', level: 'info', channel: 'system', message: 'Automated tenant database snapshot completed in 4.2 seconds.' },
  { id: 'log_6', timestamp: '2026-09-02 15:10:05', level: 'debug', channel: 'redis', message: 'Heartbeat ping: Redis server 7.2.4 uptime 48 days 14 hours.' },
];

// Mutable references for in-memory persistence during test session
export const platformContacts = [...initialPlatformContacts];
export const platformAdmins = [...initialPlatformAdmins];
export const adminPackages = [...initialAdminPackages];
export const platformSupportTickets = [...initialPlatformSupportTickets];
export const platformFileManager = [...initialPlatformFileManager];
export const productShowcase = [...initialProductShowcase];
export const platformSettings = { ...initialPlatformSettings };
export const systemLogs = [...initialSystemLogs];

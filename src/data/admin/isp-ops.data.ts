/** ISP ops mock data — routers, RADIUS, billing, OLT, IPAM, growth, platform shells */

export interface RouterDetail {
  id: string;
  name: string;
  ip: string;
  cpuPct: number;
  ramPct: number;
  uptime: string;
  version: string;
  onlineUsers: number;
}

export interface PppoeSession {
  id: string;
  routerId: string;
  username: string;
  ip: string;
  uptime: string;
  rxMbps: number;
  txMbps: number;
  mac: string;
}

export interface RadiusNas {
  id: string;
  name: string;
  ip: string;
  secretMasked: string;
  type: 'mikrotik' | 'cisco' | 'other';
  status: 'online' | 'offline';
}

export interface RadiusCoaLog {
  id: string;
  at: string;
  nas: string;
  username: string;
  action: 'disconnect' | 'coa' | 'pod';
  result: 'ok' | 'timeout' | 'reject';
}

export interface IspInvoice {
  id: string;
  number: string;
  customerName: string;
  customerId: string;
  period: string;
  amountBdt: number;
  taxBdt: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  dueDate: string;
}

export interface ReconcileRow {
  id: string;
  at: string;
  gateway: string;
  trxId: string;
  amountBdt: number;
  matchedPaymentId: string | null;
  status: 'matched' | 'unmatched' | 'duplicate';
}

export interface InactiveCustomer {
  id: string;
  name: string;
  username: string;
  packageName: string;
  lastOnline: string;
  daysInactive: number;
  area: string;
}

export interface IpNatLog {
  id: string;
  at: string;
  publicIp: string;
  privateIp: string;
  port: number;
  protocol: 'tcp' | 'udp';
  username: string;
  bytes: number;
}

export interface BillingPolicy {
  id: string;
  name: string;
  mode: 'prepaid' | 'postpaid' | 'hybrid';
  graceDays: number;
  fupGb: number | null;
  autoSuspend: boolean;
}

export interface TaxSetting {
  id: string;
  name: string;
  ratePct: number;
  inclusive: boolean;
  applyTo: 'invoice' | 'otc' | 'both';
  active: boolean;
}

export interface ReminderRow {
  id: string;
  customerName: string;
  channel: 'sms' | 'whatsapp' | 'email' | 'voice';
  template: string;
  scheduledAt: string;
  status: 'queued' | 'sent' | 'failed';
  dueBdt: number;
}

export interface CashbookEntry {
  id: string;
  at: string;
  collector: string;
  customerName: string;
  amountBdt: number;
  method: 'cash' | 'bkash' | 'nagad';
  note: string;
}

export interface OltOnu {
  id: string;
  oltId: string;
  sn: string;
  rxDbm: number;
  txDbm: number;
  status: 'online' | 'los' | 'offline' | 'dying-gasp';
  customerName: string;
}

export interface OltVendor {
  id: string;
  name: string;
  models: string;
  profileCount: number;
  lastSync: string;
}

export interface PonPort {
  id: string;
  oltName: string;
  pon: string;
  splitter: string;
  usedOnus: number;
  capacity: number;
  avgRxDbm: number;
}

export interface CpeAssignment {
  id: string;
  serial: string;
  model: string;
  customerName: string;
  assignedAt: string;
  status: 'assigned' | 'spare' | 'faulty';
}

export interface StockTransfer {
  id: string;
  fromLocation: string;
  toLocation: string;
  item: string;
  qty: number;
  at: string;
  status: 'pending' | 'received' | 'cancelled';
}

export interface IpamBlock {
  id: string;
  cidr: string;
  family: 'v4' | 'v6';
  used: number;
  total: number;
  purpose: string;
}

export interface CgnatMap {
  id: string;
  privateCidr: string;
  publicPool: string;
  portsPerUser: number;
  activeSessions: number;
}

export interface HotspotVoucher {
  id: string;
  code: string;
  profile: string;
  validityHours: number;
  used: boolean;
  batch: string;
}

export interface WalledGardenRule {
  id: string;
  host: string;
  comment: string;
  enabled: boolean;
}

export interface UsageReportRow {
  id: string;
  customerName: string;
  packageName: string;
  downloadGb: number;
  uploadGb: number;
  peakMbps: number;
  period: string;
}

export interface OutageRow {
  id: string;
  title: string;
  severity: 'minor' | 'major' | 'critical';
  area: string;
  startedAt: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  affected: number;
}

export interface DunningStep {
  id: string;
  dayOffset: number;
  action: string;
  channel: string;
  enabled: boolean;
}

export interface ProrationExample {
  id: string;
  fromPackage: string;
  toPackage: string;
  daysUsed: number;
  creditBdt: number;
  chargeBdt: number;
  netBdt: number;
}

export interface CreditNote {
  id: string;
  number: string;
  customerName: string;
  amountBdt: number;
  reason: string;
  at: string;
  status: 'open' | 'applied' | 'void';
}

export interface DepositRow {
  id: string;
  customerName: string;
  type: 'deposit' | 'otc';
  amountBdt: number;
  at: string;
  refundable: boolean;
}

export interface PopCommission {
  id: string;
  popName: string;
  period: string;
  collectedBdt: number;
  ratePct: number;
  commissionBdt: number;
  status: 'pending' | 'paid';
}

export interface PackageProfitRow {
  id: string;
  popName: string;
  packageName: string;
  customers: number;
  revenueBdt: number;
  costBdt: number;
  profitBdt: number;
}

export interface WorkOrder {
  id: string;
  title: string;
  customerName: string;
  type: 'install' | 'repair' | 'shift' | 'collect';
  assignee: string;
  status: 'open' | 'in_progress' | 'done' | 'cancelled';
  dueAt: string;
}

export interface LeadRow {
  id: string;
  name: string;
  phone: string;
  area: string;
  packageInterest: string;
  stage: 'new' | 'contacted' | 'survey' | 'won' | 'lost';
  owner: string;
}

export interface CustomerGroup {
  id: string;
  name: string;
  parentName: string;
  members: number;
  billingMode: 'consolidated' | 'individual';
}

export interface KycDoc {
  id: string;
  customerId: string;
  type: 'nid' | 'trade' | 'photo' | 'other';
  fileName: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface UsageAlertRule {
  id: string;
  name: string;
  thresholdPct: number;
  channel: string;
  enabled: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  audience: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

export interface ReferralAnalyticsRow {
  id: string;
  referrer: string;
  referrals: number;
  converted: number;
  rewardBdt: number;
}

export interface AddonRow {
  id: string;
  name: string;
  category: 'ott' | 'iptv' | 'static_ip' | 'other';
  priceBdt: number;
  active: boolean;
}

export interface ServiceType {
  id: string;
  name: string;
  code: string;
  customers: number;
}

export interface ApiKeyRow {
  id: string;
  name: string;
  keyMasked: string;
  createdAt: string;
  lastUsedAt: string;
  scopes: string;
}

export interface WebhookRow {
  id: string;
  url: string;
  events: string;
  status: 'active' | 'failing';
  lastDeliveryAt: string;
}

export interface BrandingSettings {
  companyName: string;
  primaryColor: string;
  logoUrl: string;
  supportPhone: string;
  supportEmail: string;
  customDomain: string;
}

export interface PosReceipt {
  id: string;
  paymentId: string;
  branch: string;
  customerName: string;
  packageName: string;
  amountBdt: number;
  method: 'cash' | 'bkash' | 'nagad';
  paidAt: string;
  collector: string;
}

export interface PublicIncident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  updatedLabel: string;
  impact: string;
}

export interface FraudEvent {
  id: string;
  at: string;
  customerName: string;
  score: number;
  reason: string;
  status: 'open' | 'cleared' | 'blocked';
}

export interface ContractRow {
  id: string;
  customerName: string;
  title: string;
  status: 'draft' | 'sent' | 'signed' | 'expired';
  signedAt: string | null;
}

export interface DealerRow {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  area: string;
  customers: number;
  status: 'active' | 'suspended';
}

export interface AcsDevice {
  id: string;
  serial: string;
  manufacturer: string;
  model: string;
  lastInform: string;
  status: 'online' | 'offline';
}

export interface NetflowTalker {
  id: string;
  ip: string;
  username: string;
  rxGb: number;
  txGb: number;
  apps: string;
}

export interface NocHook {
  id: string;
  name: string;
  type: 'snmp' | 'webhook' | 'email';
  target: string;
  enabled: boolean;
}

export interface VpnTunnel {
  id: string;
  name: string;
  peer: string;
  protocol: 'wireguard' | 'ipsec' | 'l2tp';
  status: 'up' | 'down';
  uptime: string;
}

export interface IpoeSession {
  id: string;
  mac: string;
  ipv4: string;
  ipv6: string;
  vlan: number;
  uptime: string;
  status: 'online' | 'offline';
}

export interface BackupJob {
  id: string;
  name: string;
  target: string;
  lastRun: string;
  status: 'ok' | 'failed' | 'running';
  sizeMb: number;
}

export interface BandwidthSlaRow {
  id: string;
  link: string;
  committedMbps: number;
  avgMbps: number;
  uptimePct: number;
  breaches: number;
}

export interface MobilePlan {
  id: string;
  name: string;
  dataGb: number;
  validityDays: number;
  priceBdt: number;
  active: boolean;
}

export interface CollectionPoint {
  id: string;
  collector: string;
  lat: number;
  lng: number;
  area: string;
  stops: number;
  collectedBdt: number;
}

export const routerDetails: RouterDetail[] = [
  { id: 'rtr_1', name: 'MK-Gulshan-Core', ip: '103.112.10.2', cpuPct: 34, ramPct: 58, uptime: '42d 6h', version: '7.14.3', onlineUsers: 412 },
  { id: 'rtr_2', name: 'MK-Dhanmondi-Edge', ip: '103.112.10.14', cpuPct: 61, ramPct: 72, uptime: '18d 2h', version: '7.12.1', onlineUsers: 268 },
  { id: 'rtr_3', name: 'MK-Mirpur-POP', ip: '103.112.11.5', cpuPct: 22, ramPct: 41, uptime: '91d 11h', version: '7.14.3', onlineUsers: 189 },
];

export const pppoeSessions: PppoeSession[] = [
  { id: 'ses_01', routerId: 'rtr_1', username: 'user.rahim', ip: '10.20.1.44', uptime: '4h 12m', rxMbps: 42.1, txMbps: 8.3, mac: 'AA:BB:CC:11:22:33' },
  { id: 'ses_02', routerId: 'rtr_1', username: 'corp.acme', ip: '10.20.1.12', uptime: '2d 1h', rxMbps: 180.4, txMbps: 55.2, mac: 'AA:BB:CC:44:55:66' },
  { id: 'ses_03', routerId: 'rtr_2', username: 'user.fatima', ip: '10.21.3.88', uptime: '55m', rxMbps: 18.0, txMbps: 2.1, mac: 'DD:EE:FF:01:02:03' },
  { id: 'ses_04', routerId: 'rtr_1', username: 'user.karim', ip: '10.20.1.91', uptime: '9h 40m', rxMbps: 65.5, txMbps: 12.0, mac: '11:22:33:44:55:66' },
];

export const radiusNas: RadiusNas[] = [
  { id: 'nas_01', name: 'Gulshan Core', ip: '103.112.10.2', secretMasked: 'rad_****92', type: 'mikrotik', status: 'online' },
  { id: 'nas_02', name: 'Dhanmondi Edge', ip: '103.112.10.14', secretMasked: 'rad_****11', type: 'mikrotik', status: 'online' },
  { id: 'nas_03', name: 'Legacy Cisco', ip: '103.112.12.1', secretMasked: 'rad_****77', type: 'cisco', status: 'offline' },
];

export const radiusCoaLog: RadiusCoaLog[] = [
  { id: 'coa_01', at: '2026-09-07T18:10:00', nas: 'Gulshan Core', username: 'user.rahim', action: 'disconnect', result: 'ok' },
  { id: 'coa_02', at: '2026-09-07T17:55:00', nas: 'Dhanmondi Edge', username: 'user.fatima', action: 'coa', result: 'ok' },
  { id: 'coa_03', at: '2026-09-07T16:02:00', nas: 'Gulshan Core', username: 'corp.acme', action: 'pod', result: 'timeout' },
];

export const invoices: IspInvoice[] = [
  { id: 'inv_01', number: 'INV-2026-0901', customerName: 'Rahim Uddin', customerId: 'cust_001', period: '2026-09', amountBdt: 1200, taxBdt: 180, status: 'sent', dueDate: '2026-09-10' },
  { id: 'inv_02', number: 'INV-2026-0902', customerName: 'Acme Corp', customerId: 'cust_010', period: '2026-09', amountBdt: 18500, taxBdt: 2775, status: 'paid', dueDate: '2026-09-05' },
  { id: 'inv_03', number: 'INV-2026-0831', customerName: 'Fatima Begum', customerId: 'cust_002', period: '2026-08', amountBdt: 800, taxBdt: 120, status: 'overdue', dueDate: '2026-08-10' },
  { id: 'inv_04', number: 'INV-2026-0903', customerName: 'Karim Hossain', customerId: 'cust_003', period: '2026-09', amountBdt: 1500, taxBdt: 225, status: 'draft', dueDate: '2026-09-15' },
];

export const reconcileRows: ReconcileRow[] = [
  { id: 'rec_01', at: '2026-09-07T14:00:00', gateway: 'bKash', trxId: 'BKG9X221', amountBdt: 1200, matchedPaymentId: 'pay_101', status: 'matched' },
  { id: 'rec_02', at: '2026-09-07T13:40:00', gateway: 'Nagad', trxId: 'NGD8821', amountBdt: 800, matchedPaymentId: null, status: 'unmatched' },
  { id: 'rec_03', at: '2026-09-07T12:10:00', gateway: 'SSLCommerz', trxId: 'SSL991', amountBdt: 18500, matchedPaymentId: 'pay_099', status: 'duplicate' },
];

export const inactiveCustomers: InactiveCustomer[] = [
  { id: 'cust_201', name: 'Sajjad Ali', username: 'user.sajjad', packageName: 'Home 20Mbps', lastOnline: '2026-08-12T09:00:00', daysInactive: 26, area: 'Mirpur' },
  { id: 'cust_202', name: 'Nusrat Jahan', username: 'user.nusrat', packageName: 'Home 40Mbps', lastOnline: '2026-07-30T18:20:00', daysInactive: 39, area: 'Uttara' },
  { id: 'cust_203', name: 'Imran Kabir', username: 'user.imran', packageName: 'Biz 100Mbps', lastOnline: '2026-08-28T11:00:00', daysInactive: 10, area: 'Gulshan' },
];

export const ipNatLogs: IpNatLog[] = [
  { id: 'nat_01', at: '2026-09-07T18:01:12', publicIp: '103.112.20.8', privateIp: '10.20.1.44', port: 44321, protocol: 'tcp', username: 'user.rahim', bytes: 1_240_000 },
  { id: 'nat_02', at: '2026-09-07T18:01:08', publicIp: '103.112.20.8', privateIp: '10.20.1.12', port: 51200, protocol: 'udp', username: 'corp.acme', bytes: 8_900_000 },
  { id: 'nat_03', at: '2026-09-07T17:59:40', publicIp: '103.112.20.9', privateIp: '10.21.3.88', port: 33112, protocol: 'tcp', username: 'user.fatima', bytes: 220_000 },
];

export const billingPolicies: BillingPolicy[] = [
  { id: 'pol_01', name: 'Prepaid default', mode: 'prepaid', graceDays: 0, fupGb: 500, autoSuspend: true },
  { id: 'pol_02', name: 'Postpaid corporate', mode: 'postpaid', graceDays: 7, fupGb: null, autoSuspend: false },
  { id: 'pol_03', name: 'Hybrid home', mode: 'hybrid', graceDays: 3, fupGb: 800, autoSuspend: true },
];

export const taxSettings: TaxSetting[] = [
  { id: 'tax_01', name: 'VAT 15%', ratePct: 15, inclusive: false, applyTo: 'invoice', active: true },
  { id: 'tax_02', name: 'OTC service tax', ratePct: 5, inclusive: true, applyTo: 'otc', active: true },
];

export const reminders: ReminderRow[] = [
  { id: 'rem_01', customerName: 'Fatima Begum', channel: 'sms', template: 'due_day_3', scheduledAt: '2026-09-08T09:00:00', status: 'queued', dueBdt: 920 },
  { id: 'rem_02', customerName: 'Sajjad Ali', channel: 'whatsapp', template: 'due_day_7', scheduledAt: '2026-09-07T10:00:00', status: 'sent', dueBdt: 1500 },
  { id: 'rem_03', customerName: 'Imran Kabir', channel: 'voice', template: 'final_notice', scheduledAt: '2026-09-06T16:00:00', status: 'failed', dueBdt: 4200 },
];

export const cashbookEntries: CashbookEntry[] = [
  { id: 'cb_01', at: '2026-09-07T11:20:00', collector: 'Rafiq Field', customerName: 'Rahim Uddin', amountBdt: 1200, method: 'cash', note: 'Door collection' },
  { id: 'cb_02', at: '2026-09-07T12:05:00', collector: 'Rafiq Field', customerName: 'Karim Hossain', amountBdt: 1500, method: 'bkash', note: 'Personal bKash' },
  { id: 'cb_03', at: '2026-09-06T17:40:00', collector: 'Salma Desk', customerName: 'Nusrat Jahan', amountBdt: 800, method: 'nagad', note: 'Counter' },
];

export const oltOnus: OltOnu[] = [
  { id: 'onu_01', oltId: 'olt_01', sn: 'HWTC12345678', rxDbm: -22.4, txDbm: 2.1, status: 'online', customerName: 'Rahim Uddin' },
  { id: 'onu_02', oltId: 'olt_01', sn: 'HWTC87654321', rxDbm: -28.1, txDbm: 1.8, status: 'online', customerName: 'Fatima Begum' },
  { id: 'onu_03', oltId: 'olt_01', sn: 'ZTEA99887766', rxDbm: -34.0, txDbm: 0.9, status: 'los', customerName: 'Sajjad Ali' },
  { id: 'onu_04', oltId: 'olt_02', sn: 'HWTC11223344', rxDbm: -19.5, txDbm: 2.4, status: 'online', customerName: 'Acme Corp' },
];

export const oltVendors: OltVendor[] = [
  { id: 'olv_01', name: 'Huawei', models: 'MA5800, MA5608T', profileCount: 12, lastSync: '2026-09-07T08:00:00' },
  { id: 'olv_02', name: 'ZTE', models: 'C300, C320', profileCount: 8, lastSync: '2026-09-06T20:00:00' },
  { id: 'olv_03', name: 'VSOL', models: 'V1600D', profileCount: 5, lastSync: '2026-09-05T12:00:00' },
];

export const ponPorts: PonPort[] = [
  { id: 'pon_01', oltName: 'OLT-Gulshan-1', pon: '0/1/1', splitter: '1:32 A', usedOnus: 28, capacity: 32, avgRxDbm: -23.1 },
  { id: 'pon_02', oltName: 'OLT-Gulshan-1', pon: '0/1/2', splitter: '1:64 B', usedOnus: 41, capacity: 64, avgRxDbm: -25.8 },
  { id: 'pon_03', oltName: 'OLT-Mirpur-2', pon: '0/2/1', splitter: '1:32 C', usedOnus: 19, capacity: 32, avgRxDbm: -21.4 },
];

export const cpeAssignments: CpeAssignment[] = [
  { id: 'cpe_01', serial: 'CPE-99001', model: 'TP-Link XC220', customerName: 'Rahim Uddin', assignedAt: '2026-04-12', status: 'assigned' },
  { id: 'cpe_02', serial: 'CPE-99044', model: 'Huawei HS8145', customerName: 'Fatima Begum', assignedAt: '2026-06-01', status: 'assigned' },
  { id: 'cpe_03', serial: 'CPE-99102', model: 'ZTE F670L', customerName: '—', assignedAt: '—', status: 'spare' },
];

export const stockTransfers: StockTransfer[] = [
  { id: 'st_01', fromLocation: 'Central WH', toLocation: 'Gulshan Store', item: 'ONU HWTC', qty: 40, at: '2026-09-06', status: 'received' },
  { id: 'st_02', fromLocation: 'Gulshan Store', toLocation: 'Field Van-2', item: 'Patch cord SC/APC', qty: 100, at: '2026-09-07', status: 'pending' },
];

export const ipamBlocks: IpamBlock[] = [
  { id: 'ip_01', cidr: '10.20.0.0/16', family: 'v4', used: 4120, total: 65534, purpose: 'PPPoE CGNAT private' },
  { id: 'ip_02', cidr: '103.112.20.0/24', family: 'v4', used: 180, total: 254, purpose: 'Public static' },
  { id: 'ip_03', cidr: '2400:abc0:1000::/48', family: 'v6', used: 220, total: 65536, purpose: 'Dual-stack customers' },
];

export const cgnatMaps: CgnatMap[] = [
  { id: 'cgn_01', privateCidr: '10.20.0.0/16', publicPool: '103.112.20.8/29', portsPerUser: 2000, activeSessions: 3890 },
  { id: 'cgn_02', privateCidr: '10.21.0.0/16', publicPool: '103.112.20.16/29', portsPerUser: 2000, activeSessions: 2104 },
];

export const hotspotVouchers: HotspotVoucher[] = [
  { id: 'vou_01', code: 'HOT-A1B2', profile: '1 Hour 5GB', validityHours: 1, used: false, batch: 'SEP-BATCH-1' },
  { id: 'vou_02', code: 'HOT-C3D4', profile: '1 Day Unlimited', validityHours: 24, used: true, batch: 'SEP-BATCH-1' },
  { id: 'vou_03', code: 'HOT-E5F6', profile: '3 Hours 10GB', validityHours: 3, used: false, batch: 'SEP-BATCH-2' },
];

export const walledGardenRules: WalledGardenRule[] = [
  { id: 'wg_01', host: 'pay.isppaybd.com', comment: 'Payment portal', enabled: true },
  { id: 'wg_02', host: 'bkash.com', comment: 'bKash', enabled: true },
  { id: 'wg_03', host: '*.google.com', comment: 'Captive detection', enabled: true },
];

export const usageReports: UsageReportRow[] = [
  { id: 'usg_01', customerName: 'Acme Corp', packageName: 'Biz 200Mbps', downloadGb: 812, uploadGb: 220, peakMbps: 188, period: '2026-08' },
  { id: 'usg_02', customerName: 'Rahim Uddin', packageName: 'Home 40Mbps', downloadGb: 142, uploadGb: 18, peakMbps: 38, period: '2026-08' },
  { id: 'usg_03', customerName: 'Fatima Begum', packageName: 'Home 20Mbps', downloadGb: 64, uploadGb: 9, peakMbps: 19, period: '2026-08' },
];

export const outages: OutageRow[] = [
  { id: 'out_01', title: 'Fiber cut — Banani link', severity: 'critical', area: 'Banani', startedAt: '2026-09-07T15:40:00', status: 'identified', affected: 420 },
  { id: 'out_02', title: 'OLT reboot Mirpur', severity: 'major', area: 'Mirpur', startedAt: '2026-09-07T10:00:00', status: 'resolved', affected: 95 },
  { id: 'out_03', title: 'DNS latency spike', severity: 'minor', area: 'All', startedAt: '2026-09-06T22:00:00', status: 'monitoring', affected: 0 },
];

export const dunningSteps: DunningStep[] = [
  { id: 'dun_01', dayOffset: -3, action: 'Friendly reminder', channel: 'SMS', enabled: true },
  { id: 'dun_02', dayOffset: 0, action: 'Due day notice', channel: 'WhatsApp', enabled: true },
  { id: 'dun_03', dayOffset: 3, action: 'Grace warning', channel: 'Voice', enabled: true },
  { id: 'dun_04', dayOffset: 7, action: 'Suspend + CoA', channel: 'System', enabled: true },
];

export const prorationExamples: ProrationExample[] = [
  { id: 'pro_01', fromPackage: 'Home 20', toPackage: 'Home 40', daysUsed: 10, creditBdt: 267, chargeBdt: 400, netBdt: 133 },
  { id: 'pro_02', fromPackage: 'Biz 100', toPackage: 'Biz 200', daysUsed: 5, creditBdt: 1417, chargeBdt: 3083, netBdt: 1666 },
];

export const creditNotes: CreditNote[] = [
  { id: 'cr_01', number: 'CN-2026-014', customerName: 'Rahim Uddin', amountBdt: 200, reason: 'Outage goodwill', at: '2026-09-05', status: 'applied' },
  { id: 'cr_02', number: 'CN-2026-015', customerName: 'Acme Corp', amountBdt: 1500, reason: 'Billing error', at: '2026-09-06', status: 'open' },
];

export const deposits: DepositRow[] = [
  { id: 'dep_01', customerName: 'Karim Hossain', type: 'deposit', amountBdt: 2000, at: '2026-04-01', refundable: true },
  { id: 'dep_02', customerName: 'Acme Corp', type: 'otc', amountBdt: 5000, at: '2026-03-15', refundable: false },
];

export const popCommissions: PopCommission[] = [
  { id: 'pc_01', popName: 'Mirpur POP', period: '2026-08', collectedBdt: 220000, ratePct: 8, commissionBdt: 17600, status: 'paid' },
  { id: 'pc_02', popName: 'Uttara POP', period: '2026-08', collectedBdt: 145000, ratePct: 7, commissionBdt: 10150, status: 'pending' },
];

export const packageProfitRows: PackageProfitRow[] = [
  { id: 'pp_01', popName: 'Mirpur POP', packageName: 'Home 40', customers: 180, revenueBdt: 216000, costBdt: 90000, profitBdt: 126000 },
  { id: 'pp_02', popName: 'Uttara POP', packageName: 'Home 20', customers: 220, revenueBdt: 176000, costBdt: 88000, profitBdt: 88000 },
];

export const workOrders: WorkOrder[] = [
  { id: 'job_01', title: 'New install — Banani', customerName: 'Lead: Rina', type: 'install', assignee: 'Rafiq Field', status: 'open', dueAt: '2026-09-08' },
  { id: 'job_02', title: 'LOS repair', customerName: 'Sajjad Ali', type: 'repair', assignee: 'Imtiaz Tech', status: 'in_progress', dueAt: '2026-09-07' },
  { id: 'job_03', title: 'Cash collection route', customerName: 'Multiple', type: 'collect', assignee: 'Salma Desk', status: 'done', dueAt: '2026-09-06' },
];

export const leads: LeadRow[] = [
  { id: 'lead_01', name: 'Rina Akter', phone: '01711xxxxxx', area: 'Banani', packageInterest: 'Home 40', stage: 'survey', owner: 'Sales-1' },
  { id: 'lead_02', name: 'TechPark Ltd', phone: '01822xxxxxx', area: 'Motijheel', packageInterest: 'Biz 200', stage: 'contacted', owner: 'Sales-2' },
  { id: 'lead_03', name: 'Hasan Mia', phone: '01933xxxxxx', area: 'Keraniganj', packageInterest: 'Home 20', stage: 'new', owner: 'Sales-1' },
];

export const customerGroups: CustomerGroup[] = [
  { id: 'grp_01', name: 'Acme HQ + Branches', parentName: 'Acme Corp', members: 6, billingMode: 'consolidated' },
  { id: 'grp_02', name: 'Rahim Family', parentName: 'Rahim Uddin', members: 3, billingMode: 'individual' },
];

export const kycDocs: KycDoc[] = [
  { id: 'kyc_01', customerId: 'cust_001', type: 'nid', fileName: 'rahim-nid.pdf', uploadedAt: '2026-04-10', status: 'verified' },
  { id: 'kyc_02', customerId: 'cust_001', type: 'photo', fileName: 'rahim-photo.jpg', uploadedAt: '2026-04-10', status: 'verified' },
  { id: 'kyc_03', customerId: 'cust_010', type: 'trade', fileName: 'acme-trade.pdf', uploadedAt: '2026-03-01', status: 'pending' },
];

export const usageAlertRules: UsageAlertRule[] = [
  { id: 'ua_01', name: '80% FUP warning', thresholdPct: 80, channel: 'SMS', enabled: true },
  { id: 'ua_02', name: '95% FUP critical', thresholdPct: 95, channel: 'WhatsApp', enabled: true },
];

export const announcements: Announcement[] = [
  { id: 'ann_01', title: 'Scheduled maintenance Sun 2am', audience: 'all', startsAt: '2026-09-07', endsAt: '2026-09-08', active: true },
  { id: 'ann_02', title: 'Eid holiday support hours', audience: 'customers', startsAt: '2026-09-01', endsAt: '2026-09-05', active: false },
];

export const referralAnalytics: ReferralAnalyticsRow[] = [
  { id: 'ref_01', referrer: 'Rahim Uddin', referrals: 8, converted: 5, rewardBdt: 2500 },
  { id: 'ref_02', referrer: 'Fatima Begum', referrals: 3, converted: 2, rewardBdt: 1000 },
];

export const addons: AddonRow[] = [
  { id: 'add_01', name: 'Bongo OTT', category: 'ott', priceBdt: 199, active: true },
  { id: 'add_02', name: 'IPTV Basic', category: 'iptv', priceBdt: 150, active: true },
  { id: 'add_03', name: 'Public Static IP', category: 'static_ip', priceBdt: 500, active: true },
];

export const serviceTypes: ServiceType[] = [
  { id: 'svc_01', name: 'Home Broadband', code: 'HOME', customers: 4200 },
  { id: 'svc_02', name: 'Corporate', code: 'CORP', customers: 180 },
  { id: 'svc_03', name: 'Hotspot', code: 'HOT', customers: 0 },
];

export const apiKeys: ApiKeyRow[] = [
  { id: 'ak_01', name: 'Mobile app', keyMasked: 'isp_****9f2a', createdAt: '2026-01-12', lastUsedAt: '2026-09-07', scopes: 'read:customer write:payment' },
  { id: 'ak_02', name: 'Accounting sync', keyMasked: 'isp_****11bc', createdAt: '2026-05-01', lastUsedAt: '2026-09-06', scopes: 'read:invoice' },
];

export const webhooks: WebhookRow[] = [
  { id: 'wh_01', url: 'https://hooks.example.com/isp', events: 'payment.paid,customer.suspended', status: 'active', lastDeliveryAt: '2026-09-07T17:00:00' },
  { id: 'wh_02', url: 'https://crm.example.com/hooks', events: 'lead.won', status: 'failing', lastDeliveryAt: '2026-09-05T09:00:00' },
];

export const brandingSettings: BrandingSettings = {
  companyName: 'Demo ISP Pay BD',
  primaryColor: '#f75803',
  logoUrl: '/brand/logo.svg',
  supportPhone: '09678-xxxxxx',
  supportEmail: 'support@demo.isppaybd.com',
  customDomain: 'portal.demo.isppaybd.com',
};

export const posReceipts: PosReceipt[] = [
  {
    id: 'pos_01',
    paymentId: 'pay_101',
    branch: 'Demo Branch · Gulshan',
    customerName: 'Rahim Uddin',
    packageName: 'Home 40 Mbps',
    amountBdt: 1200,
    method: 'cash',
    paidAt: '2026-09-07 11:42',
    collector: 'Salma Desk',
  },
  {
    id: 'pos_02',
    paymentId: 'pay_102',
    branch: 'Demo Branch · Banani',
    customerName: 'Karim Mia',
    packageName: 'Home 20 Mbps',
    amountBdt: 800,
    method: 'bkash',
    paidAt: '2026-09-07 10:15',
    collector: 'Rafiq Field',
  },
];

export const publicIncidents: PublicIncident[] = [
  {
    id: 'inc_01',
    title: 'Fiber cut — Banani link',
    status: 'investigating',
    updatedLabel: '15 min ago',
    impact: 'Partial · Banani / Mohakhali',
  },
  {
    id: 'inc_02',
    title: 'OLT reboot Mirpur',
    status: 'resolved',
    updatedLabel: '6 hours ago',
    impact: 'Resolved · Mirpur-1 POP',
  },
];

export const publicStatus = {
  overall: 'operational' as const,
  message: 'Core routing and billing APIs healthy',
  incidents: publicIncidents,
};

export const fraudEvents: FraudEvent[] = [
  { id: 'fr_01', at: '2026-09-07T12:00:00', customerName: 'user.suspicious', score: 86, reason: 'Multiple MAC / same login', status: 'open' },
  { id: 'fr_02', at: '2026-09-06T20:00:00', customerName: 'user.vpnshare', score: 72, reason: 'Concurrent sessions', status: 'cleared' },
];

export const contracts: ContractRow[] = [
  { id: 'ct_01', customerName: 'Acme Corp', title: 'Annual SLA 2026', status: 'signed', signedAt: '2026-01-15' },
  { id: 'ct_02', customerName: 'TechPark Ltd', title: 'Service agreement', status: 'sent', signedAt: null },
];

export const dealers: DealerRow[] = [
  { id: 'dl_01', name: 'City Link Dealer', tier: 1, area: 'Dhaka North', customers: 520, status: 'active' },
  { id: 'dl_02', name: 'Rural Net Tier-3', tier: 3, area: 'Gazipur', customers: 140, status: 'active' },
  { id: 'dl_03', name: 'Edge Agents', tier: 6, area: 'Narayanganj', customers: 45, status: 'suspended' },
];

export const acsDevices: AcsDevice[] = [
  { id: 'acs_01', serial: 'CPEacs001', manufacturer: 'Huawei', model: 'HS8145V5', lastInform: '2026-09-07T18:00:00', status: 'online' },
  { id: 'acs_02', serial: 'CPEacs002', manufacturer: 'ZTE', model: 'F670L', lastInform: '2026-09-07T12:00:00', status: 'offline' },
];

export const netflowTopTalkers: NetflowTalker[] = [
  { id: 'nf_01', ip: '10.20.1.12', username: 'corp.acme', rxGb: 120.4, txGb: 40.2, apps: 'HTTPS, Zoom' },
  { id: 'nf_02', ip: '10.20.1.44', username: 'user.rahim', rxGb: 28.1, txGb: 3.2, apps: 'YouTube, Gaming' },
];

export const nocHooks: NocHook[] = [
  { id: 'noc_01', name: 'Core switch SNMP', type: 'snmp', target: '10.0.0.1', enabled: true },
  { id: 'noc_02', name: 'PagerDuty webhook', type: 'webhook', target: 'https://events.pagerduty.com/...', enabled: true },
];

export const vpnTunnels: VpnTunnel[] = [
  { id: 'vpn_01', name: 'POP-Mirpur WG', peer: '103.55.1.2', protocol: 'wireguard', status: 'up', uptime: '30d' },
  { id: 'vpn_02', name: 'Backup IPsec', peer: '103.55.2.8', protocol: 'ipsec', status: 'down', uptime: '—' },
];

export const ipoeSessions: IpoeSession[] = [
  { id: 'ipo_01', mac: 'AA:11:22:33:44:55', ipv4: '10.30.1.10', ipv6: '2400:abc0:1000::10', vlan: 100, uptime: '3d 2h', status: 'online' },
  { id: 'ipo_02', mac: 'BB:22:33:44:55:66', ipv4: '10.30.1.22', ipv6: '2400:abc0:1000::22', vlan: 110, uptime: '12h', status: 'online' },
];

export const backupJobs: BackupJob[] = [
  { id: 'bk_01', name: 'Daily DB', target: 'S3 isppay-backups', lastRun: '2026-09-07T02:00:00', status: 'ok', sizeMb: 842 },
  { id: 'bk_02', name: 'Router configs', target: 'Local NAS', lastRun: '2026-09-07T03:00:00', status: 'ok', sizeMb: 12 },
  { id: 'bk_03', name: 'Weekly full', target: 'S3 isppay-backups', lastRun: '2026-09-01T01:00:00', status: 'failed', sizeMb: 0 },
];

export const bandwidthSla: BandwidthSlaRow[] = [
  { id: 'sla_01', link: 'NTTN Primary', committedMbps: 10000, avgMbps: 8200, uptimePct: 99.95, breaches: 0 },
  { id: 'sla_02', link: 'IIG Secondary', committedMbps: 5000, avgMbps: 4100, uptimePct: 99.2, breaches: 2 },
];

export const mobilePlans: MobilePlan[] = [
  { id: 'mob_01', name: 'LTE 30GB', dataGb: 30, validityDays: 30, priceBdt: 499, active: true },
  { id: 'mob_02', name: 'LTE Unlimited Night', dataGb: 100, validityDays: 30, priceBdt: 699, active: true },
];

export const collectionPoints: CollectionPoint[] = [
  { id: 'col_01', collector: 'Rafiq Field', lat: 23.7925, lng: 90.4078, area: 'Banani', stops: 12, collectedBdt: 18400 },
  { id: 'col_02', collector: 'Salma Desk', lat: 23.8103, lng: 90.4125, area: 'Gulshan', stops: 8, collectedBdt: 11200 },
];

/** Aggregate domain payload for `admin.domain` → `ispOps` */
export const ispOpsData = {
  routerDetails,
  pppoeSessions,
  radiusNas,
  radiusCoaLog,
  invoices,
  reconcileRows,
  inactiveCustomers,
  ipNatLogs,
  billingPolicies,
  taxSettings,
  reminders,
  cashbookEntries,
  oltOnus,
  oltVendors,
  ponPorts,
  cpeAssignments,
  stockTransfers,
  ipamBlocks,
  cgnatMaps,
  hotspotVouchers,
  walledGardenRules,
  usageReports,
  outages,
  dunningSteps,
  prorationExamples,
  creditNotes,
  deposits,
  popCommissions,
  packageProfitRows,
  workOrders,
  leads,
  customerGroups,
  kycDocs,
  usageAlertRules,
  announcements,
  referralAnalytics,
  addons,
  serviceTypes,
  apiKeys,
  webhooks,
  brandingSettings,
  fraudEvents,
  contracts,
  dealers,
  acsDevices,
  netflowTopTalkers,
  nocHooks,
  vpnTunnels,
  ipoeSessions,
  backupJobs,
  bandwidthSla,
  mobilePlans,
  collectionPoints,
  posReceipts,
  publicStatus,
};

export type IspOpsData = typeof ispOpsData;

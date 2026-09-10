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
  customerPhone?: string;
  packageName?: string;
  area?: string;
  period: string;
  amountBdt: number;
  taxBdt: number;
  discountBdt?: number;
  paidAmountBdt?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  paymentMethod?: 'bKash' | 'Nagad' | 'Cash' | 'Bank Transfer' | 'Card';
  trxId?: string;
  paidAt?: string;
  dueDate: string;
  createdAt?: string;
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
  throttleSpeedMbps?: number;
  autoSuspend: boolean;
  customersCount?: number;
  description?: string;
}

export interface TaxSetting {
  id: string;
  name: string;
  ratePct: number;
  inclusive: boolean;
  applyTo: 'invoice' | 'otc' | 'both';
  code?: string;
  nbrCode?: string;
  description?: string;
  collectedThisMonthBdt?: number;
  active: boolean;
}

export interface ReminderRow {
  id: string;
  reminderNo?: string;
  customerName: string;
  customerId?: string;
  customerPhone?: string;
  area?: string;
  channel: 'sms' | 'whatsapp' | 'email' | 'voice';
  template: string;
  messagePreview?: string;
  scheduledAt: string;
  sentAt?: string;
  status: 'queued' | 'sent' | 'failed' | 'delivered';
  dueBdt: number;
  deliveryResponse?: string;
}

export interface CashbookEntry {
  id: string;
  receiptNo?: string;
  at: string;
  collector: string;
  collectorPhone?: string;
  customerName: string;
  customerId?: string;
  customerArea?: string;
  amountBdt: number;
  method: 'cash' | 'bkash' | 'nagad' | 'bank';
  note: string;
  verifiedByAccounts?: boolean;
  depositSlipNo?: string;
  status?: 'collected' | 'deposited' | 'verified';
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
  channel: 'SMS' | 'WhatsApp' | 'Email' | 'Voice' | 'System';
  templateName?: string;
  messagePreview?: string;
  targetAudience?: string;
  enabled: boolean;
}

export interface ProrationExample {
  id: string;
  customerName?: string;
  fromPackage: string;
  fromPriceBdt?: number;
  toPackage: string;
  toPriceBdt?: number;
  daysUsed: number;
  cycleDays?: number;
  creditBdt: number;
  chargeBdt: number;
  netBdt: number;
  actionType?: 'upgrade' | 'downgrade';
}

export interface CreditNote {
  id: string;
  number: string;
  customerName: string;
  customerId?: string;
  customerPhone?: string;
  area?: string;
  amountBdt: number;
  reason: string;
  invoiceNo?: string;
  approvedBy?: string;
  at: string;
  status: 'open' | 'applied' | 'void';
}

export interface DepositRow {
  id: string;
  customerName: string;
  customerId?: string;
  type: 'deposit' | 'otc' | 'installation' | 'router_deposit';
  itemDescription?: string;
  amountBdt: number;
  at: string;
  refundable: boolean;
  status?: 'active' | 'refunded' | 'adjusted';
  paymentMethod?: 'cash' | 'bkash' | 'nagad' | 'bank';
  voucherNo?: string;
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
  orderNo?: string;
  title: string;
  customerName: string;
  customerId?: string;
  phone?: string;
  area?: string;
  address?: string;
  type: 'install' | 'repair' | 'shift' | 'collect' | 'upgrade' | 'maintenance';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  assignee: string;
  assigneePhone?: string;
  team?: string;
  status: 'open' | 'in_progress' | 'done' | 'cancelled' | 'pending_materials';
  dueAt: string;
  createdAt?: string;
  estimatedMinutes?: number;
  materialsUsed?: string;
  notes?: string;
}

export interface LeadRow {
  id: string;
  leadNo?: string;
  name: string;
  organization?: string;
  phone: string;
  email?: string;
  area: string;
  address?: string;
  packageInterest: string;
  estimatedMonthlyBdt?: number;
  otcQuoteBdt?: number;
  stage: 'new' | 'contacted' | 'survey' | 'negotiation' | 'won' | 'lost';
  owner: string;
  source?: 'website' | 'referral' | 'field_agent' | 'social' | 'inbound_call';
  surveyFeasible?: boolean;
  notes?: string;
  createdAt?: string;
  lastContactedAt?: string;
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
  customerName?: string;
  mac?: string;
  router?: string;
  interfaceName?: string;
  rxGb: number;
  txGb: number;
  currentRxMbps?: number;
  currentTxMbps?: number;
  packetsPerSec?: number;
  activeFlows?: number;
  tcpFlows?: number;
  udpFlows?: number;
  apps: string;
  topDestination?: string;
  status?: 'bursting' | 'active' | 'idle';
  lastSeen?: string;
  fupLimitGb?: number;
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
  { id: 'ses_02', routerId: 'rtr_1', username: 'corp.mirpur', ip: '10.20.1.12', uptime: '2d 1h', rxMbps: 180.4, txMbps: 55.2, mac: 'AA:BB:CC:44:55:66' },
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
  { id: 'coa_03', at: '2026-09-07T16:02:00', nas: 'Gulshan Core', username: 'corp.mirpur', action: 'pod', result: 'timeout' },
];

export const invoices: IspInvoice[] = [
  {
    id: 'inv_01',
    number: 'INV-2026-0901',
    customerName: 'Rahim Uddin',
    customerId: 'cust_001',
    customerPhone: '+880 1711-234567',
    packageName: 'Home Ultra 40 Mbps',
    area: 'Gulshan-2, Dhaka',
    period: '2026-09',
    amountBdt: 1200,
    taxBdt: 180,
    discountBdt: 0,
    paidAmountBdt: 0,
    status: 'sent',
    paymentMethod: 'bKash',
    dueDate: '2026-09-15',
    createdAt: '2026-09-01',
  },
  {
    id: 'inv_02',
    number: 'INV-2026-0902',
    customerName: 'Mirpur Biz Link Headquarters',
    customerId: 'cust_010',
    customerPhone: '+880 1822-998877',
    packageName: 'Corporate Fiber 200 Mbps',
    area: 'Mirpur-10, Dhaka',
    period: '2026-09',
    amountBdt: 18500,
    taxBdt: 2775,
    discountBdt: 500,
    paidAmountBdt: 20775,
    status: 'paid',
    paymentMethod: 'Bank Transfer',
    trxId: 'EBL-TRX-992144',
    paidAt: '2026-09-04 14:30',
    dueDate: '2026-09-05',
    createdAt: '2026-09-01',
  },
  {
    id: 'inv_03',
    number: 'INV-2026-0831',
    customerName: 'Fatima Begum',
    customerId: 'cust_002',
    customerPhone: '+880 1933-445566',
    packageName: 'Home Basic 20 Mbps',
    area: 'Dhanmondi 8/A, Dhaka',
    period: '2026-08',
    amountBdt: 800,
    taxBdt: 120,
    discountBdt: 0,
    paidAmountBdt: 0,
    status: 'overdue',
    paymentMethod: 'Nagad',
    dueDate: '2026-08-10',
    createdAt: '2026-08-01',
  },
  {
    id: 'inv_04',
    number: 'INV-2026-0903',
    customerName: 'Karim Hossain',
    customerId: 'cust_003',
    customerPhone: '+880 1744-556677',
    packageName: 'Home Turbo 50 Mbps',
    area: 'Uttara Sector 7, Dhaka',
    period: '2026-09',
    amountBdt: 1500,
    taxBdt: 225,
    discountBdt: 0,
    paidAmountBdt: 0,
    status: 'draft',
    dueDate: '2026-09-20',
    createdAt: '2026-09-07',
  },
  {
    id: 'inv_05',
    number: 'INV-2026-0904',
    customerName: 'Banani Cyber Dynamics Ltd',
    customerId: 'cust_012',
    customerPhone: '+880 1755-112233',
    packageName: 'Dedicated Premium 100 Mbps',
    area: 'Banani Block C, Dhaka',
    period: '2026-09',
    amountBdt: 12500,
    taxBdt: 1875,
    discountBdt: 0,
    paidAmountBdt: 14375,
    status: 'paid',
    paymentMethod: 'bKash',
    trxId: 'BKG9X882190',
    paidAt: '2026-09-06 11:20',
    dueDate: '2026-09-10',
    createdAt: '2026-09-01',
  },
  {
    id: 'inv_06',
    number: 'INV-2026-0905',
    customerName: 'Sajjad Ali',
    customerId: 'cust_005',
    customerPhone: '+880 1819-776655',
    packageName: 'Home Gamer 35 Mbps',
    area: 'Mirpur-2, Dhaka',
    period: '2026-09',
    amountBdt: 1000,
    taxBdt: 150,
    discountBdt: 0,
    paidAmountBdt: 0,
    status: 'sent',
    dueDate: '2026-09-12',
    createdAt: '2026-09-01',
  },
  {
    id: 'inv_07',
    number: 'INV-2026-0832',
    customerName: 'TechPark Enterprise Solutions',
    customerId: 'cust_015',
    customerPhone: '+880 1912-334455',
    packageName: 'Symmetric Biz 150 Mbps',
    area: 'Motijheel C/A, Dhaka',
    period: '2026-08',
    amountBdt: 25000,
    taxBdt: 3750,
    discountBdt: 1000,
    paidAmountBdt: 0,
    status: 'overdue',
    dueDate: '2026-08-25',
    createdAt: '2026-08-10',
  },
  {
    id: 'inv_08',
    number: 'INV-2026-0906',
    customerName: 'Nusrat Jahan',
    customerId: 'cust_006',
    customerPhone: '+880 1622-443322',
    packageName: 'Home Basic 20 Mbps',
    area: 'Uttara Sector 11, Dhaka',
    period: '2026-09',
    amountBdt: 800,
    taxBdt: 120,
    discountBdt: 0,
    paidAmountBdt: 920,
    status: 'paid',
    paymentMethod: 'Cash',
    paidAt: '2026-09-05 16:45',
    dueDate: '2026-09-10',
    createdAt: '2026-09-01',
  },
];

export const reconcileRows: ReconcileRow[] = [
  { id: 'rec_01', at: '2026-09-07 14:00', gateway: 'bKash Direct (PGW)', trxId: 'BKG9X22190', amountBdt: 1200, matchedPaymentId: 'PAY-2026-0901', status: 'matched' },
  { id: 'rec_02', at: '2026-09-07 13:40', gateway: 'Nagad Online', trxId: 'NGD8821044', amountBdt: 800, matchedPaymentId: null, status: 'unmatched' },
  { id: 'rec_03', at: '2026-09-07 12:10', gateway: 'SSLCommerz Gateway', trxId: 'SSL9914482', amountBdt: 18500, matchedPaymentId: 'PAY-2026-0899', status: 'duplicate' },
  { id: 'rec_04', at: '2026-09-07 11:15', gateway: 'bKash Merchant (QR)', trxId: 'BKQR771120', amountBdt: 1500, matchedPaymentId: 'PAY-2026-0904', status: 'matched' },
  { id: 'rec_05', at: '2026-09-07 09:30', gateway: 'Rocket DBBL', trxId: 'RKT5521990', amountBdt: 2200, matchedPaymentId: null, status: 'unmatched' },
  { id: 'rec_06', at: '2026-09-06 18:20', gateway: 'City Bank CityTouch', trxId: 'CBL-EFT-9912', amountBdt: 8500, matchedPaymentId: 'PAY-2026-0870', status: 'matched' },
];

export const inactiveCustomers: InactiveCustomer[] = [
  { id: 'cust_201', name: 'Sajjad Ali', username: 'user.sajjad', packageName: 'Home 20Mbps', lastOnline: '2026-08-12T09:00:00', daysInactive: 26, area: 'Mirpur' },
  { id: 'cust_202', name: 'Nusrat Jahan', username: 'user.nusrat', packageName: 'Home 40Mbps', lastOnline: '2026-07-30T18:20:00', daysInactive: 39, area: 'Uttara' },
  { id: 'cust_203', name: 'Imran Kabir', username: 'user.imran', packageName: 'Biz 100Mbps', lastOnline: '2026-08-28T11:00:00', daysInactive: 10, area: 'Gulshan' },
];

export const ipNatLogs: IpNatLog[] = [
  { id: 'nat_01', at: '2026-09-07T18:01:12', publicIp: '103.112.20.8', privateIp: '10.20.1.44', port: 44321, protocol: 'tcp', username: 'user.rahim', bytes: 1_240_000 },
  { id: 'nat_02', at: '2026-09-07T18:01:08', publicIp: '103.112.20.8', privateIp: '10.20.1.12', port: 51200, protocol: 'udp', username: 'corp.mirpur', bytes: 8_900_000 },
  { id: 'nat_03', at: '2026-09-07T17:59:40', publicIp: '103.112.20.9', privateIp: '10.21.3.88', port: 33112, protocol: 'tcp', username: 'user.fatima', bytes: 220_000 },
];

export const billingPolicies: BillingPolicy[] = [
  {
    id: 'pol_01',
    name: 'Prepaid Standard Policy',
    mode: 'prepaid',
    graceDays: 0,
    fupGb: 500,
    throttleSpeedMbps: 5,
    autoSuspend: true,
    customersCount: 3420,
    description: 'Pay-first billing. Automatic disconnection on expiration date without grace.',
  },
  {
    id: 'pol_02',
    name: 'Postpaid Corporate Premium',
    mode: 'postpaid',
    graceDays: 7,
    fupGb: null,
    throttleSpeedMbps: 20,
    autoSuspend: false,
    customersCount: 180,
    description: 'Net 7 days corporate invoice billing with dedicated account manager grace.',
  },
  {
    id: 'pol_03',
    name: 'Hybrid Home Broadband',
    mode: 'hybrid',
    graceDays: 3,
    fupGb: 800,
    throttleSpeedMbps: 10,
    autoSuspend: true,
    customersCount: 890,
    description: 'Prepaid cycle with 72-hour grace period and WhatsApp reminder.',
  },
  {
    id: 'pol_04',
    name: 'Dedicated Enterprise SLA',
    mode: 'postpaid',
    graceDays: 15,
    fupGb: null,
    throttleSpeedMbps: 50,
    autoSuspend: false,
    customersCount: 45,
    description: 'Net 15 days SLA contract billing for corporate banking and IT enterprises.',
  },
];

export const taxSettings: TaxSetting[] = [
  {
    id: 'tax_01',
    name: 'Broadband Internet VAT (NBR 15%)',
    ratePct: 15,
    inclusive: false,
    applyTo: 'invoice',
    code: 'VAT-15-ISP',
    nbrCode: 'Mushak-6.3-9901',
    description: 'Standard 15% value added tax for monthly ISP subscription fees.',
    collectedThisMonthBdt: 42500,
    active: true,
  },
  {
    id: 'tax_02',
    name: 'One-Time Connection (OTC) Service Tax',
    ratePct: 5,
    inclusive: true,
    applyTo: 'otc',
    code: 'TAX-OTC-5',
    nbrCode: 'Mushak-6.3-8812',
    description: '5% inclusive service levy on fiber optical installation & drop-wire charge.',
    collectedThisMonthBdt: 8400,
    active: true,
  },
  {
    id: 'tax_03',
    name: 'Advance Income Tax (AIT Deduction)',
    ratePct: 3,
    inclusive: false,
    applyTo: 'invoice',
    code: 'AIT-3-CORP',
    nbrCode: 'AIT-SEC-52',
    description: '3% corporate withholding tax deducted by corporate & educational institutions.',
    collectedThisMonthBdt: 15800,
    active: true,
  },
  {
    id: 'tax_04',
    name: 'Hardware & ONU Equipment Sales Tax',
    ratePct: 7.5,
    inclusive: true,
    applyTo: 'both',
    code: 'HW-TAX-7.5',
    nbrCode: 'Mushak-6.3-7740',
    description: 'Applicable when selling dual-band WiFi routers or replacement GPON ONUs.',
    collectedThisMonthBdt: 3200,
    active: false,
  },
];

export const reminders: ReminderRow[] = [
  {
    id: 'rem_01',
    reminderNo: 'REM-2026-0901',
    customerName: 'Fatima Begum',
    customerId: 'cust_002',
    customerPhone: '+880 1712-334455',
    area: 'Gulshan-1, Dhaka',
    channel: 'sms',
    template: 'Friendly Due Warning (Day -3)',
    messagePreview: 'Dear Fatima Begum, your ISP internet bill ৳920 is due on 10-Sep-2026. Pay via bKash to avoid suspension.',
    scheduledAt: '2026-09-08 09:00',
    sentAt: '2026-09-08 09:01',
    status: 'delivered',
    dueBdt: 920,
    deliveryResponse: 'SMS Gateway Success (ID: SM9921)',
  },
  {
    id: 'rem_02',
    reminderNo: 'REM-2026-0902',
    customerName: 'Sajjad Ali',
    customerId: 'cust_005',
    customerPhone: '+880 1819-776655',
    area: 'Mirpur-2, Dhaka',
    channel: 'whatsapp',
    template: 'Due Date Alert (Day 0)',
    messagePreview: 'Assalamu Alaikum Sajjad Ali, your bill ৳1,500 is due TODAY. Click to pay instantly: https://pay.isppaybd.com/i/905',
    scheduledAt: '2026-09-07 10:00',
    sentAt: '2026-09-07 10:00',
    status: 'sent',
    dueBdt: 1500,
    deliveryResponse: 'WhatsApp Read Receipt (Double Blue Tick)',
  },
  {
    id: 'rem_03',
    reminderNo: 'REM-2026-0903',
    customerName: 'Imran Kabir',
    customerId: 'cust_020',
    customerPhone: '+880 1911-223344',
    area: 'Dhanmondi, Dhaka',
    channel: 'voice',
    template: 'IVR Voice Reminder (Day +3)',
    messagePreview: 'Automated Bengali IVR call informing customer of overdue balance and immediate auto-cutoff policy.',
    scheduledAt: '2026-09-06 16:00',
    status: 'failed',
    dueBdt: 4200,
    deliveryResponse: 'Subscriber Unreachable / Busy',
  },
  {
    id: 'rem_04',
    reminderNo: 'REM-2026-0904',
    customerName: 'Banani Cyber Dynamics Ltd',
    customerId: 'cust_012',
    customerPhone: '+880 1755-112233',
    area: 'Banani Block C, Dhaka',
    channel: 'email',
    template: 'Corporate Formal Mushak Invoice (Day -5)',
    messagePreview: 'Official NBR Mushak 6.3 PDF attached for Monthly Dedicated Bandwidth invoice ৳14,375.',
    scheduledAt: '2026-09-08 11:30',
    status: 'queued',
    dueBdt: 14375,
    deliveryResponse: 'Queued in Mail Relay',
  },
  {
    id: 'rem_05',
    reminderNo: 'REM-2026-0905',
    customerName: 'Tanvir Hossain',
    customerId: 'cust_008',
    customerPhone: '+880 1622-334455',
    area: 'Uttara Sector 13, Dhaka',
    channel: 'sms',
    template: 'Pre-Cutoff Notice (Day +5)',
    messagePreview: 'Final Notice: Line suspension scheduled in 24 hours. Pay bill ৳1,200 immediately.',
    scheduledAt: '2026-09-08 12:00',
    status: 'queued',
    dueBdt: 1200,
    deliveryResponse: 'Pending scheduler run',
  },
];

export const cashbookEntries: CashbookEntry[] = [
  {
    id: 'cb_01',
    receiptNo: 'REC-2026-0901',
    at: '2026-09-07 11:20',
    collector: 'Rafiq Field (Lineman)',
    collectorPhone: '+880 1711-998877',
    customerName: 'Rahim Uddin',
    customerId: 'cust_001',
    customerArea: 'Gulshan-2, Road 45',
    amountBdt: 1200,
    method: 'cash',
    note: 'Door-to-door monthly collection. Cash handed with paper receipt #8812.',
    verifiedByAccounts: true,
    depositSlipNo: 'SLIP-CBL-0901',
    status: 'verified',
  },
  {
    id: 'cb_02',
    receiptNo: 'REC-2026-0902',
    at: '2026-09-07 12:05',
    collector: 'Rafiq Field (Lineman)',
    collectorPhone: '+880 1711-998877',
    customerName: 'Karim Hossain',
    customerId: 'cust_003',
    customerArea: 'Banani Block B',
    amountBdt: 1500,
    method: 'bkash',
    note: 'Collected via Agent Personal bKash in field. TrxID: BK771290.',
    verifiedByAccounts: true,
    depositSlipNo: 'BK-TRF-0091',
    status: 'deposited',
  },
  {
    id: 'cb_03',
    receiptNo: 'REC-2026-0903',
    at: '2026-09-06 17:40',
    collector: 'Salma Desk (Accounts Desk)',
    collectorPhone: '+880 1812-445566',
    customerName: 'Nusrat Jahan',
    customerId: 'cust_006',
    customerArea: 'Uttara Sector 11',
    amountBdt: 800,
    method: 'cash',
    note: 'Head office front counter walk-in payment.',
    verifiedByAccounts: false,
    status: 'collected',
  },
  {
    id: 'cb_04',
    receiptNo: 'REC-2026-0904',
    at: '2026-09-06 15:10',
    collector: 'Imtiaz Tech',
    collectorPhone: '+880 1912-334411',
    customerName: 'Sajjad Ali',
    customerId: 'cust_005',
    customerArea: 'Mirpur-2',
    amountBdt: 2000,
    method: 'cash',
    note: 'ONU replacement deposit collected at premises during optical repair run.',
    verifiedByAccounts: true,
    depositSlipNo: 'SLIP-DBBL-4421',
    status: 'verified',
  },
  {
    id: 'cb_05',
    receiptNo: 'REC-2026-0905',
    at: '2026-09-05 16:30',
    collector: 'Kamal Lineman',
    collectorPhone: '+880 1622-990011',
    customerName: 'Mirpur Biz Link Headquarters',
    customerId: 'cust_010',
    customerArea: 'Mirpur Section 10',
    amountBdt: 18500,
    method: 'bank',
    note: 'Cheque collected from corporate office, deposited to City Bank A/C.',
    verifiedByAccounts: true,
    depositSlipNo: 'CHQ-CBL-88120',
    status: 'verified',
  },
];

export const oltOnus: OltOnu[] = [
  { id: 'onu_01', oltId: 'olt_01', sn: 'HWTC12345678', rxDbm: -22.4, txDbm: 2.1, status: 'online', customerName: 'Rahim Uddin' },
  { id: 'onu_02', oltId: 'olt_01', sn: 'HWTC87654321', rxDbm: -28.1, txDbm: 1.8, status: 'online', customerName: 'Fatima Begum' },
  { id: 'onu_03', oltId: 'olt_01', sn: 'ZTEA99887766', rxDbm: -34.0, txDbm: 0.9, status: 'los', customerName: 'Sajjad Ali' },
  { id: 'onu_04', oltId: 'olt_02', sn: 'HWTC11223344', rxDbm: -19.5, txDbm: 2.4, status: 'online', customerName: 'Mirpur Biz Link' },
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
  { id: 'usg_01', customerName: 'Mirpur Biz Link', packageName: 'Biz 200Mbps', downloadGb: 812, uploadGb: 220, peakMbps: 188, period: '2026-08' },
  { id: 'usg_02', customerName: 'Rahim Uddin', packageName: 'Home 40Mbps', downloadGb: 142, uploadGb: 18, peakMbps: 38, period: '2026-08' },
  { id: 'usg_03', customerName: 'Fatima Begum', packageName: 'Home 20Mbps', downloadGb: 64, uploadGb: 9, peakMbps: 19, period: '2026-08' },
];

export const outages: OutageRow[] = [
  { id: 'out_01', title: 'Fiber cut — Banani link', severity: 'critical', area: 'Banani', startedAt: '2026-09-07T15:40:00', status: 'identified', affected: 420 },
  { id: 'out_02', title: 'OLT reboot Mirpur', severity: 'major', area: 'Mirpur', startedAt: '2026-09-07T10:00:00', status: 'resolved', affected: 95 },
  { id: 'out_03', title: 'DNS latency spike', severity: 'minor', area: 'All', startedAt: '2026-09-06T22:00:00', status: 'monitoring', affected: 0 },
];

export const dunningSteps: DunningStep[] = [
  {
    id: 'dun_01',
    dayOffset: -3,
    action: 'Friendly Expiration Warning',
    channel: 'SMS',
    templateName: 'due_reminder_3d_advance',
    messagePreview: 'Dear {name}, your broadband subscription for {package} will expire in 3 days. Pay {amount} BDT via bKash/Nagad.',
    targetAudience: 'Prepaid & Hybrid Customers',
    enabled: true,
  },
  {
    id: 'dun_02',
    dayOffset: 0,
    action: 'Due Day Final Notice',
    channel: 'WhatsApp',
    templateName: 'due_day_urgent_whatsapp',
    messagePreview: 'Urgent: Today is the renewal date for your ISP Pay BD connection. Click here to pay instantly: pay.isppaybd.com/{id}',
    targetAudience: 'All Active Subscribers',
    enabled: true,
  },
  {
    id: 'dun_03',
    dayOffset: 3,
    action: 'Grace Period Expiration Warning',
    channel: 'Voice',
    templateName: 'grace_warning_ivr',
    messagePreview: 'Automated IVR call: 24 hours remaining in grace period. Line will be suspended tomorrow at 12:00 AM.',
    targetAudience: 'Postpaid & Corporate Accounts',
    enabled: true,
  },
  {
    id: 'dun_04',
    dayOffset: 7,
    action: 'Line Suspension & RADIUS CoA Disconnect',
    channel: 'System',
    templateName: 'auto_suspend_trigger',
    messagePreview: 'Automated MikroTik RADIUS CoA packet sent: Change user profile to SUSPENDED_WALLED_GARDEN.',
    targetAudience: 'Overdue Customers (>7 days)',
    enabled: true,
  },
  {
    id: 'dun_05',
    dayOffset: 15,
    action: 'Legal / Final Recovery SMS',
    channel: 'SMS',
    templateName: 'final_recovery_notice',
    messagePreview: 'Final Notice: Outstanding balance of {amount} BDT pending. Optical drop line will be uninstalled next week.',
    targetAudience: 'Suspended Corporate Accounts',
    enabled: true,
  },
];

export const prorationExamples: ProrationExample[] = [
  {
    id: 'pro_01',
    customerName: 'Rahim Uddin',
    fromPackage: 'Home Basic 20 Mbps',
    fromPriceBdt: 800,
    toPackage: 'Home Ultra 40 Mbps',
    toPriceBdt: 1200,
    daysUsed: 10,
    cycleDays: 30,
    creditBdt: 533,
    chargeBdt: 800,
    netBdt: 267,
    actionType: 'upgrade',
  },
  {
    id: 'pro_02',
    customerName: 'Mirpur Biz Link Headquarters',
    fromPackage: 'Corporate Standard 100 Mbps',
    fromPriceBdt: 8500,
    toPackage: 'Corporate Dedicated 200 Mbps',
    toPriceBdt: 18500,
    daysUsed: 5,
    cycleDays: 30,
    creditBdt: 7083,
    chargeBdt: 15417,
    netBdt: 8334,
    actionType: 'upgrade',
  },
  {
    id: 'pro_03',
    customerName: 'Fatima Begum',
    fromPackage: 'Home Turbo 50 Mbps',
    fromPriceBdt: 1500,
    toPackage: 'Home Basic 20 Mbps',
    toPriceBdt: 800,
    daysUsed: 15,
    cycleDays: 30,
    creditBdt: 750,
    chargeBdt: 400,
    netBdt: -350,
    actionType: 'downgrade',
  },
  {
    id: 'pro_04',
    customerName: 'Banani Cyber Dynamics Ltd',
    fromPackage: 'Dedicated 50 Mbps',
    fromPriceBdt: 6000,
    toPackage: 'Dedicated 100 Mbps',
    toPriceBdt: 12500,
    daysUsed: 12,
    cycleDays: 30,
    creditBdt: 3600,
    chargeBdt: 7500,
    netBdt: 3900,
    actionType: 'upgrade',
  },
];

export const creditNotes: CreditNote[] = [
  {
    id: 'cr_01',
    number: 'CN-2026-014',
    customerName: 'Rahim Uddin',
    customerId: 'cust_001',
    customerPhone: '+880 1711-234567',
    area: 'Gulshan-2, Dhaka',
    amountBdt: 200,
    reason: 'Core optical fiber cut SLA outage goodwill compensation',
    invoiceNo: 'INV-2026-0901',
    approvedBy: 'Admin (System)',
    at: '2026-09-05',
    status: 'applied',
  },
  {
    id: 'cr_02',
    number: 'CN-2026-015',
    customerName: 'Mirpur Biz Link Headquarters',
    customerId: 'cust_010',
    customerPhone: '+880 1711-889900',
    area: 'Mirpur Section 10, Dhaka',
    amountBdt: 1500,
    reason: 'Billing cycle plan change proration adjustment credit',
    invoiceNo: 'INV-2026-0903',
    approvedBy: 'Salma Accounts Head',
    at: '2026-09-06',
    status: 'open',
  },
  {
    id: 'cr_03',
    number: 'CN-2026-016',
    customerName: 'Banani Cyber Dynamics Ltd',
    customerId: 'cust_012',
    customerPhone: '+880 1755-112233',
    area: 'Banani Block C, Dhaka',
    amountBdt: 3000,
    reason: 'Upstream NTTN link degradation credit rebate',
    invoiceNo: 'INV-2026-0830',
    approvedBy: 'Nawaz Corporate Lead',
    at: '2026-09-02',
    status: 'applied',
  },
  {
    id: 'cr_04',
    number: 'CN-2026-017',
    customerName: 'Fatima Begum',
    customerId: 'cust_002',
    customerPhone: '+880 1712-334455',
    area: 'Gulshan-1, Dhaka',
    amountBdt: 150,
    reason: 'Duplicate payment via bKash refund adjustment',
    invoiceNo: 'INV-2026-0902',
    approvedBy: 'Salma Accounts Head',
    at: '2026-09-07',
    status: 'open',
  },
];

export const deposits: DepositRow[] = [
  {
    id: 'dep_01',
    customerName: 'Rahim Uddin',
    customerId: 'cust_001',
    type: 'deposit',
    itemDescription: 'GPON ONU Dual-Band Security Deposit (Refundable)',
    amountBdt: 2000,
    at: '2026-04-01',
    refundable: true,
    status: 'active',
    paymentMethod: 'cash',
    voucherNo: 'VCH-DEP-2026-010',
  },
  {
    id: 'dep_02',
    customerName: 'Mirpur Biz Link Headquarters',
    customerId: 'cust_010',
    type: 'otc',
    itemDescription: 'Primary Optical Fiber Drop Cable & Splicing OTC (Non-Refundable)',
    amountBdt: 5000,
    at: '2026-03-15',
    refundable: false,
    status: 'active',
    paymentMethod: 'bank',
    voucherNo: 'VCH-OTC-2026-088',
  },
  {
    id: 'dep_03',
    customerName: 'Karim Hossain',
    customerId: 'cust_003',
    type: 'deposit',
    itemDescription: 'Optical Receiver ONU HWTC Security Deposit',
    amountBdt: 1500,
    at: '2026-05-10',
    refundable: true,
    status: 'active',
    paymentMethod: 'bkash',
    voucherNo: 'VCH-DEP-2026-044',
  },
  {
    id: 'dep_04',
    customerName: 'Banani Cyber Dynamics Ltd',
    customerId: 'cust_012',
    type: 'router_deposit',
    itemDescription: 'MikroTik CCR2004 Core Router Equipment Bond',
    amountBdt: 15000,
    at: '2026-02-20',
    refundable: true,
    status: 'active',
    paymentMethod: 'bank',
    voucherNo: 'VCH-EQP-2026-002',
  },
  {
    id: 'dep_05',
    customerName: 'Sajjad Ali',
    customerId: 'cust_005',
    type: 'installation',
    itemDescription: 'Overhead Fiber Installation & Wall Mounting Kit',
    amountBdt: 1200,
    at: '2026-06-12',
    refundable: false,
    status: 'active',
    paymentMethod: 'nagad',
    voucherNo: 'VCH-OTC-2026-112',
  },
  {
    id: 'dep_06',
    customerName: 'Imran Kabir',
    customerId: 'cust_020',
    type: 'deposit',
    itemDescription: 'Refunded GPON Terminal (Disconnection Settled)',
    amountBdt: 2000,
    at: '2026-08-28',
    refundable: true,
    status: 'refunded',
    paymentMethod: 'bkash',
    voucherNo: 'VCH-REF-2026-005',
  },
];

export const popCommissions: PopCommission[] = [
  { id: 'pc_01', popName: 'FastNet POP Uttara Hub', period: '2026-08', collectedBdt: 420000, ratePct: 8.5, commissionBdt: 35700, status: 'paid' },
  { id: 'pc_02', popName: 'SpeedLink POP Mirpur-10', period: '2026-08', collectedBdt: 315000, ratePct: 8.0, commissionBdt: 25200, status: 'paid' },
  { id: 'pc_03', popName: 'PortCity POP Agrabad', period: '2026-08', collectedBdt: 510000, ratePct: 9.0, commissionBdt: 45900, status: 'pending' },
  { id: 'pc_04', popName: 'MetroWave POP Dhanmondi', period: '2026-08', collectedBdt: 210000, ratePct: 7.5, commissionBdt: 15750, status: 'paid' },
  { id: 'pc_05', popName: 'Surma POP Zindabazar', period: '2026-08', collectedBdt: 165000, ratePct: 7.0, commissionBdt: 11550, status: 'pending' },
  { id: 'pc_06', popName: 'Bhairab POP Shibbari', period: '2026-08', collectedBdt: 105000, ratePct: 7.0, commissionBdt: 7350, status: 'paid' },
];

export const packageProfitRows: PackageProfitRow[] = [
  { id: 'pp_01', popName: 'FastNet POP Uttara Hub', packageName: 'FTTH Ultra 50 Mbps', customers: 240, revenueBdt: 288000, costBdt: 115000, profitBdt: 173000 },
  { id: 'pp_02', popName: 'FastNet POP Uttara Hub', packageName: 'Home Starter 20 Mbps', customers: 180, revenueBdt: 144000, costBdt: 68000, profitBdt: 76000 },
  { id: 'pp_03', popName: 'SpeedLink POP Mirpur-10', packageName: 'Gamer Pro 60 Mbps', customers: 150, revenueBdt: 225000, costBdt: 95000, profitBdt: 130000 },
  { id: 'pp_04', popName: 'SpeedLink POP Mirpur-10', packageName: 'Home Basic 25 Mbps', customers: 210, revenueBdt: 168000, costBdt: 75000, profitBdt: 93000 },
  { id: 'pp_05', popName: 'PortCity POP Agrabad', packageName: 'SME Commercial 40 Mbps', customers: 120, revenueBdt: 240000, costBdt: 85000, profitBdt: 155000 },
  { id: 'pp_06', popName: 'PortCity POP Agrabad', packageName: 'Retail Fiber 30 Mbps', customers: 340, revenueBdt: 306000, costBdt: 130000, profitBdt: 176000 },
  { id: 'pp_07', popName: 'MetroWave POP Dhanmondi', packageName: 'Dedicated Leased 100 Mbps', customers: 18, revenueBdt: 180000, costBdt: 60000, profitBdt: 120000 },
  { id: 'pp_08', popName: 'Surma POP Zindabazar', packageName: 'Home Connect 30 Mbps', customers: 190, revenueBdt: 152000, costBdt: 72000, profitBdt: 80000 },
];

export const workOrders: WorkOrder[] = [
  {
    id: 'job_01',
    orderNo: 'WO-2026-0891',
    title: 'New Optical Fiber FTTH Installation',
    customerName: 'Rina Akter',
    customerId: 'lead_01',
    phone: '+880 1711-238899',
    area: 'Banani Block C, Dhaka',
    address: 'House 14/B, Road 11, Apt 4A',
    type: 'install',
    priority: 'high',
    assignee: 'Rafiq Field (Lead Technician)',
    assigneePhone: '+880 1700-112233',
    team: 'North Field Team-2',
    status: 'open',
    dueAt: '2026-09-08 14:00',
    createdAt: '2026-09-07 09:30',
    estimatedMinutes: 90,
    materialsUsed: 'ONU HWTC, 85m Drop Cable, SC/APC Fast Connector',
    notes: 'Subscriber requested router wall mounting in living room.',
  },
  {
    id: 'job_02',
    orderNo: 'WO-2026-0892',
    title: 'LOS Optical Red Light & Fiber Cut Repair',
    customerName: 'Sajjad Ali',
    customerId: 'cust_005',
    phone: '+880 1819-776655',
    area: 'Mirpur-2, Dhaka',
    address: 'Plot 42, Avenue 3, Section 2',
    type: 'repair',
    priority: 'critical',
    assignee: 'Imtiaz Tech',
    assigneePhone: '+880 1800-445566',
    team: 'Mirpur Emergency Crew',
    status: 'in_progress',
    dueAt: '2026-09-07 18:30',
    createdAt: '2026-09-07 15:10',
    estimatedMinutes: 45,
    materialsUsed: 'Fiber Fusion Splicing Sleeve (1x)',
    notes: 'Optical power showing -34 dBm at PON terminal. Splicing drop joint.',
  },
  {
    id: 'job_03',
    orderNo: 'WO-2026-0893',
    title: 'Physical Address Shift & Core Relocation',
    customerName: 'Mirpur Biz Link Headquarters',
    customerId: 'cust_010',
    phone: '+880 1822-998877',
    area: 'Mirpur-10 → Mirpur DOHS',
    address: 'Relocating to DOHS Gate 2, Building 8',
    type: 'shift',
    priority: 'high',
    assignee: 'Rafiq Field (Lead Technician)',
    assigneePhone: '+880 1700-112233',
    team: 'North Field Team-2',
    status: 'open',
    dueAt: '2026-09-09 11:00',
    createdAt: '2026-09-06 14:00',
    estimatedMinutes: 120,
    materialsUsed: 'New 150m Core Drop Cable, Patch Cord',
    notes: 'Corporate fiber line shift. Schedule with building security.',
  },
  {
    id: 'job_04',
    orderNo: 'WO-2026-0894',
    title: 'Field Door Cash Collection Route',
    customerName: 'Multiple Residential Subscribers',
    customerId: 'bulk_04',
    phone: '+880 1711-000111',
    area: 'Banani Area Sector 4',
    address: 'Road 5, 7, 9 Combined Route',
    type: 'collect',
    priority: 'medium',
    assignee: 'Salma Desk',
    assigneePhone: '+880 1600-778899',
    team: 'Accounts Field Recovery',
    status: 'done',
    dueAt: '2026-09-06 17:00',
    createdAt: '2026-09-06 10:00',
    estimatedMinutes: 180,
    notes: 'Collected ৳18,400 from 12 door steps. Cash deposited to counter.',
  },
  {
    id: 'job_05',
    orderNo: 'WO-2026-0895',
    title: 'Corporate Bandwidth & GPON Terminal Upgrade',
    customerName: 'Banani Cyber Dynamics Ltd',
    customerId: 'cust_012',
    phone: '+880 1755-112233',
    area: 'Banani Block C, Dhaka',
    address: 'Road 11, Tower 8, Level 6',
    type: 'upgrade',
    priority: 'medium',
    assignee: 'Imtiaz Tech',
    assigneePhone: '+880 1800-445566',
    team: 'Corporate NOC Field',
    status: 'done',
    dueAt: '2026-09-05 16:00',
    createdAt: '2026-09-05 11:00',
    estimatedMinutes: 60,
    materialsUsed: 'MikroTik Gigabit Router, 10G Patch Cord',
    notes: 'Replaced Fast Ethernet ONU with Dual-Band Gigabit ONT.',
  },
  {
    id: 'job_06',
    orderNo: 'WO-2026-0896',
    title: 'Overhead Distribution Box Maintenance',
    customerName: 'Gulshan Distribution Splitter Box #4',
    customerId: 'pop_box_04',
    phone: '+880 1700-112233',
    area: 'Gulshan-2, Dhaka',
    address: 'Pole 18, Road 45 Corner',
    type: 'maintenance',
    priority: 'low',
    assignee: 'Kamal Lineman',
    assigneePhone: '+880 1900-334455',
    team: 'Lineman Division',
    status: 'open',
    dueAt: '2026-09-10 12:00',
    createdAt: '2026-09-07 08:00',
    estimatedMinutes: 90,
    notes: 'Routine cable tidying and enclosure weatherproofing.',
  },
];

export const leads: LeadRow[] = [
  {
    id: 'lead_01',
    leadNo: 'LD-2026-0412',
    name: 'Rina Akter',
    organization: 'Self-Employed Freelancer',
    phone: '+880 1711-238899',
    email: 'rina.design@gmail.com',
    area: 'Banani, Dhaka',
    address: 'House 14/B, Road 11',
    packageInterest: 'Home Ultra 40 Mbps (৳ 1,200/mo)',
    estimatedMonthlyBdt: 1200,
    otcQuoteBdt: 1500,
    stage: 'won',
    owner: 'Tariq Sales (Direct)',
    source: 'website',
    surveyFeasible: true,
    notes: 'Fiber port available on Splitter-3. Work order WO-2026-0891 assigned.',
    createdAt: '2026-09-06',
    lastContactedAt: '2026-09-07 11:30',
  },
  {
    id: 'lead_02',
    leadNo: 'LD-2026-0413',
    name: 'TechPark Enterprise Solutions Ltd',
    organization: 'TechPark Software HQ',
    phone: '+880 1822-445566',
    email: 'procurement@techparkbd.com',
    area: 'Motijheel C/A, Dhaka',
    address: 'City Center Tower, Level 14',
    packageInterest: 'Corporate Dedicated 200 Mbps (৳ 18,500/mo)',
    estimatedMonthlyBdt: 18500,
    otcQuoteBdt: 10000,
    stage: 'negotiation',
    owner: 'Nawaz Corporate Lead',
    source: 'inbound_call',
    surveyFeasible: true,
    notes: 'Requires dual-path backup link and 99.95% uptime SLA agreement.',
    createdAt: '2026-09-04',
    lastContactedAt: '2026-09-07 14:20',
  },
  {
    id: 'lead_03',
    leadNo: 'LD-2026-0414',
    name: 'Hasan Mia',
    organization: 'Hasan Grocery & Departmental',
    phone: '+880 1933-778899',
    email: 'hasan.mia@gmail.com',
    area: 'Keraniganj, Dhaka',
    address: 'Babu Bazar Bridge East Side',
    packageInterest: 'Home Basic 20 Mbps (৳ 800/mo)',
    estimatedMonthlyBdt: 800,
    otcQuoteBdt: 2000,
    stage: 'survey',
    owner: 'Tariq Sales (Direct)',
    source: 'field_agent',
    surveyFeasible: true,
    notes: 'Fiber distance ~180 meters from nearest DP box. Line survey scheduled.',
    createdAt: '2026-09-05',
    lastContactedAt: '2026-09-06 17:00',
  },
  {
    id: 'lead_04',
    leadNo: 'LD-2026-0415',
    name: 'Dr. Mahbubur Rahman',
    organization: 'Al-Shifa Diagnostic Center',
    phone: '+880 1712-990011',
    email: 'info@alshifadiag.com',
    area: 'Dhanmondi, Dhaka',
    address: 'Road 7, House 22',
    packageInterest: 'Biz High-Speed 100 Mbps (৳ 8,500/mo)',
    estimatedMonthlyBdt: 8500,
    otcQuoteBdt: 5000,
    stage: 'contacted',
    owner: 'Nawaz Corporate Lead',
    source: 'referral',
    surveyFeasible: true,
    notes: 'Looking to connect PACS radiology server with online cloud sync.',
    createdAt: '2026-09-07',
    lastContactedAt: '2026-09-07 10:15',
  },
  {
    id: 'lead_05',
    leadNo: 'LD-2026-0416',
    name: 'Tanvir Hossain',
    organization: 'Residential User',
    phone: '+880 1622-334455',
    email: 'tanvir.gamer@outlook.com',
    area: 'Uttara Sector 13, Dhaka',
    address: 'Road 18, House 5',
    packageInterest: 'Home Gamer 35 Mbps (৳ 1,000/mo)',
    estimatedMonthlyBdt: 1000,
    otcQuoteBdt: 1200,
    stage: 'new',
    owner: 'Tariq Sales (Direct)',
    source: 'social',
    surveyFeasible: false,
    notes: 'Submitted inquiry via Facebook ad campaign. Needs low latency to Singapore servers.',
    createdAt: '2026-09-07',
    lastContactedAt: '2026-09-07 09:00',
  },
  {
    id: 'lead_06',
    leadNo: 'LD-2026-0417',
    name: 'Shahidul Alam',
    organization: 'Alam Garments Buying House',
    phone: '+880 1819-001122',
    email: 's.alam@alamgarments.com',
    area: 'Uttara Sector 3, Dhaka',
    address: 'Rabindra Sarani, Plot 10',
    packageInterest: 'Corporate Dedicated 50 Mbps (৳ 6,000/mo)',
    estimatedMonthlyBdt: 6000,
    otcQuoteBdt: 4000,
    stage: 'lost',
    owner: 'Nawaz Corporate Lead',
    source: 'website',
    surveyFeasible: true,
    notes: 'Lost to competitor due to existing 1-year lock-in contract with previous ISP.',
    createdAt: '2026-08-28',
    lastContactedAt: '2026-09-01 12:00',
  },
];

export const customerGroups: CustomerGroup[] = [
  { id: 'grp_01', name: 'Mirpur Biz + Branches', parentName: 'Mirpur Biz Link', members: 6, billingMode: 'consolidated' },
  { id: 'grp_02', name: 'Rahim Family', parentName: 'Rahim Uddin', members: 3, billingMode: 'individual' },
];

export const kycDocs: KycDoc[] = [
  { id: 'kyc_01', customerId: 'cust_001', type: 'nid', fileName: 'rahim-nid.pdf', uploadedAt: '2026-04-10', status: 'verified' },
  { id: 'kyc_02', customerId: 'cust_001', type: 'photo', fileName: 'rahim-photo.jpg', uploadedAt: '2026-04-10', status: 'verified' },
  { id: 'kyc_03', customerId: 'cust_010', type: 'trade', fileName: 'mirpur-trade.pdf', uploadedAt: '2026-03-01', status: 'pending' },
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
  { id: 'add_01', name: 'Bongo OTT Premium Pass', category: 'ott', priceBdt: 199, active: true },
  { id: 'add_02', name: 'Chorki Cinema Pass (HD)', category: 'ott', priceBdt: 249, active: true },
  { id: 'add_03', name: 'Toffee Pro Live Sports', category: 'ott', priceBdt: 120, active: true },
  { id: 'add_04', name: 'Hoichoi Unlimited (Annual Sub)', category: 'ott', priceBdt: 899, active: true },
  { id: 'add_05', name: 'IPTV HD Full Bouquet (180+ Ch)', category: 'iptv', priceBdt: 250, active: true },
  { id: 'add_06', name: 'IPTV Smart STB Device Lease', category: 'iptv', priceBdt: 150, active: true },
  { id: 'add_07', name: 'Public IPv4 Static /32 Routing', category: 'static_ip', priceBdt: 500, active: true },
  { id: 'add_08', name: 'Public IPv4 Dedicated Block /29 (5 IPs)', category: 'static_ip', priceBdt: 2000, active: true },
  { id: 'add_09', name: 'Gaming Ping Booster & Low Latency Route', category: 'other', priceBdt: 300, active: true },
  { id: 'add_10', name: 'Dual-Band Wi-Fi 6 Mesh Pod Router', category: 'other', priceBdt: 350, active: true },
  { id: 'add_11', name: 'Corporate Dedicated IP Block /28 (13 IPs)', category: 'static_ip', priceBdt: 4500, active: false },
  { id: 'add_12', name: 'SonyLIV Cricket & UEFA Pass', category: 'ott', priceBdt: 299, active: true },
];

export const serviceTypes: ServiceType[] = [
  { id: 'svc_01', name: 'Retail Home Fiber FTTH', code: 'HOME_FTTH', customers: 4200 },
  { id: 'svc_02', name: 'SME / Commercial Broadband', code: 'SME_CORP', customers: 640 },
  { id: 'svc_03', name: 'Corporate Dedicated Leased Line (DIA)', code: 'CORP_DIA', customers: 180 },
  { id: 'svc_04', name: 'Public Wi-Fi Hotspot Zones', code: 'HOTSPOT', customers: 85 },
  { id: 'svc_05', name: 'Sub-ISP / Reseller L2 VLAN Transit', code: 'RESELLER_L2', customers: 34 },
  { id: 'svc_06', name: 'Campus & High-Density Student Network', code: 'CAMPUS_NET', customers: 210 },
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
  primaryColor: '#e85a1a',
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
  { id: 'ct_01', customerName: 'Mirpur Biz Link', title: 'Annual SLA 2026', status: 'signed', signedAt: '2026-01-15' },
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
  {
    id: 'nf_01',
    ip: '10.20.1.12',
    username: 'corp.mirpur',
    customerName: 'Mirpur Biz Link Headquarters',
    mac: 'E4:8D:8C:3B:11:42',
    router: 'MK-Mirpur-POP',
    interfaceName: 'sfp-sfpplus1 (10G Fiber)',
    rxGb: 120.4,
    txGb: 40.2,
    currentRxMbps: 94.6,
    currentTxMbps: 38.2,
    packetsPerSec: 14200,
    activeFlows: 642,
    tcpFlows: 580,
    udpFlows: 62,
    apps: 'HTTPS, Zoom, GitHub, Teams',
    topDestination: '142.250.190.46 (Google/Zoom CDN)',
    status: 'bursting',
    lastSeen: 'Just now',
    fupLimitGb: 500,
  },
  {
    id: 'nf_02',
    ip: '10.20.1.44',
    username: 'user.rahim',
    customerName: 'Rahim Uddin',
    mac: '3C:52:82:7A:99:10',
    router: 'MK-Gulshan-Core',
    interfaceName: 'vlan100-fiber-01',
    rxGb: 88.5,
    txGb: 14.8,
    currentRxMbps: 46.2,
    currentTxMbps: 4.8,
    packetsPerSec: 6800,
    activeFlows: 310,
    tcpFlows: 240,
    udpFlows: 70,
    apps: 'YouTube 4K, Steam Gaming, Discord',
    topDestination: '172.217.16.206 (YouTube Cache BDIX)',
    status: 'active',
    lastSeen: '12s ago',
    fupLimitGb: 200,
  },
  {
    id: 'nf_03',
    ip: '10.21.3.88',
    username: 'user.fatima',
    customerName: 'Fatima Begum',
    mac: '70:85:C2:55:01:8A',
    router: 'MK-Dhanmondi-Edge',
    interfaceName: 'ether2-agg-dhn',
    rxGb: 64.2,
    txGb: 9.1,
    currentRxMbps: 32.4,
    currentTxMbps: 2.9,
    packetsPerSec: 4200,
    activeFlows: 184,
    tcpFlows: 152,
    udpFlows: 32,
    apps: 'Netflix 4K, Facebook Video, Spotify',
    topDestination: '198.38.118.140 (Netflix CDN Edge)',
    status: 'active',
    lastSeen: '45s ago',
    fupLimitGb: 150,
  },
  {
    id: 'nf_04',
    ip: '10.20.1.91',
    username: 'corp.banani.tech',
    customerName: 'Banani Cyber Dynamics Ltd',
    mac: '00:1A:2B:6C:9D:44',
    router: 'MK-Gulshan-Core',
    interfaceName: 'sfp-sfpplus2 (Direct Trunk)',
    rxGb: 245.8,
    txGb: 182.4,
    currentRxMbps: 185.0,
    currentTxMbps: 142.5,
    packetsPerSec: 28900,
    activeFlows: 1250,
    tcpFlows: 1100,
    udpFlows: 150,
    apps: 'AWS S3, Docker Hub, BitTorrent Sync, HTTPS',
    topDestination: '52.95.120.1 (AWS CloudFront AP-South)',
    status: 'bursting',
    lastSeen: 'Just now',
    fupLimitGb: 1000,
  },
  {
    id: 'nf_05',
    ip: '10.20.2.105',
    username: 'user.sajjad',
    customerName: 'Sajjad Ali',
    mac: 'BC:A9:93:14:F2:01',
    router: 'MK-Mirpur-POP',
    interfaceName: 'vlan102-pon3',
    rxGb: 52.0,
    txGb: 6.7,
    currentRxMbps: 22.8,
    currentTxMbps: 1.8,
    packetsPerSec: 3100,
    activeFlows: 120,
    tcpFlows: 98,
    udpFlows: 22,
    apps: 'Valorant, Twitch Stream, Discord',
    topDestination: '162.249.72.1 (Riot Games SG Server)',
    status: 'active',
    lastSeen: '1m ago',
    fupLimitGb: 150,
  },
  {
    id: 'nf_06',
    ip: '10.22.0.45',
    username: 'user.nusrat',
    customerName: 'Nusrat Jahan',
    mac: '84:D8:1B:32:00:CD',
    router: 'MK-Dhanmondi-Edge',
    interfaceName: 'vlan105-pon1',
    rxGb: 38.4,
    txGb: 4.2,
    currentRxMbps: 18.2,
    currentTxMbps: 1.1,
    packetsPerSec: 2200,
    activeFlows: 85,
    tcpFlows: 72,
    udpFlows: 13,
    apps: 'TikTok, Instagram Reels, HTTPS',
    topDestination: '104.16.120.5 (Cloudflare Cache)',
    status: 'idle',
    lastSeen: '3m ago',
    fupLimitGb: 100,
  },
  {
    id: 'nf_07',
    ip: '10.20.1.18',
    username: 'corp.fintech.bd',
    customerName: 'FinTech Secure Gateway Hub',
    mac: '50:65:F3:11:AB:89',
    router: 'MK-Gulshan-Core',
    interfaceName: 'sfp-sfpplus1 (Primary Link)',
    rxGb: 165.2,
    txGb: 130.0,
    currentRxMbps: 120.4,
    currentTxMbps: 98.0,
    packetsPerSec: 19400,
    activeFlows: 890,
    tcpFlows: 860,
    udpFlows: 30,
    apps: 'IPSec VPN, PostgreSQL Remote, HTTPS',
    topDestination: '103.112.10.1 (National Switch)',
    status: 'bursting',
    lastSeen: 'Just now',
    fupLimitGb: 800,
  },
  {
    id: 'nf_08',
    ip: '10.20.3.50',
    username: 'user.karim',
    customerName: 'Karim Hossain',
    mac: '44:6D:57:99:41:22',
    router: 'MK-Mirpur-POP',
    interfaceName: 'vlan101-pon4',
    rxGb: 41.5,
    txGb: 5.3,
    currentRxMbps: 15.6,
    currentTxMbps: 1.4,
    packetsPerSec: 1950,
    activeFlows: 74,
    tcpFlows: 60,
    udpFlows: 14,
    apps: 'YouTube, Web Browsing, WhatsApp Video',
    topDestination: '142.250.191.14 (Google Global Cache)',
    status: 'idle',
    lastSeen: '2m ago',
    fupLimitGb: 120,
  },
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
  { id: 'mob_01', name: 'LTE 30GB High-Speed Backup', dataGb: 30, validityDays: 30, priceBdt: 499, active: true },
  { id: 'mob_02', name: 'LTE 60GB Hybrid Failover Plan', dataGb: 60, validityDays: 30, priceBdt: 799, active: true },
  { id: 'mob_03', name: 'LTE Unlimited Night Gamer Pack (100GB)', dataGb: 100, validityDays: 30, priceBdt: 999, active: true },
  { id: 'mob_04', name: 'Field Executive 15GB Mobile SIM', dataGb: 15, validityDays: 30, priceBdt: 299, active: true },
  { id: 'mob_05', name: 'Corporate Multi-SIM Pool 200GB', dataGb: 200, validityDays: 60, priceBdt: 2499, active: true },
  { id: 'mob_06', name: 'POP Emergency Uplink 500GB Redundancy', dataGb: 500, validityDays: 90, priceBdt: 5999, active: true },
  { id: 'mob_07', name: 'Legacy LTE 10GB Starter', dataGb: 10, validityDays: 15, priceBdt: 199, active: false },
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

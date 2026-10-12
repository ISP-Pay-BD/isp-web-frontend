/**
 * Customer self-care portal: backend (zapi, snake_case) → UI (camelCase) mappers.
 * Every shape here mirrors the PHP service that produces it — see the comment
 * on each mapper for the endpoint. Fields the backend does not send are not
 * invented: they map to '' / null and the UI renders "—" or hides the element.
 */
import { num, str } from '../case';
import { API_BASE_URL } from '../client';
import { digitsOnly, normalizeBdPhone } from '@/lib/format';

type Row = Record<string, unknown>;

const rec = (value: unknown): Row =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Row) : {};

const rows = (value: unknown): Row[] =>
  Array.isArray(value) ? (value.filter((v) => v && typeof v === 'object') as Row[]) : [];

/** Backend placeholders ('--', zero dates) read as empty. */
function clean(value: unknown): string {
  const s = str(value).trim();
  return s === '--' || s.startsWith('0000-00-00') ? '' : s;
}

/** MySQL `Y-m-d H:i:s` / tickets `Y-m-d, H:i:s` → a string `Date` parses. */
function dateInput(value: unknown): string {
  return clean(value).replace(/^(\d{4}-\d{2}-\d{2}),?\s+/, '$1T');
}

const truthy = (value: unknown) => ['1', 'yes', 'true', 'verified'].includes(str(value).toLowerCase());

/** `packages.bandwidth` is free text ("20", "20Mbps", "20 MB"); bare numbers are Mbps. */
export function bandwidthLabel(value: unknown): string {
  const s = clean(value);
  if (!s) return '';
  return /^\d+(\.\d+)?$/.test(s) ? `${s} Mbps` : s;
}

/** wa.me link for a BD number (01XXXXXXXXX → 8801XXXXXXXXX). */
export function whatsappHref(number: string): string {
  const local = normalizeBdPhone(number);
  const digits = /^01\d{9}$/.test(local) ? `88${local}` : digitsOnly(number);
  return digits ? `https://wa.me/${digits}` : '';
}

/**
 * Renew / activate return the backend's public payment page as a route path
 * (`/payment/make-payment/{id}`) — resolve it against the backend origin.
 */
export function resolveBackendUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
}

/* ------------------------------------------------------------------ */
/* Packages                                                            */
/* ------------------------------------------------------------------ */

export interface CustomerPackage {
  id: string;
  name: string;
  /** Display label, e.g. "20 Mbps" ('' when the package has none). */
  bandwidth: string;
  priceBdt: number;
}

/** A `packages` row (or a reseller `package_details` entry). */
export function mapCustomerPackage(raw: unknown): CustomerPackage {
  const r = rec(raw);
  return {
    id: str(r.id),
    name: clean(r.package_name ?? r.name),
    bandwidth: bandwidthLabel(r.bandwidth),
    priceBdt: num(r.price),
  };
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export type CustomerPaymentStatus = 'paid' | 'pending' | 'failed' | 'unknown';

export interface CustomerPayment {
  id: string;
  invoice: string;
  amountBdt: number;
  /** `payments.status` enum: successful → paid. */
  status: CustomerPaymentStatus;
  /** `paid_via` ('' when the backend has '--'). */
  method: string;
  /** `method_trx`. */
  trxId: string;
  month: string;
  createdAt: string;
  paidAt: string;
  paidTo: string;
  comment: string;
}

export function paymentStatus(value: unknown): CustomerPaymentStatus {
  const s = str(value).toLowerCase();
  if (s === 'successful') return 'paid';
  if (s === 'pending') return 'pending';
  if (s === 'failed') return 'failed';
  return 'unknown';
}

/** A `payments` row (payment-fetch / dashboard recent_payments / invoice-print). */
export function mapCustomerPayment(raw: unknown): CustomerPayment {
  const r = rec(raw);
  const createdAt = dateInput(r.created_at);
  return {
    id: str(r.id),
    invoice: clean(r.invoice),
    amountBdt: num(r.amount),
    status: paymentStatus(r.status),
    method: clean(r.paid_via),
    trxId: clean(r.method_trx),
    month: clean(r.month),
    createdAt,
    paidAt: dateInput(r.paid_at) || createdAt,
    paidTo: clean(r.paid_to_name),
    comment: clean(r.comment),
  };
}

/* ------------------------------------------------------------------ */
/* Support tickets                                                     */
/* ------------------------------------------------------------------ */

export type CustomerTicketStatus = 'open' | 'pending' | 'closed';

export interface CustomerTicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  /** Backend writes `d-m-y, h:i a` — shown as-is. */
  sentAt: string;
  fromMe: boolean;
}

export interface CustomerTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: CustomerTicketStatus;
  createdAt: string;
  messages: CustomerTicketMessage[];
}

/** `tickets.status` enum('opened','processing','closed'). */
export function ticketStatus(value: unknown): CustomerTicketStatus {
  const s = str(value).toLowerCase();
  if (s === 'closed' || s === 'complete' || s === 'completed' || s === 'solved') return 'closed';
  if (s === 'processing' || s === 'pending') return 'pending';
  return 'open';
}

function ticketMessages(raw: unknown): Row[] {
  if (Array.isArray(raw)) return rows(raw);
  if (typeof raw === 'string' && raw.trim()) {
    try {
      return rows(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * A `tickets` row. The list returns `details` as a JSON string; the detail
 * endpoint (`GET /v1/tickets/{id}`) adds a decoded `messages` array with
 * `sender_name`. Messages are `{sender, msg, datetime}`.
 */
export function mapCustomerTicket(raw: unknown, myId: string): CustomerTicket {
  const r = rec(raw);
  const source = r.messages !== undefined ? r.messages : r.details;
  return {
    id: str(r.id),
    subject: clean(r.subject),
    category: clean(r.category),
    priority: clean(r.priority),
    status: ticketStatus(r.status),
    createdAt: dateInput(r.datetime ?? r.created_at),
    messages: ticketMessages(source).map((m, i) => {
      const senderId = str(m.sender);
      const fromMe = myId !== '' && senderId === myId;
      return {
        id: `${r.id ?? 't'}-${i}`,
        senderId,
        senderName: clean(m.sender_name) || (fromMe ? 'You' : 'Support team'),
        body: str(m.msg),
        sentAt: clean(m.datetime),
        fromMe,
      };
    }),
  };
}

/* ------------------------------------------------------------------ */
/* Dashboard — GET /v1/customer/dashboard                              */
/* ------------------------------------------------------------------ */

export interface CustomerDashboard {
  userId: string;
  name: string;
  phone: string;
  email: string;
  /** PPPoE login (user_router_data.pppoe_secret). */
  pppoeUsername: string;
  accountStatus: string;
  /** users.subscription_status enum('active','inactive'). */
  subscriptionStatus: string;
  isActive: boolean;
  expiresAt: string;
  balanceBdt: number;
  package: CustomerPackage;
  recentPayments: CustomerPayment[];
  openTickets: CustomerTicket[];
  router: { name: string; status: string } | null;
}

/** `{user_id, role, customer, package, subscription, recent_payments, router, open_tickets}` */
export function mapCustomerDashboard(raw: unknown): CustomerDashboard {
  const r = rec(raw);
  const c = rec(r.customer);
  const s = rec(r.subscription);
  const pkg = mapCustomerPackage(r.package);
  const router = r.router ? rec(r.router) : null;
  const subscriptionStatus = clean(s.status);
  return {
    userId: str(c.id ?? r.user_id),
    name: clean(c.name),
    phone: clean(c.phone),
    email: clean(c.email),
    pppoeUsername: clean(c.username ?? s.pppoe_id),
    accountStatus: clean(c.status),
    subscriptionStatus,
    isActive: subscriptionStatus.toLowerCase() === 'active',
    expiresAt: dateInput(s.expires_at ?? c.expires_at),
    balanceBdt: num(c.balance_cents) / 100,
    package: {
      ...pkg,
      id: str(c.package_id ?? s.package_id) || pkg.id,
      name: pkg.name || clean(c.package_name),
    },
    recentPayments: rows(r.recent_payments).map(mapCustomerPayment),
    openTickets: rows(r.open_tickets).map((t) => mapCustomerTicket(t, '')),
    router: router ? { name: clean(router.name), status: clean(router.status) } : null,
  };
}

/* ------------------------------------------------------------------ */
/* Subscription — GET /v1/customer/subscription/index                  */
/* ------------------------------------------------------------------ */

export interface CustomerAccount {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  nidNumber: string;
  nidVerified: boolean;
  createdAt: string;
  accountStatus: string;
  /** users.conn_status ('conn' / 'disconn'). */
  connStatus: string;
}

export interface CustomerSubscription {
  account: CustomerAccount;
  packageId: string;
  pendingPackageId: string;
  subscriptionStatus: string;
  isActive: boolean;
  lastRenewed: string;
  willExpire: string;
  packages: CustomerPackage[];
  currentPackage: CustomerPackage | null;
  pendingPackage: CustomerPackage | null;
}

/** `{title, details (users row), packages, package_id, pre_package, pending_package_id, trial_ends_at, subscription_status, pagination}` */
export function mapCustomerSubscription(raw: unknown): CustomerSubscription {
  const r = rec(raw);
  const d = rec(r.details);
  const packages = rows(r.packages).map(mapCustomerPackage);
  const packageId = str(r.package_id ?? d.package_id);
  const pendingPackageId = clean(r.pending_package_id ?? d.pending_package_id);
  const subscriptionStatus = clean(r.subscription_status ?? d.subscription_status);
  return {
    account: {
      id: str(d.id),
      name: clean(d.name),
      mobile: clean(d.mobile),
      email: clean(d.email),
      address: clean(d.address),
      nidNumber: clean(d.nid_number),
      nidVerified: truthy(d.nid_verified),
      createdAt: dateInput(d.created_at),
      accountStatus: clean(d.status),
      connStatus: clean(d.conn_status),
    },
    packageId,
    pendingPackageId: pendingPackageId === '0' ? '' : pendingPackageId,
    subscriptionStatus,
    isActive: subscriptionStatus.toLowerCase() === 'active',
    lastRenewed: dateInput(d.last_renewed),
    willExpire: dateInput(d.will_expire),
    packages,
    currentPackage: packages.find((p) => p.id === packageId) ?? null,
    pendingPackage: pendingPackageId ? (packages.find((p) => p.id === pendingPackageId) ?? null) : null,
  };
}

/** Renew (`{msg, payment_url, pay_now_url, payment_id, points_applied, payable_after_points…}`) and activate-package (`{message, data:{payment_url, payment_id, amount, invoice}}`). */
export interface CustomerCheckout {
  message: string;
  paymentId: string;
  /** Absolute URL of the backend's payment page ('' when none was issued). */
  paymentUrl: string;
  amountBdt: number | null;
  pointsApplied: number;
}

export function mapCustomerCheckout(raw: unknown): CustomerCheckout {
  const outer = rec(raw);
  const r = outer.data && typeof outer.data === 'object' ? { ...outer, ...rec(outer.data) } : outer;
  const amount = r.payable_after_points ?? r.amount;
  return {
    message: clean(r.msg ?? r.message),
    paymentId: clean(r.payment_id),
    paymentUrl: resolveBackendUrl(clean(r.payment_url) || clean(r.pay_now_url)),
    amountBdt: amount === undefined || amount === null || amount === '' ? null : num(amount),
    pointsApplied: num(r.points_applied),
  };
}

/* ------------------------------------------------------------------ */
/* Support contact — GET /v1/customer/support/contact                  */
/* ------------------------------------------------------------------ */

export interface SupportContact {
  name: string;
  mobile: string;
  email: string;
  address: string;
  whatsapp: string;
}

export function mapSupportContact(raw: unknown): SupportContact {
  const r = rec(raw);
  return {
    name: clean(r.name),
    mobile: clean(r.mobile),
    email: clean(r.email),
    address: clean(r.address),
    whatsapp: clean(r.whatsapp_number),
  };
}

/* ------------------------------------------------------------------ */
/* Usage — GET /v1/customer/usage                                      */
/* ------------------------------------------------------------------ */

export interface CustomerUsage {
  rxMb: number;
  txMb: number;
}

export function mapCustomerUsage(raw: unknown): CustomerUsage {
  const r = rec(raw);
  return { rxMb: num(r.rx_mb), txMb: num(r.tx_mb) };
}

/* ------------------------------------------------------------------ */
/* News / notices — GET /v1/news                                       */
/* ------------------------------------------------------------------ */

export interface CustomerNotice {
  id: string;
  title: string;
  details: string;
  url: string;
  createdAt: string;
}

/** `news_notice` row: `{id, name, details, url, image, created_at}`. */
export function mapCustomerNotice(raw: unknown): CustomerNotice {
  const r = rec(raw);
  return {
    id: str(r.id),
    title: clean(r.name),
    details: str(r.details),
    url: /^https?:\/\//i.test(clean(r.url)) ? clean(r.url) : '',
    createdAt: dateInput(r.created_at),
  };
}

/* ------------------------------------------------------------------ */
/* Invoice — GET /v1/customer/json/invoice-print                       */
/* ------------------------------------------------------------------ */

export interface InvoiceParty {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
}

export interface CustomerInvoice {
  payment: CustomerPayment;
  customer: InvoiceParty;
  issuer: InvoiceParty | null;
}

function mapParty(raw: unknown): InvoiceParty {
  const r = rec(raw);
  return {
    id: str(r.id),
    name: clean(r.name),
    mobile: clean(r.mobile),
    email: clean(r.email),
    address: clean(r.address),
  };
}

/** `{invoice (payments row), user, admin?, reseller?, view_type}` */
export function mapCustomerInvoice(raw: unknown): CustomerInvoice {
  const r = rec(raw);
  return {
    payment: mapCustomerPayment(r.invoice),
    customer: mapParty(r.user),
    issuer: r.admin ? mapParty(r.admin) : null,
  };
}

/* ------------------------------------------------------------------ */
/* Router control — /v1/customer/router-control/* and autofix/*       */
/* ------------------------------------------------------------------ */

export type RouterActionMode = 'auto' | 'manual';

export interface RouterTarget {
  id: string;
  label: string;
  capabilityType: string;
  webAdminUrl: string;
  actions: { reboot: RouterActionMode; changeWifi: RouterActionMode; listDevices: RouterActionMode };
}

const mode = (value: unknown): RouterActionMode => (str(value) === 'auto' ? 'auto' : 'manual');

/** `{user_id, targets: [{id, label, capability_type, web_admin_url, actions}]}` */
export function mapRouterTargets(raw: unknown): RouterTarget[] {
  return rows(rec(raw).targets).map((t) => {
    const a = rec(t.actions);
    return {
      id: str(t.id),
      label: clean(t.label),
      capabilityType: clean(t.capability_type),
      webAdminUrl: clean(t.web_admin_url),
      actions: { reboot: mode(a.reboot), changeWifi: mode(a.change_wifi), listDevices: mode(a.list_devices) },
    };
  });
}

/** Result of a router/autofix action: `{status, transport_used, message, steps|client_steps|next_steps, web_admin_url}`. */
export interface RouterActionResult {
  /** success | pending | completed | failed … as returned. */
  status: string;
  /** True when the backend refused because the same action ran moments ago. */
  isCooldown: boolean;
  message: string;
  steps: string[];
  webAdminUrl: string;
}

export function mapRouterActionResult(raw: unknown): RouterActionResult {
  const r = rec(raw);
  const steps = [r.steps, r.client_steps, r.next_steps].find(Array.isArray) as unknown[] | undefined;
  return {
    status: clean(r.status) || 'done',
    isCooldown: str(r.transport_used) === 'cooldown',
    message: clean(r.message),
    steps: (steps ?? []).map((s) => str(s)).filter(Boolean),
    webAdminUrl: clean(r.web_admin_url),
  };
}

export interface RouterDevice {
  mac: string;
  ip: string;
  hostname: string;
  online: boolean;
}

export interface RouterDevicesResult extends RouterActionResult {
  connection: { online: boolean | null; ip: string; mac: string; uptime: string };
  devices: RouterDevice[];
  homeDevicesSupported: boolean;
}

export function mapRouterDevices(raw: unknown): RouterDevicesResult {
  const r = rec(raw);
  const c = rec(r.connection);
  return {
    ...mapRouterActionResult(raw),
    connection: {
      online: c.online === null || c.online === undefined ? null : Boolean(c.online),
      ip: clean(c.ip),
      mac: clean(c.mac),
      uptime: clean(c.uptime),
    },
    devices: rows(r.devices).map((d) => ({
      mac: clean(d.mac),
      ip: clean(d.ip),
      hostname: clean(d.hostname),
      online: Boolean(d.online),
    })),
    homeDevicesSupported: Boolean(r.home_devices_supported),
  };
}

/** `GET /v1/customer/ping-user` → `{status, average_latency, packets:{sent, received, loss}}`. */
export interface PingResult {
  status: string;
  averageLatency: string;
  sent: number;
  received: number;
  loss: string;
}

export function mapPingResult(raw: unknown): PingResult {
  const r = rec(raw);
  const p = rec(r.packets);
  return {
    status: clean(r.status),
    averageLatency: clean(r.average_latency),
    sent: num(p.sent),
    received: num(p.received),
    loss: clean(p.loss),
  };
}

/* ------------------------------------------------------------------ */
/* Rewards & referrals                                                 */
/* ------------------------------------------------------------------ */

export interface RewardWallet {
  balance: number;
  held: number;
  lifetimeEarned: number;
  lifetimeUsed: number;
  expiringPoints: number;
  /** Tenant-configured BDT value of one point. */
  pointValueBdt: number;
}

export function mapRewardWallet(raw: unknown): RewardWallet {
  const r = rec(raw);
  return {
    balance: num(r.balance),
    held: num(r.held),
    lifetimeEarned: num(r.lifetime_earned),
    lifetimeUsed: num(r.lifetime_used),
    expiringPoints: num(r.expiring_points),
    pointValueBdt: num(r.point_value_bdt),
  };
}

export interface ReferralOverview {
  code: string;
  link: string;
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  earnedPoints: number;
}

export function mapReferralOverview(raw: unknown): ReferralOverview {
  const r = rec(raw);
  const s = rec(r.stats);
  return {
    code: clean(r.referral_code),
    link: clean(r.referral_link),
    total: num(s.total),
    pending: num(s.pending),
    verified: num(s.verified),
    rejected: num(s.rejected),
    earnedPoints: num(s.earned_points),
  };
}

export interface RewardTransaction {
  id: string;
  date: string;
  points: number;
  direction: 'credit' | 'debit';
  balanceAfter: number;
  description: string;
}

export function mapRewardTransaction(raw: unknown): RewardTransaction {
  const r = rec(raw);
  return {
    id: str(r.id),
    date: dateInput(r.date),
    points: num(r.points),
    direction: str(r.direction) === 'debit' ? 'debit' : 'credit',
    balanceAfter: num(r.balance_after),
    description: clean(r.description) || clean(r.source),
  };
}

export interface RedeemPreview {
  packagePrice: number;
  availablePoints: number;
  maxUsablePoints: number;
  pointsApplied: number;
  discountBdt: number;
  finalPayable: number;
  pointValueBdt: number;
  maxRedeemPercent: number;
}

export function mapRedeemPreview(raw: unknown): RedeemPreview {
  const r = rec(raw);
  return {
    packagePrice: num(r.package_price),
    availablePoints: num(r.available_points),
    maxUsablePoints: num(r.max_usable_points),
    pointsApplied: num(r.points_applied),
    discountBdt: num(r.discount_bdt),
    finalPayable: num(r.final_payable),
    pointValueBdt: num(r.point_value_bdt),
    maxRedeemPercent: num(r.max_redeem_percent),
  };
}

/* ------------------------------------------------------------------ */
/* Notifications — GET /v1/customer/notifications                      */
/* ------------------------------------------------------------------ */

export interface CustomerNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface CustomerNotificationInbox {
  unreadCount: number;
  notifications: CustomerNotification[];
}

/** `{user_id, total, unread_count, notifications: [{id, type, title, message, time, read, action_url}]}` */
export function mapNotificationInbox(raw: unknown): CustomerNotificationInbox {
  const r = rec(raw);
  return {
    unreadCount: num(r.unread_count),
    notifications: rows(r.notifications).map((n) => ({
      id: num(n.id),
      type: clean(n.type),
      title: clean(n.title),
      message: str(n.message),
      time: dateInput(n.time),
      read: Boolean(n.read),
    })),
  };
}

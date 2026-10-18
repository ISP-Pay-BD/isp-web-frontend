import { num, str } from '@/lib/api/case';

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});

/** Backend 'Y-m-d H:i:s' → parseable ISO-like string ('' when empty). */
export function isoDate(value: unknown): string {
  const s = str(value).trim();
  if (!s || s.startsWith('0000')) return '';
  return s.includes('T') ? s : s.replace(' ', 'T');
}

export type MessageChannel = 'sms' | 'whatsapp';

/* ── SMS centre ─────────────────────────────────────────────── */

export interface SmsVariable {
  tag: string;
  label: string;
}

export interface SmsGatewayStatus {
  key: string;
  name: string | null;
  /** online | error | not_configured | disabled */
  status: string;
  /** Balance string as reported by the gateway, null when it cannot report one. */
  balance: string | null;
  message: string | null;
  checkedAt: string;
}

export interface SmsOverview {
  gateway: SmsGatewayStatus;
  today: { sent: number; failed: number; pending: number };
  last30: { sent: number; failed: number; deliveryRate: number | null };
  queuePending: number;
  variables: SmsVariable[];
}

export function mapOverview(raw: unknown): SmsOverview {
  const r = obj(raw);
  const g = obj(r.gateway);
  const today = obj(r.today);
  const month = obj(r.last_30_days);
  return {
    gateway: {
      key: str(g.key),
      name: g.name === null || g.name === undefined ? null : str(g.name),
      status: str(g.status, 'not_configured'),
      balance: g.balance === null || g.balance === undefined ? null : str(g.balance),
      message: g.message === null || g.message === undefined ? null : str(g.message),
      checkedAt: str(g.checked_at),
    },
    today: { sent: num(today.sent), failed: num(today.failed), pending: num(today.pending) },
    last30: {
      sent: num(month.sent),
      failed: num(month.failed),
      deliveryRate: month.delivery_rate === null || month.delivery_rate === undefined ? null : num(month.delivery_rate),
    },
    queuePending: num(r.queue_pending),
    variables: Array.isArray(r.variables) ? r.variables.map((v) => ({ tag: str(obj(v).tag), label: str(obj(v).label) })) : [],
  };
}

export interface SmsRecipient {
  id: string;
  name: string;
  mobile: string;
  areaId: string;
  areaName: string;
  packageName: string;
  status: string;
}

export interface SmsArea {
  id: string;
  name: string;
  activeCustomers: number;
}

export interface SmsTemplateOption {
  id: string;
  title: string;
  content: string;
  templateType: string;
}

export function mapRecipient(raw: unknown): SmsRecipient {
  const r = obj(raw);
  return {
    id: str(r.id),
    name: str(r.name),
    mobile: str(r.mobile),
    areaId: str(r.area_id),
    areaName: str(r.area_name),
    packageName: str(r.package_name),
    status: str(r.status),
  };
}

export function mapArea(raw: unknown): SmsArea {
  const r = obj(raw);
  return { id: str(r.id), name: str(r.name), activeCustomers: num(r.active_customers) };
}

export interface SmsLogRow {
  id: string;
  sentTo: string;
  content: string;
  /** sent | failed | pending */
  status: 'sent' | 'failed' | 'pending';
  rawStatus: string;
  gateway: string;
  logs: string;
  sentAt: string;
}

export function deliveryStatus(raw: unknown): 'sent' | 'failed' | 'pending' {
  const s = str(raw).toLowerCase();
  if (s === 'success' || s === 'sent' || s === 'delivered') return 'sent';
  if (s === 'pending' || s === 'queued' || s === 'processing') return 'pending';
  return 'failed';
}

export function mapSmsLog(raw: unknown): SmsLogRow {
  const r = obj(raw);
  return {
    id: str(r.id),
    sentTo: str(r.send_to),
    content: str(r.content),
    status: deliveryStatus(r.status),
    rawStatus: str(r.status),
    gateway: str(r.gateway),
    logs: str(r.logs),
    sentAt: isoDate(r.datetime),
  };
}

export interface MessageBatch {
  id: string;
  channel: string;
  source: string;
  title: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  /** queued | processing | completed */
  status: string;
  progressPct: number;
  createdAt: string;
  completedAt: string;
}

export function mapBatch(raw: unknown): MessageBatch {
  const r = obj(raw);
  return {
    id: str(r.id),
    channel: str(r.channel),
    source: str(r.source),
    title: str(r.title),
    total: num(r.total),
    sent: num(r.sent),
    failed: num(r.failed),
    pending: num(r.pending),
    status: str(r.status),
    progressPct: num(r.progress_pct),
    createdAt: isoDate(r.created_at),
    completedAt: isoDate(r.completed_at),
  };
}

export interface SmsPreviewItem {
  customerId: string;
  name: string;
  mobile: string;
  message: string;
}

/* ── Templates & event triggers ─────────────────────────────── */

export interface SmsTemplateRow {
  id: string;
  templateName: string;
  messageBody: string;
  /** 'default' templates are global and read-only; 'custom' belong to the tenant. */
  templateType: 'default' | 'custom';
  editable: boolean;
  variables: string[];
  createdAt: string;
}

export function mapTemplate(raw: unknown): SmsTemplateRow {
  const r = obj(raw);
  const body = str(r.message_body);
  const vars = Array.from(new Set(Array.from(body.matchAll(/\{+([A-Za-z_]+)\}+/g), (m) => m[1] ?? '').filter(Boolean)));
  return {
    id: str(r.id),
    templateName: str(r.template_name),
    messageBody: body,
    templateType: str(r.template_type) === 'default' ? 'default' : 'custom',
    editable: Boolean(r.editable),
    variables: vars,
    createdAt: isoDate(r.created_at),
  };
}

export interface SmsEventRow {
  event: string;
  label: string;
  description: string;
  enabled: boolean;
  templateId: string;
  configured: boolean;
}

export function mapEvent(raw: unknown): SmsEventRow {
  const r = obj(raw);
  return {
    event: str(r.event),
    label: str(r.label),
    description: str(r.description),
    enabled: Boolean(r.enabled),
    templateId: r.template_id === null || r.template_id === undefined ? '' : str(r.template_id),
    configured: Boolean(r.configured),
  };
}

/* ── Dunning & reminders ────────────────────────────────────── */

export interface DunningRule {
  id: string;
  name: string;
  daysOffset: number;
  channel: MessageChannel;
  templateId: string;
  templateName: string;
  message: string;
  active: boolean;
  lastRunAt: string;
}

export function mapDunningRule(raw: unknown): DunningRule {
  const r = obj(raw);
  return {
    id: str(r.id),
    name: str(r.name),
    daysOffset: num(r.days_offset),
    channel: str(r.channel) === 'whatsapp' ? 'whatsapp' : 'sms',
    templateId: r.template_id === null || r.template_id === undefined ? '' : str(r.template_id),
    templateName: str(r.template_name),
    message: str(r.message),
    active: Boolean(r.active),
    lastRunAt: isoDate(r.last_run_at),
  };
}

export interface DunningRuleInput {
  name: string;
  daysOffset: number;
  channel: MessageChannel;
  templateId: string;
  message: string;
  active: boolean;
}

export function dunningRuleBody(input: DunningRuleInput) {
  return {
    name: input.name,
    days_offset: input.daysOffset,
    channel: input.channel,
    template_id: input.templateId || null,
    message: input.message,
    active: input.active,
  };
}

export interface ReminderRow {
  id: string;
  ruleName: string;
  customerId: string;
  customerName: string;
  area: string;
  channel: MessageChannel;
  mobile: string;
  message: string;
  dueDate: string;
  amount: number | null;
  source: string;
  status: 'queued' | 'sent' | 'failed';
  error: string;
  queuedAt: string;
  sentAt: string;
}

export function mapReminder(raw: unknown): ReminderRow {
  const r = obj(raw);
  const status = str(r.status);
  return {
    id: str(r.id),
    ruleName: str(r.rule_name),
    customerId: str(r.customer_id),
    customerName: str(r.customer_name),
    area: str(r.area),
    channel: str(r.channel) === 'whatsapp' ? 'whatsapp' : 'sms',
    mobile: str(r.mobile),
    message: str(r.message),
    dueDate: str(r.due_date),
    amount: r.amount === null || r.amount === undefined ? null : num(r.amount),
    source: str(r.source),
    status: status === 'sent' || status === 'failed' ? status : 'queued',
    error: str(r.error),
    queuedAt: isoDate(r.queued_at),
    sentAt: isoDate(r.sent_at),
  };
}

export interface ReminderStats {
  total: number;
  queued: number;
  sent: number;
  failed: number;
  queuedAmount: number;
}

export function mapReminderStats(raw: unknown): ReminderStats {
  const r = obj(raw);
  return { total: num(r.total), queued: num(r.queued), sent: num(r.sent), failed: num(r.failed), queuedAmount: num(r.queued_amount) };
}

/* ── Usage alerts ───────────────────────────────────────────── */

export interface UsageAlertRule {
  id: string;
  name: string;
  quotaGb: number;
  thresholdPct: number;
  packageId: string;
  packageName: string;
  channel: MessageChannel;
  templateId: string;
  templateName: string;
  message: string;
  active: boolean;
  lastRunAt: string;
}

export function mapUsageRule(raw: unknown): UsageAlertRule {
  const r = obj(raw);
  return {
    id: str(r.id),
    name: str(r.name),
    quotaGb: num(r.quota_gb),
    thresholdPct: num(r.threshold_pct),
    packageId: r.package_id === null || r.package_id === undefined ? '' : str(r.package_id),
    packageName: str(r.package_name),
    channel: str(r.channel) === 'whatsapp' ? 'whatsapp' : 'sms',
    templateId: r.template_id === null || r.template_id === undefined ? '' : str(r.template_id),
    templateName: str(r.template_name),
    message: str(r.message),
    active: Boolean(r.active),
    lastRunAt: isoDate(r.last_run_at),
  };
}

export interface UsageAlertInput {
  name: string;
  quotaGb: number;
  thresholdPct: number;
  packageId: string;
  channel: MessageChannel;
  templateId: string;
  message: string;
  active: boolean;
}

export function usageRuleBody(input: UsageAlertInput) {
  return {
    name: input.name,
    quota_gb: input.quotaGb,
    threshold_pct: input.thresholdPct,
    package_id: input.packageId || null,
    channel: input.channel,
    template_id: input.templateId || null,
    message: input.message,
    active: input.active,
  };
}

export interface UsageAlertStats {
  totalRules: number;
  activeRules: number;
  alertsThisMonth: number;
  alertsToday: number;
  usageDataAvailable: boolean;
}

export function mapUsageStats(raw: unknown): UsageAlertStats {
  const r = obj(raw);
  return {
    totalRules: num(r.total_rules),
    activeRules: num(r.active_rules),
    alertsThisMonth: num(r.alerts_this_month),
    alertsToday: num(r.alerts_today),
    usageDataAvailable: Boolean(r.usage_data_available),
  };
}

export interface UsageAlertLogRow {
  id: string;
  ruleName: string;
  customerName: string;
  period: string;
  usageGb: number;
  quotaGb: number;
  channel: MessageChannel;
  mobile: string;
  message: string;
  status: 'queued' | 'sent' | 'failed';
  createdAt: string;
}

export function mapUsageLog(raw: unknown): UsageAlertLogRow {
  const r = obj(raw);
  const status = str(r.status);
  return {
    id: str(r.id),
    ruleName: str(r.rule_name),
    customerName: str(r.customer_name),
    period: str(r.period),
    usageGb: num(r.usage_gb),
    quotaGb: num(r.quota_gb),
    channel: str(r.channel) === 'whatsapp' ? 'whatsapp' : 'sms',
    mobile: str(r.mobile),
    message: str(r.message),
    status: status === 'sent' || status === 'failed' ? status : 'queued',
    createdAt: isoDate(r.created_at),
  };
}

/** SMS segments: 160 GSM chars (153 per part when split), 70/67 for Unicode (Bangla). */
export function smsParts(text: string): number {
  if (!text) return 0;
  const unicode = /[^\x00-\x7F]/.test(text);
  const single = unicode ? 70 : 160;
  const multi = unicode ? 67 : 153;
  return text.length <= single ? 1 : Math.ceil(text.length / multi);
}

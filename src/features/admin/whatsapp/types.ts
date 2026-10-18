import { num, str } from '@/lib/api/case';
import { isoDate } from '@/features/admin/sms/types';

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const bool = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

export type WaCategory = 'UTILITY' | 'AUTHENTICATION' | 'MARKETING';

/* ── Inbox (AI chatbot conversation store) ───────────────────── */

export interface WaConversation {
  id: string;
  phone: string;
  /** Linked ISP customer id ('' for leads). */
  userId: string;
  name: string;
  isLead: boolean;
  escalated: boolean;
  updatedAt: string;
  totalMessages: number;
}

export function mapConversation(raw: unknown): WaConversation {
  const r = obj(raw);
  const isLead = bool(r.is_lead);
  return {
    id: str(r.conversation_id),
    phone: str(r.wa_phone),
    userId: str(r.user_id),
    name: str(r.profile_name) || (isLead ? 'New lead' : 'Customer'),
    isLead,
    escalated: bool(r.escalated),
    updatedAt: isoDate(r.updated_at),
    totalMessages: num(r.total_messages),
  };
}

export interface WaMessage {
  id: string;
  /** 'user' = the customer, anything else = AI or staff. */
  fromCustomer: boolean;
  sender: string;
  text: string;
  timestamp: string;
}

export function mapMessage(raw: unknown): WaMessage {
  const r = obj(raw);
  const role = str(r.role).toLowerCase();
  return {
    id: str(r.id),
    fromCustomer: role === 'user',
    sender: role === 'assistant' ? 'AI assistant' : role === 'user' ? 'Customer' : str(r.sender) || 'Agent',
    text: str(r.content),
    timestamp: isoDate(r.created_at),
  };
}

/* ── Templates ───────────────────────────────────────────────── */

export interface WaTemplate {
  id: string;
  name: string;
  language: string;
  category: WaCategory;
  status: string;
  eventKey: string;
  body: string;
  enabled: boolean;
  metaTemplateId: string;
  updatedAt: string;
}

export function mapTemplate(raw: unknown): WaTemplate {
  const r = obj(raw);
  const cat = str(r.category).toUpperCase();
  return {
    id: str(r.id),
    name: str(r.name),
    language: str(r.language, 'en'),
    category: (['UTILITY', 'AUTHENTICATION', 'MARKETING'].includes(cat) ? cat : 'UTILITY') as WaCategory,
    status: str(r.status).toUpperCase() || 'PENDING',
    eventKey: str(r.event_key),
    body: str(r.body_preview),
    enabled: bool(r.is_enabled),
    metaTemplateId: str(r.meta_template_id),
    updatedAt: isoDate(r.updated_at ?? r.created_at),
  };
}

export interface WaTemplateStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  utility: number;
  marketing: number;
  authentication: number;
}

export function mapTemplateStats(raw: unknown): WaTemplateStats {
  const r = obj(raw);
  return {
    total: num(r.total),
    approved: num(r.approved),
    pending: num(r.pending),
    rejected: num(r.rejected),
    utility: num(r.utility),
    marketing: num(r.marketing),
    authentication: num(r.authentication),
  };
}

/* ── Message log ─────────────────────────────────────────────── */

export interface WaLogRow {
  id: string;
  phone: string;
  category: string;
  direction: 'inbound' | 'outbound';
  templateName: string;
  status: string;
  errorCode: string;
  wamid: string;
  billable: boolean;
  payload: string;
  sentAt: string;
}

export function mapLog(raw: unknown): WaLogRow {
  const r = obj(raw);
  return {
    id: str(r.id),
    phone: str(r.wa_phone),
    category: str(r.category),
    direction: str(r.direction) === 'in' ? 'inbound' : 'outbound',
    templateName: str(r.template_name),
    status: str(r.status).toLowerCase(),
    errorCode: str(r.error_code),
    wamid: str(r.wamid),
    billable: bool(r.billable),
    payload: str(r.payload_redacted),
    sentAt: isoDate(r.created_at),
  };
}

export interface WaLogStats {
  total: number;
  outbound: number;
  inbound: number;
  failed: number;
  successRate: number | null;
}

export function mapLogStats(raw: unknown): WaLogStats {
  const r = obj(raw);
  return {
    total: num(r.total),
    outbound: num(r.outbound),
    inbound: num(r.inbound),
    failed: num(r.failed),
    successRate: r.success_rate === null || r.success_rate === undefined ? null : num(r.success_rate),
  };
}

/* ── Opt-ins ─────────────────────────────────────────────────── */

export interface WaOptIn {
  id: string;
  phone: string;
  customerName: string;
  optedIn: boolean;
  source: string;
  changedAt: string;
}

export function mapOptIn(raw: unknown): WaOptIn {
  const r = obj(raw);
  const optedIn = bool(r.marketing_opt_in);
  return {
    id: str(r.id),
    phone: str(r.wa_phone),
    customerName: str(r.customer_name),
    optedIn,
    source: str(r.source),
    changedAt: isoDate(optedIn ? r.opted_in_at : (r.opted_out_at ?? r.updated_at)),
  };
}

/* ── Campaigns ───────────────────────────────────────────────── */

export interface WaCampaign {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  status: string;
  sent: number;
  failed: number;
  recipients: number;
  createdAt: string;
}

export function mapCampaign(raw: unknown): WaCampaign {
  const r = obj(raw);
  const stats = obj(r.stats);
  return {
    id: str(r.id),
    name: str(r.name),
    templateId: str(r.template_id),
    templateName: str(r.template_name),
    status: str(r.status, 'draft'),
    sent: num(stats.sent),
    failed: num(stats.failed),
    recipients: num(r.recipients),
    createdAt: isoDate(r.created_at),
  };
}

/* ── Settings ────────────────────────────────────────────────── */

export interface WaMetaAccount {
  phoneNumberId: string;
  displayPhone: string;
  wabaId: string;
  accessTokenMasked: string;
  hasAccessToken: boolean;
  verifyToken: string;
  hasAppSecret: boolean;
  isActive: boolean;
  aiEnabled: boolean;
  utilityEnabled: boolean;
  authenticationEnabled: boolean;
  marketingEnabled: boolean;
  otpChannel: string;
  updatedAt: string;
}

export interface WaWahaAccount {
  baseUrl: string;
  session: string;
  sessionStatus: string;
  hasApiKey: boolean;
  isActive: boolean;
  aiEnabled: boolean;
}

export interface WaSettings {
  meta: WaMetaAccount | null;
  waha: WaWahaAccount | null;
  webhookUrl: string;
  canMeta: boolean;
  canWaha: boolean;
  canUpdate: boolean;
}

export function mapSettings(raw: unknown): WaSettings {
  const r = obj(raw);
  const a = r.account ? obj(r.account) : null;
  const w = r.waha_account ? obj(r.waha_account) : null;
  return {
    meta: a
      ? {
          phoneNumberId: str(a.phone_number_id),
          displayPhone: str(a.display_phone),
          wabaId: str(a.waba_id),
          accessTokenMasked: str(a.access_token_masked),
          hasAccessToken: bool(a.has_access_token),
          verifyToken: str(a.verify_token),
          hasAppSecret: bool(a.has_app_secret),
          isActive: bool(a.is_active),
          aiEnabled: bool(a.ai_enabled),
          utilityEnabled: bool(a.utility_enabled),
          authenticationEnabled: bool(a.authentication_enabled),
          marketingEnabled: bool(a.marketing_enabled),
          otpChannel: str(a.otp_channel, 'sms'),
          updatedAt: isoDate(a.updated_at),
        }
      : null,
    waha: w
      ? {
          baseUrl: str(w.waha_base_url),
          session: str(w.waha_session),
          sessionStatus: str(w.session_status, 'STOPPED'),
          hasApiKey: bool(w.has_api_key),
          isActive: bool(w.is_active),
          aiEnabled: bool(w.ai_enabled),
        }
      : null,
    webhookUrl: str(r.webhook_url),
    canMeta: bool(r.can_meta),
    canWaha: bool(r.can_waha),
    canUpdate: bool(r.can_update),
  };
}

export interface WaMetaForm {
  phoneNumberId: string;
  displayPhone: string;
  wabaId: string;
  verifyToken: string;
  accessToken: string;
  appSecret: string;
  isActive: boolean;
  aiEnabled: boolean;
  utilityEnabled: boolean;
  authenticationEnabled: boolean;
  marketingEnabled: boolean;
  otpChannel: string;
}

export function metaFormFrom(meta: WaMetaAccount | null): WaMetaForm {
  return {
    phoneNumberId: meta?.phoneNumberId ?? '',
    displayPhone: meta?.displayPhone ?? '',
    wabaId: meta?.wabaId ?? '',
    verifyToken: meta?.verifyToken ?? '',
    accessToken: '',
    appSecret: '',
    isActive: meta?.isActive ?? false,
    aiEnabled: meta?.aiEnabled ?? false,
    utilityEnabled: meta?.utilityEnabled ?? false,
    authenticationEnabled: meta?.authenticationEnabled ?? false,
    marketingEnabled: meta?.marketingEnabled ?? false,
    otpChannel: meta?.otpChannel ?? 'sms',
  };
}

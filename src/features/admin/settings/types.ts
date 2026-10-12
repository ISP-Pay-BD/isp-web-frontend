/** Company profile / branding keys stored under the tenant's own settings class. */
export interface GeneralSettings {
  appName: string;
  appSlogan: string;
  companyCell: string;
  webmasterEmail: string;
  companyAddress: string;
  /** Tenant admins only (null when the backend does not return the key). */
  expiryReminderDays: string | null;
  logoUrl: string | null;
  iconUrl: string | null;
}

export type SettingsGroupId = 'smtp' | 'sms' | 'payment';

export type SettingsFieldType = 'text' | 'number' | 'secret' | 'textarea' | 'select' | 'toggle';

export interface SettingsField {
  key: string;
  label: string;
  type: SettingsFieldType;
  /** string for text-like fields, boolean for toggles, '' for secrets */
  value: string | boolean;
  options?: { value: string; label: string }[];
  /** secrets only */
  isSet?: boolean;
  hint?: string;
}

export interface SettingsSection {
  id: string;
  label: string;
  /** Toggle field that switches the whole section (payment gateways). */
  enableKey: string | null;
  fields: SettingsField[];
}

export interface SettingsGroup {
  group: SettingsGroupId;
  label: string;
  sections: SettingsSection[];
}

export interface SmsBalance {
  gateway: string;
  ok: boolean;
  balance: string | null;
  message: string | null;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  status: 'active' | 'revoked';
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string | null;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secretHint: string;
  lastDeliveryAt: string | null;
  lastStatus: number | null;
  createdAt: string | null;
}

export interface WebhookDelivery {
  id: string;
  event: string;
  statusCode: number | null;
  success: boolean;
  durationMs: number | null;
  error: string | null;
  createdAt: string | null;
}

export interface Option {
  value: string;
  label: string;
}

export interface TenantExport {
  id: string;
  fileName: string;
  sizeBytes: number;
  rowCounts: Record<string, number>;
  status: string;
  createdAt: string | null;
}

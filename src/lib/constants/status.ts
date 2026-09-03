/** Domain constants & status enums for multi-tenant ISP SaaS */

export const CUSTOMER_STATUS = {
  active: 'active',
  expired: 'expired',
  expiring: 'expiring',
  suspended: 'suspended',
  pending: 'pending',
} as const;

export type CustomerStatus = (typeof CUSTOMER_STATUS)[keyof typeof CUSTOMER_STATUS];

export const PAYMENT_STATUS = {
  paid: 'paid',
  pending: 'pending',
  failed: 'failed',
  refunded: 'refunded',
  cancelled: 'cancelled',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const TICKET_STATUS = {
  open: 'open',
  in_progress: 'in_progress',
  answered: 'answered',
  closed: 'closed',
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const ROUTER_STATUS = {
  online: 'online',
  offline: 'offline',
  unknown: 'unknown',
} as const;

export type RouterStatus = (typeof ROUTER_STATUS)[keyof typeof ROUTER_STATUS];

export const TENANT_STATUS = {
  active: 'active',
  trial: 'trial',
  suspended: 'suspended',
  expired: 'expired',
} as const;

export type TenantStatus = (typeof TENANT_STATUS)[keyof typeof TENANT_STATUS];

export const PACKAGE_BILLING = {
  monthly: 'monthly',
  yearly: 'yearly',
  one_time: 'one_time',
} as const;

export type PackageBilling = (typeof PACKAGE_BILLING)[keyof typeof PACKAGE_BILLING];

/** Common page sizes for DataTable */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25 as const;

/** Mock API default delay (ms) - optimized for lightning-fast responsiveness with crisp micro-skeleton */
export const MOCK_DELAY_MS = 30;

/** LocalStorage keys */
export const STORAGE_KEYS = {
  locale: 'ipb_locale',
  theme: 'ipb_theme',
  sidebarCollapsed: 'ipb_sidebar_collapsed',
} as const;

/** Bangladesh country dial */
export const BD_COUNTRY_CODE = '+880' as const;

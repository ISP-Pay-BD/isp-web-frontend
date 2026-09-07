/** Platform catalog extras — metering, SLA, tenant health, billing mode */

export interface MeteringRow {
  tenantId: string;
  tenantSlug: string;
  domain: string;
  customers: number;
  apiCalls: number;
  smsSent: number;
  storageGb: number;
  period: string;
}

export interface SlaRow {
  tenantId: string;
  tenantSlug: string;
  uptimePct: number;
  openTickets: number;
  severity: 'ok' | 'watch' | 'critical';
  targetPct: number;
}

export interface TenantHealthFactor {
  label: string;
  value: string;
  tone: 'ok' | 'warn' | 'bad';
}

export interface TenantHealthCard {
  tenantId: string;
  score: number;
  factors: TenantHealthFactor[];
}

export interface BillingModeRow {
  adminId: string;
  tenantName: string;
  mode: 'prepaid' | 'postpaid';
  walletBdt: number;
  nextInvoiceAt: string | null;
}

export const meteringRows: MeteringRow[] = [
  {
    tenantId: 'tenant_demo',
    tenantSlug: 'demo',
    domain: 'demo.isppaybd.com',
    customers: 1250,
    apiCalls: 420_000,
    smsSent: 18_400,
    storageGb: 42,
    period: '2026-09',
  },
  {
    tenantId: 'tenant_fastnet',
    tenantSlug: 'fastnet',
    domain: 'fastnet.isppaybd.com',
    customers: 4200,
    apiCalls: 1_200_000,
    smsSent: 84_000,
    storageGb: 128,
    period: '2026-09',
  },
  {
    tenantId: 'tenant_skylink',
    tenantSlug: 'skylink',
    domain: 'skylink.isppaybd.com',
    customers: 380,
    apiCalls: 95_000,
    smsSent: 4_200,
    storageGb: 12,
    period: '2026-09',
  },
];

export const slaRows: SlaRow[] = [
  {
    tenantId: 'tenant_demo',
    tenantSlug: 'demo',
    uptimePct: 99.98,
    openTickets: 12,
    severity: 'ok',
    targetPct: 99.9,
  },
  {
    tenantId: 'tenant_fastnet',
    tenantSlug: 'fastnet',
    uptimePct: 99.2,
    openTickets: 48,
    severity: 'watch',
    targetPct: 99.5,
  },
  {
    tenantId: 'tenant_skylink',
    tenantSlug: 'skylink',
    uptimePct: 98.4,
    openTickets: 9,
    severity: 'critical',
    targetPct: 99.0,
  },
];

export const tenantHealthById: Record<string, TenantHealthCard> = {
  tenant_demo: {
    tenantId: 'tenant_demo',
    score: 92,
    factors: [
      { label: 'Online routers', value: '98%', tone: 'ok' },
      { label: 'Payment success', value: '96%', tone: 'ok' },
      { label: 'Ticket backlog', value: 'Low', tone: 'ok' },
      { label: 'Wallet balance', value: 'Healthy', tone: 'ok' },
    ],
  },
  tenant_fastnet: {
    tenantId: 'tenant_fastnet',
    score: 86,
    factors: [
      { label: 'Online routers', value: '94%', tone: 'ok' },
      { label: 'Payment success', value: '91%', tone: 'warn' },
      { label: 'Ticket backlog', value: 'Medium', tone: 'warn' },
      { label: 'Wallet balance', value: 'Healthy', tone: 'ok' },
    ],
  },
  ten_01: {
    tenantId: 'ten_01',
    score: 86,
    factors: [
      { label: 'Online routers', value: '98%', tone: 'ok' },
      { label: 'Payment success', value: '94%', tone: 'ok' },
      { label: 'Ticket backlog', value: 'Low', tone: 'ok' },
      { label: 'Wallet balance', value: 'Healthy', tone: 'ok' },
    ],
  },
};

export const billingModes: BillingModeRow[] = [
  {
    adminId: 'adm_01',
    tenantName: 'Demo ISP Network',
    mode: 'prepaid',
    walletBdt: 48_500,
    nextInvoiceAt: null,
  },
  {
    adminId: 'padm_101',
    tenantName: 'FastNet BD',
    mode: 'postpaid',
    walletBdt: 0,
    nextInvoiceAt: '2026-10-01',
  },
];

export const platformCatalogData = {
  metering: meteringRows,
  sla: slaRows,
  tenantHealth: tenantHealthById,
  billingModes,
};

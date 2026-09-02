export interface GeneralSettings {
  companyName: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  currencySymbol: string;
  invoicePrefix: string;
  dueDayOfMonth: number;
}

export interface SmtpSettings {
  host: string;
  port: number;
  encryption: 'tls' | 'ssl' | 'none';
  username: string;
  fromName: string;
  fromEmail: string;
}

export interface SmsGatewaySettings {
  provider: 'mimsms' | 'greenweb' | 'onnorokom' | 'infobip';
  apiKey: string;
  senderId: string;
  balanceBdt: number;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  enabled: boolean;
  mode: 'sandbox' | 'live';
  merchantNumber?: string;
  appKeyMasked?: string;
}

export interface ServerCdnConfig {
  id: string;
  name: string;
  type: 'movie' | 'news';
  url: string;
  status: 'active' | 'inactive';
}

export interface CronJobConfig {
  name: string;
  schedule: string;
  lastRun: string;
  status: 'ok' | 'failed' | 'running';
  description: string;
}

export interface SoftwareSettingsData {
  general: GeneralSettings;
  smtp: SmtpSettings;
  smsGateway: SmsGatewaySettings;
  paymentGateways: PaymentGatewayConfig[];
  servers: ServerCdnConfig[];
  cronjobs: CronJobConfig[];
}

export const softwareSettingsData: SoftwareSettingsData = {
  general: {
    companyName: 'ISP Pay BD Demo Network',
    supportPhone: '01700-000000',
    supportEmail: 'support@demo.isppaybd.com',
    address: 'House 42, Road 11, Sector 4, Uttara, Dhaka 1230',
    currencySymbol: '৳',
    invoicePrefix: 'INV-2026-',
    dueDayOfMonth: 10,
  },
  smtp: {
    host: 'smtp.mailgun.org',
    port: 587,
    encryption: 'tls',
    username: 'postmaster@demo.isppaybd.com',
    fromName: 'ISP Pay BD Billing',
    fromEmail: 'billing@demo.isppaybd.com',
  },
  smsGateway: {
    provider: 'mimsms',
    apiKey: 'mim_live_9a87d6f5e4c3b2a1',
    senderId: 'ISPPAYBD',
    balanceBdt: 4250.75,
  },
  paymentGateways: [
    {
      id: 'bkash',
      name: 'bKash Tokenized Checkout',
      enabled: true,
      mode: 'live',
      merchantNumber: '01711-223344',
      appKeyMasked: 'bks_app_live_****98a2',
    },
    {
      id: 'nagad',
      name: 'Nagad Direct Gateway',
      enabled: true,
      mode: 'live',
      merchantNumber: '01822-334455',
      appKeyMasked: 'ngd_live_****31f0',
    },
    {
      id: 'rocket',
      name: 'Dutch Bangla Rocket',
      enabled: false,
      mode: 'sandbox',
      merchantNumber: '01933-445566-7',
      appKeyMasked: 'rkt_sand_****001a',
    },
    {
      id: 'sslcommerz',
      name: 'SSLCommerz Aggregator',
      enabled: true,
      mode: 'live',
      appKeyMasked: 'ssl_store_****88cc',
    },
  ],
  servers: [
    {
      id: 'srv_1',
      name: 'BDIX Ultra FTP & Movie Hub',
      type: 'movie',
      url: 'http://172.16.50.2/movies',
      status: 'active',
    },
    {
      id: 'srv_2',
      name: 'Dhaka Torrent CDN',
      type: 'movie',
      url: 'http://10.10.10.5/torrent',
      status: 'active',
    },
    {
      id: 'srv_3',
      name: 'Prothom Alo Local Mirror',
      type: 'news',
      url: 'http://172.16.80.10/news',
      status: 'active',
    },
  ],
  cronjobs: [
    {
      name: 'Daily Invoice & Expiry Check',
      schedule: '0 0 * * * (Midnight)',
      lastRun: '2026-09-02 00:00:15',
      status: 'ok',
      description: 'Generates due invoices and marks unrenewed customers expired',
    },
    {
      name: 'SMS Bill Alert Dispatcher',
      schedule: '0 10 1 * * (1st of month, 10:00 AM)',
      lastRun: '2026-09-01 10:00:02',
      status: 'ok',
      description: 'Dispatches monthly bill reminder SMS to active subscribers',
    },
    {
      name: 'MikroTik Auto-Sync',
      schedule: '*/15 * * * * (Every 15 mins)',
      lastRun: '2026-09-02 22:45:00',
      status: 'ok',
      description: 'Syncs PPPoE and queue statuses from MikroTik routers',
    },
  ],
};

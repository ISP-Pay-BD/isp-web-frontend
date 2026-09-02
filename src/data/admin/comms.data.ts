export interface SmsTemplate {
  id: string;
  templateName: string;
  templateType: 'custom' | 'system';
  messageBody: string;
  variables: string[];
}

export interface SmsEventConfig {
  id: string;
  eventName: string;
  description: string;
  enabled: boolean;
  templateId: string;
}

export interface SmsLog {
  id: string;
  recipient: string;
  customerName: string;
  message: string;
  sentAt: string;
  status: 'delivered' | 'sent' | 'failed';
  parts: number;
}

export const smsTemplatesData: SmsTemplate[] = [
  {
    id: 'tpl_01',
    templateName: 'Monthly Bill Reminder',
    templateType: 'system',
    messageBody: 'Dear {name}, your monthly internet bill for {month} of BDT {amount} is due by {due_date}. Please pay via bKash to avoid suspension. ISP Pay BD.',
    variables: ['name', 'month', 'amount', 'due_date'],
  },
  {
    id: 'tpl_02',
    templateName: 'Payment Confirmation',
    templateType: 'system',
    messageBody: 'Dear {name}, we received BDT {amount} for your {package} package. TrxID: {trx_id}. Thank you for choosing us!',
    variables: ['name', 'amount', 'package', 'trx_id'],
  },
  {
    id: 'tpl_03',
    templateName: 'Account Expired Notice',
    templateType: 'system',
    messageBody: 'Dear {name}, your broadband service has expired. Kindly recharge online or contact support at 01700000000 to restore your connection.',
    variables: ['name'],
  },
  {
    id: 'tpl_04',
    templateName: 'Fiber Maintenance Notice',
    templateType: 'custom',
    messageBody: 'Dear Customer, emergency fiber repair work will take place tonight from 2:00 AM to 5:00 AM in {area}. Service may be interrupted.',
    variables: ['area'],
  },
  {
    id: 'tpl_05',
    templateName: 'Special Festive Discount',
    templateType: 'custom',
    messageBody: 'Eid Mubarak {name}! Upgrade to 30 Mbps package today and enjoy a 20% discount on your next 3 billing cycles. ISP Pay BD.',
    variables: ['name'],
  },
];

export const smsEventsData: SmsEventConfig[] = [
  {
    id: 'evt_01',
    eventName: 'Bill Generation',
    description: 'Triggered when monthly billing invoice is automatically created',
    enabled: true,
    templateId: 'tpl_01',
  },
  {
    id: 'evt_02',
    eventName: 'Payment Success',
    description: 'Triggered upon verified manual or gateway payment receipt',
    enabled: true,
    templateId: 'tpl_02',
  },
  {
    id: 'evt_03',
    eventName: 'Subscription Expiry',
    description: 'Triggered when customer account becomes inactive on expiry date',
    enabled: true,
    templateId: 'tpl_03',
  },
  {
    id: 'evt_04',
    eventName: 'Support Ticket Status Update',
    description: 'Triggered when an admin replies or closes a support ticket',
    enabled: false,
    templateId: 'tpl_01',
  },
];

export const smsLogsData: SmsLog[] = [
  {
    id: 'sms_001',
    recipient: '01712-345678',
    customerName: 'Rahim Uddin',
    message: 'Dear Rahim Uddin, your monthly internet bill for September of BDT 1,200 is due by 10 Sep 2026. ISP Pay BD.',
    sentAt: '2026-09-02T10:15:00',
    status: 'delivered',
    parts: 1,
  },
  {
    id: 'sms_002',
    recipient: '01811-987654',
    customerName: 'Sadia Islam',
    message: 'Dear Sadia Islam, we received BDT 1,500 for your Home 30 Mbps package. TrxID: 9X82K19A. Thank you!',
    sentAt: '2026-09-02T09:30:00',
    status: 'delivered',
    parts: 1,
  },
  {
    id: 'sms_003',
    recipient: '01915-223344',
    customerName: 'Anwar Hossain',
    message: 'Dear Customer, emergency fiber repair work will take place tonight from 2:00 AM to 5:00 AM in Sector 3. Service may be interrupted.',
    sentAt: '2026-09-01T19:00:00',
    status: 'delivered',
    parts: 1,
  },
  {
    id: 'sms_004',
    recipient: '01610-887766',
    customerName: 'Tanvir Ahmed',
    message: 'Dear Tanvir Ahmed, your broadband service has expired. Kindly recharge online or contact support.',
    sentAt: '2026-09-01T08:00:00',
    status: 'failed',
    parts: 1,
  },
];

// WhatsApp Business Data
export interface WhatsAppMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  provider?: 'meta' | 'waha';
}

export interface WhatsAppConversation {
  id: string;
  phone: string;
  customerName: string;
  unreadCount: number;
  lastMessage: string;
  lastTimestamp: string;
  provider: 'meta' | 'waha';
  messages: WhatsAppMessage[];
}

export const whatsappConversationsData: WhatsAppConversation[] = [
  {
    id: 'wa_conv_1',
    phone: '+8801712345678',
    customerName: 'Rahim Uddin (Uttara)',
    unreadCount: 1,
    lastMessage: 'Can you please check my speed? Getting high ping.',
    lastTimestamp: '2026-09-02T11:20:00',
    provider: 'waha',
    messages: [
      {
        id: 'wam_1',
        sender: 'user',
        text: 'Hello, is anyone available from support?',
        timestamp: '2026-09-02T10:45:00',
        status: 'read',
      },
      {
        id: 'wam_2',
        sender: 'agent',
        text: 'Hi Rahim! Yes, how can we assist you today?',
        timestamp: '2026-09-02T10:48:00',
        status: 'read',
        provider: 'waha',
      },
      {
        id: 'wam_3',
        sender: 'user',
        text: 'Can you please check my speed? Getting high ping.',
        timestamp: '2026-09-02T11:20:00',
        status: 'delivered',
      },
    ],
  },
  {
    id: 'wa_conv_2',
    phone: '+8801811987654',
    customerName: 'Sadia Islam (Banani)',
    unreadCount: 0,
    lastMessage: 'Your invoice #INV-2026-098 is ready.',
    lastTimestamp: '2026-09-01T15:10:00',
    provider: 'meta',
    messages: [
      {
        id: 'wam_21',
        sender: 'agent',
        text: 'Your invoice #INV-2026-098 is ready. Amount: ৳1,500. Pay via bKash merchant.',
        timestamp: '2026-09-01T15:10:00',
        status: 'read',
        provider: 'meta',
      },
    ],
  },
  {
    id: 'wa_conv_3',
    phone: '+8801915223344',
    customerName: 'Anwar Hossain (Mirpur)',
    unreadCount: 0,
    lastMessage: 'Got it, internet is working smoothly now. Thanks!',
    lastTimestamp: '2026-08-30T17:40:00',
    provider: 'waha',
    messages: [
      {
        id: 'wam_31',
        sender: 'user',
        text: 'Red light blinking on my ONU device.',
        timestamp: '2026-08-30T16:00:00',
        status: 'read',
      },
      {
        id: 'wam_32',
        sender: 'agent',
        text: 'Our local lineman has patched the fiber core at Section 10. Please restart your ONU now.',
        timestamp: '2026-08-30T17:25:00',
        status: 'read',
        provider: 'waha',
      },
      {
        id: 'wam_33',
        sender: 'user',
        text: 'Got it, internet is working smoothly now. Thanks!',
        timestamp: '2026-08-30T17:40:00',
        status: 'read',
      },
    ],
  },
];

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  category: 'UTILITY' | 'AUTHENTICATION' | 'MARKETING';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  body: string;
  lastUpdated: string;
}

export const whatsappTemplatesData: WhatsAppTemplate[] = [
  {
    id: 'wat_1',
    name: 'invoice_ready_bdt',
    language: 'en',
    category: 'UTILITY',
    status: 'APPROVED',
    body: 'Hello {{1}}, your monthly ISP invoice for {{2}} is ready. Total: ৳{{3}}. Due date: {{4}}.',
    lastUpdated: '2026-08-15',
  },
  {
    id: 'wat_2',
    name: 'payment_received_receipt',
    language: 'en',
    category: 'UTILITY',
    status: 'APPROVED',
    body: 'Thank you {{1}}! We have received your payment of ৳{{2}} via {{3}}. TrxID: {{4}}.',
    lastUpdated: '2026-08-18',
  },
  {
    id: 'wat_3',
    name: 'otp_verification_code',
    language: 'en',
    category: 'AUTHENTICATION',
    status: 'APPROVED',
    body: 'Your ISP Pay BD portal security code is {{1}}. Valid for 5 minutes. Do not share.',
    lastUpdated: '2026-07-20',
  },
  {
    id: 'wat_4',
    name: 'eid_bonus_offer_2026',
    language: 'en',
    category: 'MARKETING',
    status: 'APPROVED',
    body: 'Exclusive Offer for {{1}}! Renew before 10th and get free double speed during night hours.',
    lastUpdated: '2026-08-25',
  },
  {
    id: 'wat_5',
    name: 'festival_double_bandwidth',
    language: 'bn',
    category: 'MARKETING',
    status: 'PENDING',
    body: 'প্রিয় গ্রাহক {{1}}, এই ঈদে উপভোগ করুন দ্বিগুণ স্পিড বোনাস। বিস্তারিত জানতে ভিজিট করুন আমাদের পোর্টালে।',
    lastUpdated: '2026-09-01',
  },
];

export interface WhatsAppMessageLog {
  id: string;
  phone: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION' | 'SERVICE';
  direction: 'inbound' | 'outbound';
  templateName?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'queued';
  sentAt: string;
  provider: 'meta' | 'waha';
}

export const whatsappMessageLogsData: WhatsAppMessageLog[] = [
  {
    id: 'wal_001',
    phone: '+8801712345678',
    category: 'UTILITY',
    direction: 'outbound',
    templateName: 'invoice_ready_bdt',
    status: 'read',
    sentAt: '2026-09-02T09:00:00',
    provider: 'meta',
  },
  {
    id: 'wal_002',
    phone: '+8801811987654',
    category: 'SERVICE',
    direction: 'inbound',
    status: 'read',
    sentAt: '2026-09-02T10:14:00',
    provider: 'waha',
  },
  {
    id: 'wal_003',
    phone: '+8801915223344',
    category: 'AUTHENTICATION',
    direction: 'outbound',
    templateName: 'otp_verification_code',
    status: 'delivered',
    sentAt: '2026-09-02T10:30:00',
    provider: 'meta',
  },
  {
    id: 'wal_004',
    phone: '+8801610887766',
    category: 'MARKETING',
    direction: 'outbound',
    templateName: 'eid_bonus_offer_2026',
    status: 'failed',
    sentAt: '2026-09-01T14:20:00',
    provider: 'meta',
  },
];

export interface WhatsAppOptIn {
  id: string;
  phone: string;
  customerName: string;
  optedIn: boolean;
  optInDate: string;
}

export const whatsappOptInsData: WhatsAppOptIn[] = [
  { id: 'opt_1', phone: '8801712345678', customerName: 'Rahim Uddin', optedIn: true, optInDate: '2026-07-10' },
  { id: 'opt_2', phone: '8801811987654', customerName: 'Sadia Islam', optedIn: true, optInDate: '2026-08-01' },
  { id: 'opt_3', phone: '8801915223344', customerName: 'Anwar Hossain', optedIn: true, optInDate: '2026-08-15' },
  { id: 'opt_4', phone: '8801610887766', customerName: 'Tanvir Ahmed', optedIn: false, optInDate: '2026-08-20' },
];

export interface WhatsAppCampaign {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  status: 'draft' | 'running' | 'completed' | 'cancelled' | 'failed';
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  createdAt: string;
}

export const whatsappCampaignsData: WhatsAppCampaign[] = [
  {
    id: 'camp_1',
    name: 'September Speed Booster Promo',
    templateId: 'wat_4',
    templateName: 'eid_bonus_offer_2026',
    status: 'completed',
    totalRecipients: 450,
    sentCount: 450,
    deliveredCount: 432,
    createdAt: '2026-09-01T10:00:00',
  },
  {
    id: 'camp_2',
    name: 'Uttara Fiber Upgrade Notice',
    templateId: 'wat_1',
    templateName: 'invoice_ready_bdt',
    status: 'running',
    totalRecipients: 120,
    sentCount: 85,
    deliveredCount: 80,
    createdAt: '2026-09-02T09:30:00',
  },
  {
    id: 'camp_3',
    name: 'Draft New Packages Blast',
    templateId: 'wat_4',
    templateName: 'eid_bonus_offer_2026',
    status: 'draft',
    totalRecipients: 300,
    sentCount: 0,
    deliveredCount: 0,
    createdAt: '2026-09-02T12:00:00',
  },
];

export interface WhatsAppSettingsConfig {
  meta: {
    enabled: boolean;
    appId: string;
    phoneNumberId: string;
    wabaId: string;
    webhookUrl: string;
    webhookVerifyToken: string;
    hasAccessToken: boolean;
  };
  waha: {
    enabled: boolean;
    serverUrl: string;
    hasApiKey: boolean;
    sessionStatus: 'CONNECTED' | 'SCAN_QR_CODE' | 'STARTING' | 'STOPPED';
    activeSessionName: string;
  };
  notifications: {
    sendBillAlert: boolean;
    sendPaymentReceipt: boolean;
    sendExpiryWarning: boolean;
    autoAiReply: boolean;
  };
}

export const whatsappSettingsData: WhatsAppSettingsConfig = {
  meta: {
    enabled: true,
    appId: '108429381928374',
    phoneNumberId: '1098273645129',
    wabaId: '8827364519283',
    webhookUrl: 'https://isppaybd.com/api/v1/webhook/whatsapp/meta',
    webhookVerifyToken: 'isp_pay_bd_secure_verify_token_2026',
    hasAccessToken: true,
  },
  waha: {
    enabled: true,
    serverUrl: 'http://127.0.0.1:3000',
    hasApiKey: true,
    sessionStatus: 'CONNECTED',
    activeSessionName: 'default',
  },
  notifications: {
    sendBillAlert: true,
    sendPaymentReceipt: true,
    sendExpiryWarning: true,
    autoAiReply: true,
  },
};

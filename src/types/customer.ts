import type { Payment, SupportTicket, NewsItem } from '@/data/shared/types';

export interface ConnectedDevice {
  id: string;
  name: string;
  mac: string;
  ip: string;
  connectedAt: string;
}

export interface RouterInfo {
  routerModel: string;
  pppoeUsername: string;
  ipAddress: string;
  macAddress: string;
  lastReconnect: string;
  connectionType: string;
  firmware: string;
  wifiSsid: string;
}

export interface CustomerDashboardData {
  subscription: {
    userId: string;
    packageId: string;
    packageName: string;
    speedMbps: number;
    priceBdt: number;
    startDate: string;
    expiryDate: string;
    status: string;
    autoRenew: boolean;
    quotaUsedGb: number;
    quotaTotalGb: number;
  };
  paymentsSummary: {
    totalPaidBdt: number;
    pendingDueBdt: number;
    lastPaymentDate: string;
    recentPayments: Payment[];
  };
  openTicketsCount: number;
  recentTickets: SupportTicket[];
  latestNotices: NewsItem[];
  emergencyContact: {
    phone: string;
    whatsapp: string;
    email: string;
    supportHours: string;
  };
  trafficData: Array<{
    timestamp: string;
    timeLabel: string;
    downloadMbps: number;
    uploadMbps: number;
  }>;
}

export interface CustomerSubscriptionData {
  subscription: {
    userId: string;
    packageId: string;
    packageName: string;
    speedMbps: number;
    priceBdt: number;
    startDate: string;
    expiryDate: string;
    status: string;
    autoRenew: boolean;
    quotaUsedGb: number;
    quotaTotalGb: number;
  };
  routerInfo: {
    pppoeUsername: string;
    routerModel: string;
    ipAddress: string;
    macAddress: string;
  };
  availablePackages: Array<{
    id: string;
    name: string;
    speedMbps: number;
    priceBdt: number;
    validityDays: number;
    description?: string;
  }>;
}

export interface CustomerPaymentsData {
  summary: {
    totalPaidBdt: number;
    pendingDueBdt: number;
    successfulCount: number;
    pendingCount: number;
  };
  payments: Payment[];
}

export interface PayInvoicePayload {
  amount: number;
  method: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'card' | 'bank';
  accountNumber?: string;
  trxId?: string;
}

export interface CreateTicketPayload {
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  message: string;
}

export interface TicketReplyPayload {
  ticketId: string;
  message: string;
}

export interface UpdateWifiPayload {
  ssid: string;
  password: string;
  securityMode?: string;
  hideSsid?: boolean;
}

export interface UpdateProfilePayload {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

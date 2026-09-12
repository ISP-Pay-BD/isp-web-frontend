import { http } from '../client';
import {
  transformBackendCustomerDashboard,
  transformBackendCustomerSubscription,
  transformBackendCustomerPayments,
} from '../adapters/customer.adapter';
import type {
  CustomerDashboardData,
  CustomerSubscriptionData,
  CustomerPaymentsData,
  PayInvoicePayload,
  CreateTicketPayload,
  TicketReplyPayload,
  UpdateWifiPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '@/lib/mock-api/handlers/customer.handler';
import { mockFetch } from '@/lib/mock-api/client';
import type { SupportTicket, NewsItem } from '@/data/shared/types';
import { customerProfile, customerNotifications } from '@/data/customer/profile.data';
import { routerTools, connectedDevices, customerRewards } from '@/data/customer/subscription.data';

export interface RouterInfoResult {
  router: typeof routerTools;
  connectedDevices: typeof connectedDevices;
  ipAddress: string;
  macAddress: string;
  connectionStatus: string;
}

export interface CustomerProfileResult {
  profile: typeof customerProfile;
  notifications: typeof customerNotifications;
}

export const customerService = {
  getDashboard: async (): Promise<CustomerDashboardData> => {
    try {
      const raw = await http.get<Record<string, unknown>>('/v1/customer/dashboard');
      return transformBackendCustomerDashboard(raw);
    } catch {
      return (await mockFetch('customer.dashboard')) as CustomerDashboardData;
    }
  },

  getSubscription: async (): Promise<CustomerSubscriptionData> => {
    try {
      const raw = await http.get<Record<string, unknown>>('/v1/customer/subscription/index');
      return transformBackendCustomerSubscription(raw);
    } catch {
      return (await mockFetch('customer.subscription')) as CustomerSubscriptionData;
    }
  },

  renewSubscription: async (packageId?: string) => {
    try {
      return await http.post('/v1/customer/subscription/renew', { package_id: packageId });
    } catch {
      return await mockFetch('customer.subscription.renew', packageId);
    }
  },

  getPackages: async () => {
    try {
      return await http.get('/v1/customer/packages');
    } catch {
      return await mockFetch('customer.packages');
    }
  },

  getPayments: async (): Promise<CustomerPaymentsData> => {
    try {
      const raw = await http.get<Record<string, unknown>>('/v1/customer/payment-fetch');
      return transformBackendCustomerPayments(raw);
    } catch {
      return (await mockFetch('customer.payments')) as CustomerPaymentsData;
    }
  },

  payInvoice: async (payload: PayInvoicePayload) => {
    try {
      return await http.post('/v1/customer/payments', payload);
    } catch {
      return await mockFetch('customer.payments.pay', payload);
    }
  },

  getSupportTickets: async (): Promise<{ tickets: SupportTicket[] }> => {
    try {
      const raw = await http.get<Record<string, unknown>>('/v1/customer/support/fetch');
      const list = Array.isArray(raw) ? raw : (raw.tickets as SupportTicket[]) || [];
      return { tickets: list };
    } catch {
      return (await mockFetch('customer.support.list')) as { tickets: SupportTicket[] };
    }
  },

  getTicketDetail: async (id: string): Promise<SupportTicket> => {
    try {
      return await http.get<SupportTicket>(`/v1/customer/support/details?ticket_id=${id}`);
    } catch {
      return (await mockFetch('customer.support.get', id)) as SupportTicket;
    }
  },

  createTicket: async (payload: CreateTicketPayload) => {
    try {
      return await http.post('/v1/customer/support/create-ticket', payload);
    } catch {
      return await mockFetch('customer.support.create', payload);
    }
  },

  replyTicket: async (payload: TicketReplyPayload) => {
    try {
      return await http.post('/v1/customer/support/send-message', payload);
    } catch {
      return await mockFetch('customer.support.reply', payload);
    }
  },

  getRouterTools: async (): Promise<RouterInfoResult> => {
    try {
      return await http.get<RouterInfoResult>('/v1/customer/router-control/targets');
    } catch {
      return (await mockFetch('customer.router.tools')) as RouterInfoResult;
    }
  },

  updateWifi: async (payload: UpdateWifiPayload) => {
    try {
      return await http.post('/v1/customer/router-control/wifi', payload);
    } catch {
      return await mockFetch('customer.router.updateWifi', payload);
    }
  },

  quickFixPing: async (actionId = 'quick_fix') => {
    try {
      return await http.post<{ success: boolean; message: string; timestamp: string }>('/v1/customer/autofix/quick-fix', { action: actionId });
    } catch {
      return await mockFetch('customer.router.quickFix', actionId);
    }
  },

  getConnectedDevices: async () => {
    try {
      return await http.get<typeof connectedDevices>('/v1/customer/device/connected');
    } catch {
      return connectedDevices;
    }
  },

  getRewards: async () => {
    try {
      return await http.get<typeof customerRewards>('/v1/customer/reward/wallet');
    } catch {
      return (await mockFetch('customer.rewards')) as typeof customerRewards;
    }
  },

  redeemRewards: async (points: number) => {
    try {
      return await http.post('/v1/customer/reward/redeem-preview', { points });
    } catch {
      return await mockFetch('customer.rewards.redeem', points);
    }
  },

  getNews: async (): Promise<{ items: NewsItem[] }> => {
    try {
      const raw = await http.get<NewsItem[]>('/v1/common/news');
      const items = Array.isArray(raw) ? raw : (raw as unknown as { items: NewsItem[] }).items || [];
      return { items };
    } catch {
      return (await mockFetch('customer.news.list')) as { items: NewsItem[] };
    }
  },

  getNewsById: async (id: string): Promise<NewsItem | null> => {
    try {
      return await http.get<NewsItem>(`/v1/common/news/${id}`);
    } catch {
      return (await mockFetch('customer.news.get', id)) as NewsItem | null;
    }
  },

  getProfile: async (): Promise<CustomerProfileResult> => {
    try {
      return await http.get<CustomerProfileResult>('/v1/customer/profile');
    } catch {
      return (await mockFetch('customer.profile.get')) as CustomerProfileResult;
    }
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    try {
      return await http.post('/v1/customer/profile/update', payload);
    } catch {
      return await mockFetch('customer.profile.update', payload);
    }
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    try {
      return await http.post('/v1/customer/profile/change-password', payload);
    } catch {
      return await mockFetch('customer.password.change', payload);
    }
  },
};

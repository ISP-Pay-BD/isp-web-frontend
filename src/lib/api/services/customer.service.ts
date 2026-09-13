import { http } from '../client';
import { getAuthUserId } from '../auth-utils';
import {
  transformBackendCustomerDashboard,
  transformBackendCustomerSubscription,
  transformBackendCustomerPayments,
  transformBackendCustomerProfile,
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
import type { SupportTicket, NewsItem } from '@/data/shared/types';
import { routerTools, connectedDevices, customerRewards } from '@/data/customer/subscription.data';

export interface RouterInfoResult {
  router: typeof routerTools;
  connectedDevices: typeof connectedDevices;
  ipAddress: string;
  macAddress: string;
  connectionStatus: string;
}

export interface CustomerProfileResult {
  profile: ReturnType<typeof transformBackendCustomerProfile>;
  notifications: unknown[];
}

export const customerService = {
  /**
   * `GET /api/v1/customer/users/{id}` returns the full self-care payload
   * (details, package, payment buckets, statistics, notices) — this is the
   * backend's customer dashboard endpoint.
   */
  getDashboard: async (): Promise<CustomerDashboardData> => {
    const raw = await http.get<Record<string, unknown>>(`/v1/customer/users/${getAuthUserId()}`);
    return transformBackendCustomerDashboard(raw);
  },

  getSubscription: async (): Promise<CustomerSubscriptionData> => {
    const raw = await http.get<Record<string, unknown>>('/v1/customer/subscription/index');
    return transformBackendCustomerSubscription(raw);
  },

  renewSubscription: async (packageId?: string) => {
    return await http.post('/v1/customer/subscription/renew', { package_id: packageId });
  },

  /** Backend requires `user_id` as a query parameter. */
  getPackages: async (): Promise<{ packages: any[]; currentPackageId: string }> => {
    const raw = await http.get<unknown>('/v1/customer/packages', { user_id: getAuthUserId() });
    let items: any[] = [];
    if (Array.isArray(raw)) {
      items = raw;
    } else if (raw && typeof raw === 'object') {
      const list =
        (raw as { packages?: unknown[]; data?: unknown[] }).packages ||
        (raw as { data?: unknown[] }).data;
      if (Array.isArray(list)) {
        items = list;
      }
    }
    return {
      packages: items,
      currentPackageId:
        (raw as { package_id?: string; currentPackageId?: string })?.package_id || 'pkg_20',
    };
  },

  /** Backend requires `user_id` as a query parameter. */
  getPayments: async (): Promise<CustomerPaymentsData> => {
    const raw = await http.get<Record<string, unknown>>('/v1/customer/payment-fetch', {
      user_id: getAuthUserId(),
    });
    return transformBackendCustomerPayments(raw);
  },

  /**
   * Records a customer payment. The backend endpoint creates a *pending*
   * payment only — settlement is performed by the payment gateway callback.
   */
  payInvoice: async (payload: PayInvoicePayload) => {
    return await http.post('/v1/customer/payments', {
      ...payload,
      user_id: getAuthUserId(),
    });
  },

  getSupportTickets: async (): Promise<{ tickets: SupportTicket[] }> => {
    const raw = await http.get<unknown>('/v1/customer/support/fetch');
    const list = Array.isArray(raw) ? raw : (raw as { tickets?: SupportTicket[] })?.tickets || [];
    return { tickets: list as SupportTicket[] };
  },

  getTicketDetail: async (id: string): Promise<SupportTicket> => {
    return await http.get<SupportTicket>(`/v1/customer/support/details?ticket_id=${id}`);
  },

  createTicket: async (payload: CreateTicketPayload) => {
    return await http.post('/v1/customer/support/create-ticket', payload);
  },

  replyTicket: async (payload: TicketReplyPayload) => {
    return await http.post('/v1/customer/support/send-message', payload);
  },

  getRouterTools: async (): Promise<RouterInfoResult> => {
    return await http.get<RouterInfoResult>('/v1/customer/router-control/targets');
  },

  updateWifi: async (payload: UpdateWifiPayload) => {
    return await http.post('/v1/customer/router-control/wifi', payload);
  },

  quickFixPing: async (actionId = 'quick_fix') => {
    return await http.post<{ success: boolean; message: string; timestamp: string }>(
      '/v1/customer/autofix/quick-fix',
      { action: actionId },
    );
  },

  getConnectedDevices: async () => {
    return await http.get<typeof connectedDevices>('/v1/customer/device/connected');
  },

  getRewards: async () => {
    return await http.get<typeof customerRewards>('/v1/customer/reward/wallet');
  },

  redeemRewards: async (points: number) => {
    return await http.post('/v1/customer/reward/redeem-preview', { points });
  },

  /** Backend route: `GET /api/common/news` (news is not versioned under /v1). */
  getNews: async (): Promise<{ items: NewsItem[] }> => {
    const raw = await http.get<NewsItem[]>('/common/news');
    const items = Array.isArray(raw) ? raw : (raw as unknown as { items: NewsItem[] })?.items || [];
    return { items };
  },

  /** Backend route: `GET /api/common/news/view/{id}`. */
  getNewsById: async (id: string): Promise<NewsItem | null> => {
    return await http.get<NewsItem>(`/common/news/view/${id}`);
  },

  /** Reuses the customer dashboard payload, which embeds the profile `details`. */
  getProfile: async (): Promise<CustomerProfileResult> => {
    const raw = await http.get<Record<string, unknown>>(`/v1/customer/users/${getAuthUserId()}`);
    return {
      profile: transformBackendCustomerProfile(raw),
      notifications: Array.isArray(raw.notifications) ? raw.notifications : [],
    };
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    return await http.post('/v1/customer/profile/update', payload);
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    return await http.post('/v1/customer/profile/change-password', {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
    });
  },
};

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

  /** Backend routes: `GET /v1/customer/reward/wallet` + `GET /v1/customer/referral/overview` (composed for the rewards screen). */
  getRewards: async () => {
    const [walletRes, overviewRes] = await Promise.allSettled([
      http.get<Record<string, unknown>>('/v1/customer/reward/wallet'),
      http.get<Record<string, unknown>>('/v1/customer/referral/overview'),
    ]);
    const raw = walletRes.status === 'fulfilled' ? (walletRes.value ?? {}) : {};
    const overview = overviewRes.status === 'fulfilled' ? ((overviewRes.value ?? {}) as Record<string, unknown>) : {};
    const stats = (overview.stats ?? {}) as Record<string, unknown>;
    return {
      pointsBalance: Number(raw.balance ?? 0),
      referralCode: String(overview.referral_code ?? ''),
      referralsCount: Number(stats.verified ?? stats.total ?? 0),
      pendingReferrals: Number(stats.pending ?? 0),
      transactions: customerRewards.transactions,
      lifetimeEarned: Number(raw.lifetime_earned ?? 0),
      lifetimeUsed: Number(raw.lifetime_used ?? 0),
      expiringPoints: Number(raw.expiring_points ?? 0),
      pointValueBdt: Number(raw.point_value_bdt ?? 1),
    };
  },

  /** Backend route: `GET /v1/customer/reward/redeem-preview?package_id=&points=` (preview only — commits nothing). */
  redeemPreview: async (packageId: string | number, points?: number) => {
    return await http.get('/v1/customer/reward/redeem-preview', {
      package_id: packageId,
      ...(points ? { points } : {}),
    });
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

  // ---- Phase 8 additions: previously unwired backend v1 routes ----

  /** GET /api/v1/customer/notifications — user resolved from access token. */
  getNotifications: async (): Promise<{ total: number; unreadCount: number; notifications: unknown[] }> => {
    const raw = (await http.get<Record<string, unknown>>('/v1/customer/notifications')) ?? {};
    return {
      total: Number(raw.total ?? 0),
      unreadCount: Number(raw.unread_count ?? 0),
      notifications: Array.isArray(raw.notifications) ? raw.notifications : [],
    };
  },

  /** POST /api/v1/customer/notifications/read — marks one (or all) as read. */
  markNotificationsRead: async (notificationId?: number) => {
    return await http.post('/v1/customer/notifications/read', {
      notification_id: notificationId ?? null,
    });
  },

  /** GET /api/v1/customer/subscription/quota — requires `user_id` query param. */
  getQuota: async () => {
    const raw = await http.get<Record<string, unknown>>('/v1/customer/subscription/quota', {
      user_id: getAuthUserId(),
    });
    return (raw as { data?: Record<string, unknown> })?.data ?? raw;
  },

  /** GET /api/v1/customer/usage — per-IP usage buckets. */
  getUsage: async (params?: Record<string, unknown>) => {
    return await http.get<unknown>('/v1/customer/usage', {
      user_id: getAuthUserId(),
      ...params,
    });
  },

  /** GET /api/v1/customer/reward/transactions — points ledger. */
  getRewardTransactions: async (): Promise<{ items: Record<string, unknown>[] }> => {
    const raw = (await http.get<Record<string, unknown>>('/v1/customer/reward/transactions')) ?? {};
    return { items: Array.isArray(raw.items) ? raw.items : [] };
  },

  /** GET /api/v1/customer/referral/overview — code, link and stats. */
  getReferralOverview: async () => {
    return await http.get<unknown>('/v1/customer/referral/overview');
  },

  /** GET /api/v1/customer/referral/history — paginated referral list. */
  getReferralHistory: async (params?: Record<string, unknown>) => {
    return await http.get<unknown>('/v1/customer/referral/history', params);
  },

  /**
   * POST /api/v1/customer/autofix/{action} — static literals per action so every
   * call site maps to a registered route. The backend reads `user_id` from the
   * query string (even on POST); quick-fix also takes an `issue` query param.
   */
  runAutoFix: async (
    action: 'reboot' | 'reconnect' | 'flush-dns' | 'reset-session' | 'quick-fix',
    opts?: { issue?: string },
  ) => {
    const params = { user_id: getAuthUserId(), ...(opts?.issue ? { issue: opts.issue } : {}) };
    switch (action) {
      case 'reboot':
        return await http.post<Record<string, unknown>>('/v1/customer/autofix/reboot', {}, params);
      case 'reconnect':
        return await http.post<Record<string, unknown>>('/v1/customer/autofix/reconnect', {}, params);
      case 'flush-dns':
        return await http.post<Record<string, unknown>>('/v1/customer/autofix/flush-dns', {}, params);
      case 'reset-session':
        return await http.post<Record<string, unknown>>('/v1/customer/autofix/reset-session', {}, params);
      case 'quick-fix':
      default:
        return await http.post<Record<string, unknown>>('/v1/customer/autofix/quick-fix', {}, params);
    }
  },

  /** POST /api/v1/customer/router-control/reboot — reboot the customer's router. */
  rebootRouter: async () => {
    return await http.post('/v1/customer/router-control/reboot', {}, { user_id: getAuthUserId() });
  },

  /** GET /api/v1/customer/router-control/devices — TR-069 device inventory. */
  getRouterDevices: async () => {
    return await http.get<unknown>('/v1/customer/router-control/devices');
  },

  /** POST /api/v1/customer/router-control/onboard-tr069 — register the CPE with the TR-069 engine. */
  onboardTr069: async (payload?: Record<string, unknown>) => {
    return await http.post('/v1/customer/router-control/onboard-tr069', payload ?? {}, {
      user_id: getAuthUserId(),
    });
  },

  /** GET /api/v1/customer/ping-user?router_id=&name= — live ICMP probe of the customer's PPPoE user. */
  pingUser: async (routerId: string | number, name: string) => {
    return await http.get<{ status: string; latency_ms?: number; message?: string }>(
      '/v1/customer/ping-user',
      { router_id: routerId, name },
    );
  },

  /** GET /api/v1/customer/routers/load-traffic/{routerId} — live router interface throughput. */
  getRouterLoadTraffic: async (routerId: string | number) => {
    return await http.get<unknown>(`/v1/customer/routers/load-traffic/${routerId}`);
  },

  /** GET /api/v1/customer/users-load-traffic/{userId} — per-user interface throughput. */
  getUserLoadTraffic: async (userId?: string | number) => {
    const finalId = userId || getAuthUserId();
    return await http.get<unknown>(`/v1/customer/users-load-traffic/${finalId}`);
  },

  /** GET /api/v1/customer/invoice-print?invoice_id= — printable invoice payload. */
  getInvoicePrint: async (invoiceId: string | number) => {
    return await http.get<unknown>('/v1/customer/invoice-print', { invoice_id: invoiceId });
  },

  /** GET /api/v1/customer/permission — permission map resolved from the JWT subject. */
  getPermissions: async () => {
    return await http.get<unknown>('/v1/customer/permission');
  },

  /** POST /api/v1/customer/subscription/activate-package — body: { user_id, package_id }. */
  activatePackage: async (packageId: string | number) => {
    return await http.post('/v1/customer/subscription/activate-package', {
      user_id: getAuthUserId(),
      package_id: packageId,
    });
  },

  /**
   * POST /api/v1/customer/subscription/update — update subscription dates/package
   * (self-care variant of the admin subscription editor).
   */
  updateSubscription: async (payload: { package_id?: string | number; will_expire?: string; last_renewed?: string }) => {
    return await http.post('/v1/customer/subscription/update', {
      user_id: getAuthUserId(),
      ...payload,
    });
  },

  /**
   * GET /api/v1/customer/make-payment/{id} — legacy gateway handoff (redirect flow).
   * The JSON variant returns the same payload without redirecting.
   */
  getMakePayment: async (paymentId: string | number, json = false) => {
    return json
      ? await http.get<unknown>(`/v1/customer/json/make-payment/${paymentId}`)
      : await http.get<unknown>(`/v1/customer/make-payment/${paymentId}`);
  },

  /** GET /api/v1/customer/make-reseller-payment/{id} — reseller wallet payment handoff. */
  getMakeResellerPayment: async (paymentId: string | number, json = false) => {
    return json
      ? await http.get<unknown>(`/v1/customer/json/make-reseller-payment/${paymentId}`)
      : await http.get<unknown>(`/v1/customer/make-reseller-payment/${paymentId}`);
  },
};

import { http } from '../client';
import { getAuthUserId } from '../auth-utils';
import {
  mapCustomerCheckout,
  mapCustomerDashboard,
  mapCustomerInvoice,
  mapCustomerNotice,
  mapCustomerPayment,
  mapCustomerSubscription,
  mapCustomerTicket,
  mapCustomerUsage,
  mapNotificationInbox,
  mapPingResult,
  mapRedeemPreview,
  mapReferralOverview,
  mapRewardTransaction,
  mapRewardWallet,
  mapRouterActionResult,
  mapRouterDevices,
  mapRouterTargets,
  mapSupportContact,
} from '../adapters/customer.adapter';

export interface PageParams {
  page: number;
  perPage: number;
}

export interface ManualPaymentPayload {
  amount: number;
  method: string;
  trxId: string;
  accountNumber?: string;
}

export interface CreateTicketPayload {
  subject: string;
  category: string;
  priority: string;
  message: string;
}

export interface UpdateProfilePayload {
  name: string;
  mobile: string;
  email: string;
  address: string;
}

export interface ChangeWifiPayload {
  ssid: string;
  password: string;
  band: string;
  targetId?: string;
}

/** POST /v1/customer/autofix/{action} — the backend reads `user_id` from the query string. */
export type AutoFixAction = 'reset-session' | 'flush-dns';

const pageQuery = ({ page, perPage }: PageParams) => ({ page, per_page: perPage });

/**
 * Customer self-care API. Every call is scoped to the signed-in customer by
 * the backend (JWT subject); `user_id` is only sent where the PHP service
 * reads it, and is always the caller's own id.
 */
export const customerService = {
  /* ---- Home ---------------------------------------------------------- */

  /** GET /v1/customer/dashboard — JWT-scoped home aggregate. */
  getDashboard: async () => mapCustomerDashboard(await http.get('/v1/customer/dashboard')),

  /** GET /v1/customer/support/contact — the owning ISP's helpline. */
  getSupportContact: async () =>
    mapSupportContact(await http.get('/v1/customer/support/contact', { user_id: getAuthUserId() })),

  /** GET /v1/customer/usage — live rx/tx counters of the PPPoE session. */
  getUsage: async () => mapCustomerUsage(await http.get('/v1/customer/usage', { user_id: getAuthUserId() })),

  /** GET /v1/news — the provider's notices (paginated `{data, pagination}`). */
  getNews: async (params: PageParams) => {
    const res = await http.getPage<unknown>('/v1/news', pageQuery(params));
    return { items: res.items.map(mapCustomerNotice), meta: res.meta };
  },

  /* ---- Subscription / packages / profile ----------------------------- */

  /** GET /v1/customer/subscription/index — users row + package catalogue (shared by subscription, packages, profile, pay). */
  getSubscription: async () =>
    mapCustomerSubscription(await http.get('/v1/customer/subscription/index', { limit: 100 })),

  /**
   * POST /v1/customer/subscription/renew — creates a *pending* invoice; the
   * customer completes it on the returned payment page.
   */
  renewSubscription: async (vars: { packageId: string; redeemPoints?: number }) =>
    mapCustomerCheckout(
      await http.post('/v1/customer/subscription/renew', {
        package_id: vars.packageId,
        user_id: getAuthUserId(),
        ...(vars.redeemPoints ? { redeem_points: vars.redeemPoints } : {}),
      }),
    ),

  /** POST /v1/customer/subscription/activate-package — queues a package change behind a pending invoice. */
  activatePackage: async (packageId: string) =>
    mapCustomerCheckout(
      await http.post('/v1/customer/subscription/activate-package', {
        user_id: getAuthUserId(),
        package_id: packageId,
      }),
    ),

  /** POST /v1/customer/profile/update — the backend takes the user from the JWT. */
  updateProfile: async (payload: UpdateProfilePayload) => http.post('/v1/customer/profile/update', payload),

  /** POST /v1/customer/profile/change-password — `{current_password, new_password}`, user from the JWT. */
  changePassword: async (payload: { currentPassword: string; newPassword: string }) =>
    http.post('/v1/customer/profile/change-password', {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
    }),

  /* ---- Payments ------------------------------------------------------ */

  /** GET /v1/customer/payment-fetch — the customer's own payments, paginated. */
  getPayments: async (params: PageParams) => {
    const res = await http.getPage<unknown>('/v1/customer/payment-fetch', {
      user_id: getAuthUserId(),
      ...pageQuery(params),
    });
    return { items: res.items.map(mapCustomerPayment), meta: res.meta };
  },

  /** POST /v1/customer/payments — records a manual payment as *pending* (staff verify it). */
  submitManualPayment: async (payload: ManualPaymentPayload) =>
    http.post<{ payment_id?: string; status?: string }>('/v1/customer/payments', {
      user_id: getAuthUserId(),
      amount: payload.amount,
      method: payload.method,
      trx_id: payload.trxId,
      account_number: payload.accountNumber ?? '',
    }),

  /** GET /v1/customer/json/invoice-print — a settled payment with customer + issuer. */
  getInvoice: async (invoiceId: string) =>
    mapCustomerInvoice(
      await http.get('/v1/customer/json/invoice-print', { invoice_id: invoiceId, user_id: getAuthUserId() }),
    ),

  /* ---- Support tickets (shared JWT-scoped /v1/tickets) --------------- */

  getTickets: async (params: PageParams) => {
    const me = String(getAuthUserId());
    const res = await http.getPage<unknown>('/v1/tickets', pageQuery(params));
    return { items: res.items.map((t) => mapCustomerTicket(t, me)), meta: res.meta };
  },

  getTicket: async (id: string) => {
    const me = String(getAuthUserId());
    return mapCustomerTicket(await http.get(`/v1/tickets/${encodeURIComponent(id)}`), me);
  },

  createTicket: async (payload: CreateTicketPayload) => http.post<{ id?: number | string }>('/v1/tickets', payload),

  replyTicket: async (id: string, message: string) =>
    http.post(`/v1/tickets/${encodeURIComponent(id)}/message`, { message }),

  /* ---- Router control ------------------------------------------------ */

  /** GET /v1/customer/router-control/targets → `{user_id, targets[]}`. */
  getRouterTargets: async () => mapRouterTargets(await http.get('/v1/customer/router-control/targets')),

  /** GET /v1/customer/router-control/devices — connection + home devices (when the CPE supports it). */
  getRouterDevices: async () => mapRouterDevices(await http.get('/v1/customer/router-control/devices')),

  /** POST /v1/customer/router-control/reboot */
  rebootRouter: async (targetId?: string) =>
    mapRouterActionResult(
      await http.post('/v1/customer/router-control/reboot', targetId ? { target_id: targetId } : {}),
    ),

  /** POST /v1/customer/router-control/wifi — `{ssid, password, band, target_id?}`. */
  changeWifi: async (payload: ChangeWifiPayload) =>
    mapRouterActionResult(
      await http.post('/v1/customer/router-control/wifi', {
        ssid: payload.ssid,
        password: payload.password,
        band: payload.band,
        ...(payload.targetId ? { target_id: payload.targetId } : {}),
      }),
    ),

  /** POST /v1/customer/autofix/{action}?user_id= — static literal per action. */
  runAutoFix: async (action: AutoFixAction) => {
    const params = { user_id: getAuthUserId() };
    const raw =
      action === 'flush-dns'
        ? await http.post('/v1/customer/autofix/flush-dns', {}, params)
        : await http.post('/v1/customer/autofix/reset-session', {}, params);
    return mapRouterActionResult(raw);
  },

  /** GET /v1/customer/ping-user — the backend pings the caller's own PPPoE session. */
  pingConnection: async () => mapPingResult(await http.get('/v1/customer/ping-user')),

  /* ---- Rewards ------------------------------------------------------- */

  getRewardWallet: async () => mapRewardWallet(await http.get('/v1/customer/reward/wallet')),

  getReferralOverview: async () => mapReferralOverview(await http.get('/v1/customer/referral/overview')),

  /** GET /v1/customer/reward/transactions — `{items, pagination}`. */
  getRewardTransactions: async (params: PageParams) => {
    const res = await http.getPage<unknown>('/v1/customer/reward/transactions', pageQuery(params));
    return { items: res.items.map(mapRewardTransaction), meta: res.meta };
  },

  /** GET /v1/customer/reward/redeem-preview — computes caps, commits nothing. */
  getRedeemPreview: async (packageId: string) =>
    mapRedeemPreview(await http.get('/v1/customer/reward/redeem-preview', { package_id: packageId })),

  /* ---- Notifications ------------------------------------------------- */

  getNotifications: async () => mapNotificationInbox(await http.get('/v1/customer/notifications')),

  /**
   * POST /v1/customer/notifications/read. The controller reads
   * `notification_id` with getPost() (form fields only), so a single id goes
   * as multipart form data; no id marks every notification read.
   */
  markNotificationsRead: async (notificationId?: number) => {
    if (notificationId === undefined) return http.post('/v1/customer/notifications/read', {});
    const form = new FormData();
    form.append('notification_id', String(notificationId));
    return http.upload('/v1/customer/notifications/read', form);
  },
};

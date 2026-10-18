'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, http } from '@/lib/api/client';
import { getResellerId } from '@/lib/api/auth-utils';
import { num, str } from '@/lib/api/case';
import { invalidatePlatformBilling } from '@/features/admin/payment/hooks/use-platform-checkout';
import { useTranslations } from '@/i18n/locale-context';

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceBdt: number;
  planType: string;
  maxCustomers: number | null;
  isUnlimited: boolean;
  features: string[];
  isCurrent: boolean;
  selfRechargeable: boolean;
  baseFeeBdt: number | null;
  perUserRateBdt: number | null;
}

export interface SubscriptionRecentPayment {
  id: string;
  invoiceNo: string;
  amountBdt: number;
  status: string;
  paidVia: string;
  description: string;
  purpose: string;
  gateway: string | null;
  gatewayRef: string | null;
  createdAt: string | null;
  paidAt: string | null;
}

export interface AdminSubscriptionData {
  tenantName: string;
  role: string;
  planName: string | null;
  planPriceBdt: number | null;
  planType: string | null;
  packageId: string;
  status: string;
  subscriptionStatus: string;
  billingType: string;
  willExpire: string | null;
  lastRenewed: string | null;
  quota: { used: number; limit: number; percent: number; isUnlimited: boolean } | null;
  plans: SubscriptionPlan[];
  providers: string[];
  canRecharge: boolean;
  recentPayments: SubscriptionRecentPayment[];
}

type Raw = Record<string, unknown>;

function mapSubscription(raw: Raw): AdminSubscriptionData {
  const sub = (raw.subscription ?? {}) as Raw;
  const quota = raw.quota && typeof raw.quota === 'object' ? (raw.quota as Raw) : null;
  return {
    tenantName: str(sub.name),
    role: str(sub.role),
    planName: sub.planName ? str(sub.planName) : null,
    planPriceBdt: sub.planPrice === null || sub.planPrice === undefined ? null : num(sub.planPrice),
    planType: sub.planType ? str(sub.planType) : null,
    packageId: str(sub.packageId),
    status: str(sub.status),
    subscriptionStatus: str(sub.subscriptionStatus),
    billingType: str(sub.billingType),
    willExpire: sub.willExpire ? str(sub.willExpire) : null,
    lastRenewed: sub.lastRenewed ? str(sub.lastRenewed) : null,
    quota: quota
      ? { used: num(quota.used), limit: num(quota.limit), percent: num(quota.percent), isUnlimited: Boolean(quota.is_unlimited) }
      : null,
    plans: (Array.isArray(raw.plans) ? (raw.plans as Raw[]) : []).map((p) => ({
      id: str(p.id),
      name: str(p.name),
      priceBdt: num(p.price),
      planType: str(p.plan_type) || 'fixed',
      maxCustomers: p.max_customers === null || p.max_customers === undefined ? null : num(p.max_customers),
      isUnlimited: Boolean(p.is_unlimited),
      features: Array.isArray(p.features) ? (p.features as unknown[]).map((v) => str(v)).filter(Boolean) : [],
      isCurrent: Boolean(p.is_current),
      selfRechargeable: Boolean(p.self_rechargeable),
      baseFeeBdt: p.base_fee === null || p.base_fee === undefined ? null : num(p.base_fee),
      perUserRateBdt: p.per_user_rate === null || p.per_user_rate === undefined ? null : num(p.per_user_rate),
    })),
    providers: Array.isArray(raw.checkout_providers) ? (raw.checkout_providers as unknown[]).map((v) => str(v)) : [],
    canRecharge: Boolean(raw.can_recharge),
    recentPayments: (Array.isArray(raw.recent_payments) ? (raw.recent_payments as Raw[]) : []).map((r) => ({
      id: str(r.id),
      invoiceNo: str(r.invoice) || `#${str(r.id)}`,
      amountBdt: num(r.amount),
      status: str(r.status),
      paidVia: str(r.paid_via),
      description: str(r.comment),
      purpose: str(r.purpose),
      gateway: r.gateway ? str(r.gateway) : null,
      gatewayRef: r.gateway_ref ? str(r.gateway_ref) : null,
      createdAt: r.created_at ? str(r.created_at) : null,
      paidAt: r.paid_at ? str(r.paid_at) : null,
    })),
  };
}

export const subscriptionKey = ['admin', 'subscription'] as const;

/** GET /v1/reseller/subscription/{rid} — own plan, quota, plans, gateways, recent platform payments. */
export function useAdminSubscription(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionKey,
    queryFn: async () => mapSubscription(await http.get<Raw>(`/v1/reseller/subscription/${getResellerId()}`)),
    enabled: options?.enabled ?? true,
  });
}

/**
 * POST /v1/reseller/subscription/{rid}/recharge {planId, method} — creates the
 * pending invoice and returns the gateway checkout URL; the browser is sent
 * there. Nothing renews until the gateway confirms the payment.
 */
export function useSelfRecharge() {
  const t = useTranslations();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { planId: string; method: string }) =>
      http.post<Raw>(`/v1/reseller/subscription/${getResellerId()}/recharge`, payload),
    onSuccess: (data) => {
      invalidatePlatformBilling(qc);
      const url = str(data?.redirect_url);
      if (url) {
        toast.message(t('admin.subscription.selfRecharge.invoiceRedirect', 'Invoice created — redirecting to the payment gateway…'));
        window.location.assign(url);
      } else {
        toast.error(t('admin.subscription.selfRecharge.noCheckout', 'The gateway did not return a checkout page. Your invoice is saved as pending.'));
      }
    },
    onError: (err) => {
      // The backend keeps a pending invoice even when the gateway refuses to start.
      invalidatePlatformBilling(qc);
      toast.error(err instanceof ApiError ? err.message : t('admin.subscription.selfRecharge.startFailed', 'Recharge could not be started'));
    },
  });
}

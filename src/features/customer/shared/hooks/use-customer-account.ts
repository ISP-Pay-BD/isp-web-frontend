'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerService, type PageParams } from '@/lib/api/services/customer.service';

/** One place for every customer-portal query key (invalidations must match these exactly). */
export const customerKeys = {
  dashboard: ['customer', 'dashboard'] as const,
  /** subscription/index — shared by subscription, packages, profile, pay, auto-pay, rewards. */
  subscription: ['customer', 'subscription'] as const,
  supportContact: ['customer', 'support-contact'] as const,
  usage: ['customer', 'usage'] as const,
  news: (p: PageParams) => ['customer', 'news', p] as const,
  payments: ['customer', 'payments'] as const,
  paymentsPage: (p: PageParams) => ['customer', 'payments', p] as const,
  invoice: (id: string) => ['customer', 'invoice', id] as const,
  tickets: ['customer', 'tickets'] as const,
  ticketsPage: (p: PageParams) => ['customer', 'tickets', 'list', p] as const,
  ticket: (id: string) => ['customer', 'tickets', 'detail', id] as const,
  routerTargets: ['customer', 'router', 'targets'] as const,
  routerDevices: ['customer', 'router', 'devices'] as const,
  rewards: ['customer', 'rewards'] as const,
  rewardWallet: ['customer', 'rewards', 'wallet'] as const,
  referral: ['customer', 'rewards', 'referral'] as const,
  rewardTransactions: (p: PageParams) => ['customer', 'rewards', 'transactions', p] as const,
  redeemPreview: (packageId: string) => ['customer', 'rewards', 'preview', packageId] as const,
  notifications: ['customer', 'notifications'] as const,
};

/** GET /v1/customer/dashboard */
export function useCustomerDashboard() {
  return useQuery({
    queryKey: customerKeys.dashboard,
    queryFn: () => customerService.getDashboard(),
  });
}

/** GET /v1/customer/subscription/index (users row + package catalogue). */
export function useCustomerSubscription() {
  return useQuery({
    queryKey: customerKeys.subscription,
    queryFn: () => customerService.getSubscription(),
  });
}

/** GET /v1/customer/support/contact — rarely changes, cache it longer. */
export function useSupportContact() {
  return useQuery({
    queryKey: customerKeys.supportContact,
    queryFn: () => customerService.getSupportContact(),
    staleTime: 10 * 60_000,
  });
}

/**
 * POST /v1/customer/subscription/renew. Creates a pending invoice; the
 * caller sends the customer to `checkout.paymentUrl` to settle it.
 */
export function useRenewSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { packageId: string; redeemPoints?: number }) => customerService.renewSubscription(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.subscription });
      queryClient.invalidateQueries({ queryKey: customerKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: customerKeys.payments });
      queryClient.invalidateQueries({ queryKey: customerKeys.rewards });
    },
  });
}

/** Full-page navigation to the backend's payment page (gateway checkout lives there). */
export function openPaymentPage(url: string) {
  if (url) window.location.assign(url);
}

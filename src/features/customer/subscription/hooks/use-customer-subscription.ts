'use client';

/**
 * The subscription payload (GET /v1/customer/subscription/index) is shared by
 * the subscription, packages, profile, pay and auto-pay screens under one
 * query key — the hooks live in the customer shared module.
 */
export {
  useCustomerSubscription,
  useRenewSubscription,
  openPaymentPage,
} from '@/features/customer/shared/hooks/use-customer-account';

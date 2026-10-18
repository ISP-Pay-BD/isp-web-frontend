'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';
import { customerKeys, useCustomerSubscription } from '@/features/customer/shared/hooks/use-customer-account';

/** The package catalogue comes from the shared subscription payload. */
export const useCustomerPackages = useCustomerSubscription;

/**
 * POST /v1/customer/subscription/activate-package — queues the change behind
 * a pending invoice and returns the payment page to settle it.
 */
export function useActivatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (packageId: string) => customerService.activatePackage(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.subscription });
      queryClient.invalidateQueries({ queryKey: customerKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: customerKeys.payments });
    },
  });
}

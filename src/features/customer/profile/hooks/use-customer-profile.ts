'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService, type UpdateProfilePayload } from '@/lib/api/services/customer.service';
import { customerKeys, useCustomerSubscription } from '@/features/customer/shared/hooks/use-customer-account';

/** The profile reads the users row from the shared subscription payload (no router round-trip). */
export const useCustomerProfile = useCustomerSubscription;

/** POST /v1/customer/profile/update — `{name, mobile, email, address}`, user from the JWT. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: (payload: UpdateProfilePayload) => customerService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.subscription });
      queryClient.invalidateQueries({ queryKey: customerKeys.dashboard });
    },
  });
}

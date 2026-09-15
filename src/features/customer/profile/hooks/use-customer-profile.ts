'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';
import type { UpdateProfilePayload } from '@/types/customer';

export function useCustomerProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customer', 'profile'],
    queryFn: () => customerService.getProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => customerService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
    },
  });

  return {
    ...query,
    updateProfileMutation,
  };
}

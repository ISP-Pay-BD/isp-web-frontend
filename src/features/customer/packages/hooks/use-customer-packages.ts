'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';
import { toast } from 'sonner';

export function useCustomerPackages() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customer', 'packages'],
    queryFn: () => customerService.getPackages(),
  });

  /**
   * POST /v1/customer/subscription/activate-package — switches the customer's
   * package (backend validates access + package ownership).
   */
  const activateMutation = useMutation({
    mutationFn: (packageId: string | number) => customerService.activatePackage(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'packages'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
      toast.success('Package activation request submitted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to activate package'),
  });

  return {
    ...query,
    activateMutation,
  };
}

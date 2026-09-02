'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { mockFetch } from '@/lib/mock-api/client';
import type { ProfileUpdateFormValues } from '../schemas/profile.schema';

export function useEmployeeProfile() {
  return useQuery({
    queryKey: ['employee', 'profile'],
    queryFn: () => mockFetch('employee.profile.get'),
  });
}

export function useUpdateEmployeeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdateFormValues) => mockFetch('employee.profile.update', payload),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['employee', 'profile'] });
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.');
    },
  });
}

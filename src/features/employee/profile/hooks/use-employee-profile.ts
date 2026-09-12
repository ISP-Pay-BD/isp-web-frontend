'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeeService } from '@/lib/api/services/employee.service';
import type { ProfileUpdateFormValues } from '../schemas/profile.schema';

export function useEmployeeProfile() {
  return useQuery({
    queryKey: ['employee', 'profile'],
    queryFn: () => employeeService.getProfile(),
  });
}

export function useUpdateEmployeeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdateFormValues) => employeeService.updateProfile(payload),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['employee', 'profile'] });
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.');
    },
  });
}

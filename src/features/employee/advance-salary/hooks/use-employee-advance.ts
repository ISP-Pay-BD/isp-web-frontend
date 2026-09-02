'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { mockFetch } from '@/lib/mock-api/client';
import type { AdvanceRequestFormValues } from '../schemas/advance-request.schema';

export function useEmployeeAdvanceRequests() {
  return useQuery({
    queryKey: ['employee', 'advance'],
    queryFn: () => mockFetch('employee.advance.list'),
  });
}

export function useRequestAdvanceSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdvanceRequestFormValues) => mockFetch('employee.advance.request', payload),
    onSuccess: () => {
      toast.success('Advance salary request submitted');
      queryClient.invalidateQueries({ queryKey: ['employee', 'advance'] });
    },
    onError: () => {
      toast.error('Failed to submit request. Please try again.');
    },
  });
}

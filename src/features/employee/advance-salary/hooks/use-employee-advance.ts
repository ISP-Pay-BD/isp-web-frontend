'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeeService } from '@/lib/api/services/employee.service';
import type { AdvanceRequestFormValues } from '../schemas/advance-request.schema';

export function useEmployeeAdvanceRequests() {
  return useQuery({
    queryKey: ['employee', 'advance'],
    queryFn: () => employeeService.getAdvanceRequests(),
  });
}

export function useRequestAdvanceSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdvanceRequestFormValues) => employeeService.requestAdvanceSalary(payload),
    onSuccess: () => {
      toast.success('Advance salary request submitted');
      queryClient.invalidateQueries({ queryKey: ['employee', 'advance'] });
    },
    onError: () => {
      toast.error('Failed to submit request. Please try again.');
    },
  });
}

'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeeService } from '@/lib/api/services/employee.service';
import { employeeKeys } from '@/features/employee/shared/keys';
import { mapAdvance } from '@/features/employee/shared/lib/mappers';
import type { AdvanceRequestFormValues } from '../schemas/advance-request.schema';

export function useEmployeeAdvanceRequests(page: number, perPage: number, status: string) {
  return useQuery({
    queryKey: [...employeeKeys.advances, { page, perPage, status }],
    queryFn: async () => {
      const res = await employeeService.advances({
        page,
        per_page: perPage,
        status: status !== 'all' ? status : undefined,
      });
      return { items: res.items.map(mapAdvance), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

export function useRequestAdvanceSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdvanceRequestFormValues) =>
      employeeService.requestAdvance({ amount: payload.amount, reason: payload.reason.trim() }),
    onSuccess: () => {
      toast.success('Advance salary request submitted');
      queryClient.invalidateQueries({ queryKey: employeeKeys.advances });
      queryClient.invalidateQueries({ queryKey: employeeKeys.summary });
    },
  });
}

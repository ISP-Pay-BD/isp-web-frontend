'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { employeeService } from '@/lib/api/services/employee.service';
import { employeeKeys } from '@/features/employee/shared/keys';
import { mapSalary } from '@/features/employee/shared/lib/mappers';

/** My salary payments, paged on the server. */
export function useEmployeeSalaries(page: number, perPage: number) {
  return useQuery({
    queryKey: [...employeeKeys.salaries, { page, perPage }],
    queryFn: async () => {
      const res = await employeeService.salaries({ page, per_page: perPage });
      return { items: res.items.map(mapSalary), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

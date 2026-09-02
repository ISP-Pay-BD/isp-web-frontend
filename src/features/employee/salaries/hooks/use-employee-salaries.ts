'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export function useEmployeeSalaries() {
  return useQuery({
    queryKey: ['employee', 'salaries'],
    queryFn: () => mockFetch('employee.salaries.list'),
  });
}

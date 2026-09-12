'use client';

import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/lib/api/services/employee.service';

export function useEmployeeSalaries() {
  return useQuery({
    queryKey: ['employee', 'salaries'],
    queryFn: () => employeeService.getSalaries(),
  });
}

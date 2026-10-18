'use client';

import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/lib/api/services/employee.service';
import { employeeKeys } from '../keys';
import { mapSummary } from '../lib/mappers';

/** My dashboard figures: today's attendance, last GPS fix, salary + advance totals. */
export function useEmployeeSummary() {
  return useQuery({
    queryKey: employeeKeys.summary,
    queryFn: async () => mapSummary(await employeeService.summary()),
  });
}

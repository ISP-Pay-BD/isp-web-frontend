'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { hrService } from '@/lib/api/services/employee.service';
import { hrKeys } from '../../shared/keys';
import { mapActivity } from './mappers';

/** `/v1/employees/{id}/activity` — profile + recent attendance, GPS track (optionally one day) and advances. */
export function useEmployeeActivity(employeeId: string, date: string) {
  return useQuery({
    queryKey: [...hrKeys.employee(employeeId), 'activity', date],
    queryFn: async () => mapActivity(await hrService.getEmployeeActivity(employeeId, date || undefined)),
    placeholderData: keepPreviousData,
    enabled: !!employeeId,
  });
}

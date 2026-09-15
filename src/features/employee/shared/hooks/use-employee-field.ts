'use client';

import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/lib/api/services/employee.service';
import type { GpsPunch, FieldJob } from '@/data/employee/salaries.data';

export function useEmployeeFieldOps() {
  return useQuery({
    queryKey: ['employee', 'domain', 'field'],
    queryFn: async () => {
      const attRes = await employeeService.getAttendanceHistory();
      const rawPunches = Array.isArray(attRes) ? (attRes as GpsPunch[]) : [];

      return {
        punches: rawPunches,
        jobs: [] as FieldJob[],
      };
    },
  });
}

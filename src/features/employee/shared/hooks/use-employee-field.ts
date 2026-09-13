'use client';

import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/lib/api/services/employee.service';
import { mockFetch } from '@/lib/mock-api/client';
import type { GpsPunch, FieldJob } from '@/data/employee/salaries.data';

export function useEmployeeFieldOps() {
  return useQuery({
    queryKey: ['employee', 'domain', 'field'],
    queryFn: async () => {
      try {
        const attRes = await employeeService.getAttendanceHistory();
        const rawPunches = Array.isArray(attRes) ? (attRes as GpsPunch[]) : [];

        const res = (await mockFetch('employee.domain')) as {
          gpsPunches: GpsPunch[];
          fieldJobs: FieldJob[];
        };

        return {
          punches: rawPunches.length > 0 ? rawPunches : (res.gpsPunches ?? []),
          jobs: res.fieldJobs ?? [],
        };
      } catch {
        const res = (await mockFetch('employee.domain')) as {
          gpsPunches: GpsPunch[];
          fieldJobs: FieldJob[];
        };
        return {
          punches: res.gpsPunches ?? [],
          jobs: res.fieldJobs ?? [],
        };
      }
    },
  });
}


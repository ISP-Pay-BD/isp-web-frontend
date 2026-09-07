'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { GpsPunch, FieldJob } from '@/data/employee/salaries.data';

export function useEmployeeFieldOps() {
  return useQuery({
    queryKey: ['employee', 'domain', 'field'],
    queryFn: async () => {
      const res = (await mockFetch('employee.domain')) as {
        gpsPunches: GpsPunch[];
        fieldJobs: FieldJob[];
      };
      return {
        punches: res.gpsPunches ?? [],
        jobs: res.fieldJobs ?? [],
      };
    },
  });
}

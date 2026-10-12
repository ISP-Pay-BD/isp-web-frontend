'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/lib/api/services/employee.service';
import { employeeKeys } from '@/features/employee/shared/keys';
import { mapJob, mapJobStats } from '@/features/employee/shared/lib/mappers';
import type { JobStatus } from '@/features/employee/shared/types';

/** Support tickets assigned to me, with desk stats (`/v1/employee-portal/jobs`). */
export function useEmployeeJobs(page: number, perPage: number, status: string) {
  return useQuery({
    queryKey: [...employeeKeys.jobs, { page, perPage, status }],
    queryFn: async () => {
      const res = await employeeService.jobs({
        page,
        per_page: perPage,
        status: status !== 'all' ? status : undefined,
      });
      return { items: res.items.map(mapJob), meta: res.meta, stats: mapJobStats(res.raw) };
    },
    placeholderData: keepPreviousData,
  });
}

export function useUpdateJobStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) => employeeService.updateJobStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeKeys.jobs }),
  });
}

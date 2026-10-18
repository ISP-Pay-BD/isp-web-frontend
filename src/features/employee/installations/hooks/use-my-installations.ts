'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeService, type Coordinates } from '@/lib/api/services/employee.service';
import { employeeKeys } from '@/features/employee/shared/keys';
import { mapInstallation } from '@/features/employee/shared/lib/mappers';

/** Installation work orders assigned to me (`/v1/employee-portal/installations`). */
export function useMyInstallations(page: number, perPage: number, status: string) {
  return useQuery({
    queryKey: [...employeeKeys.installations, { page, perPage, status }],
    queryFn: async () => {
      const res = await employeeService.installations({
        page,
        per_page: perPage,
        status: status !== 'all' ? status : undefined,
      });
      return { items: res.items.map(mapInstallation), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** Start a job / complete it with the device GPS fix. */
export function useInstallationActions() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: employeeKeys.installations });
    qc.invalidateQueries({ queryKey: employeeKeys.summary });
  };

  const start = useMutation({
    mutationFn: ({ id, coords }: { id: string; coords?: Coordinates }) => employeeService.startInstallation(id, coords),
    onSuccess: refresh,
  });
  const complete = useMutation({
    mutationFn: ({ id, coords, notes }: { id: string; coords: Coordinates; notes?: string }) =>
      employeeService.completeInstallation(id, { ...coords, notes: notes?.trim() || undefined }),
    onSuccess: refresh,
  });

  return { start, complete };
}

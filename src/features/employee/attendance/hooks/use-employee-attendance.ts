'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeService, type Coordinates } from '@/lib/api/services/employee.service';
import { employeeKeys } from '@/features/employee/shared/keys';
import { mapAttendanceRow } from '@/features/employee/shared/lib/mappers';

/** My attendance history (`/v1/employee-portal/attendance`), newest first. */
export function useEmployeeAttendance(page: number, perPage: number) {
  return useQuery({
    queryKey: [...employeeKeys.attendance, { page, perPage }],
    queryFn: async () => {
      const res = await employeeService.attendance({ page, per_page: perPage });
      return { items: res.items.map(mapAttendanceRow), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** Check in / out with the device GPS fix (logged to my location track). */
export function usePunch() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: employeeKeys.attendance });
    qc.invalidateQueries({ queryKey: employeeKeys.summary });
  };

  const checkIn = useMutation({
    mutationFn: (coords?: Coordinates) => employeeService.checkIn(coords),
    onSuccess: refresh,
  });
  const checkOut = useMutation({
    mutationFn: (coords?: Coordinates) => employeeService.checkOut(coords),
    onSuccess: refresh,
  });

  return { checkIn, checkOut };
}

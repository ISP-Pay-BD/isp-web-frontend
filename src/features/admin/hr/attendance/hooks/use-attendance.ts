import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { mockFetch } from '@/lib/mock-api/client';
import type { AttendanceItem } from '../types';

import { mockDelay } from '@/lib/mock-api/delay';

export function useAttendance() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'hr', 'attendance'],
    queryFn: async () => {
      try {
        const [attRes, empRes] = await Promise.allSettled([
          adminService.getAttendanceLogs(),
          adminService.getEmployees(),
        ]);

        const rawRecords = attRes.status === 'fulfilled' && Array.isArray(attRes.value) ? (attRes.value as AttendanceItem[]) : [];
        const rawEmps = empRes.status === 'fulfilled' && empRes.value && typeof empRes.value === 'object' && 'employees' in empRes.value && Array.isArray(empRes.value.employees)
          ? (empRes.value.employees as { id: string; name: string }[])
          : [];

        if (rawRecords.length > 0) {
          return {
            records: rawRecords,
            employees: rawEmps,
          };
        }

        const data = await mockFetch('admin.domain', 'hr');
        const hrData = data as { attendanceRecords: AttendanceItem[]; employees: { id: string; name: string }[] };
        return {
          records: hrData.attendanceRecords ?? [],
          employees: rawEmps.length > 0 ? rawEmps : (hrData.employees ?? []),
        };
      } catch {
        const data = await mockFetch('admin.domain', 'hr');
        const hrData = data as { attendanceRecords: AttendanceItem[]; employees: { id: string; name: string }[] };
        return {
          records: hrData.attendanceRecords ?? [],
          employees: hrData.employees ?? [],
        };
      }
    },
  });


  const updateMutation = useMutation({
    mutationFn: async ({ id, status, checkIn, checkOut }: { id: string; status: AttendanceItem['status']; checkIn: string; checkOut?: string }) => {
      await mockDelay(30);
      return { id, status, checkIn, checkOut };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<{ records: AttendanceItem[]; employees: { id: string; name: string }[] }>(
        ['admin', 'hr', 'attendance'],
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            records: prev.records.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)),
          };
        },
      );
    },
  });

  return {
    ...query,
    records: query.data?.records ?? [],
    employees: query.data?.employees ?? [],
    updateAttendance: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

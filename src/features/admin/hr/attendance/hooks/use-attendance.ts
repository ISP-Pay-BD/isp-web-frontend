import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { AttendanceItem } from '../types';

export function useAttendance() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'hr', 'attendance'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'hr');
      const hrData = data as { attendanceRecords: AttendanceItem[]; employees: { id: string; name: string }[] };
      return {
        records: hrData.attendanceRecords ?? [],
        employees: hrData.employees ?? [],
      };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, checkIn, checkOut }: { id: string; status: AttendanceItem['status']; checkIn: string; checkOut?: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
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

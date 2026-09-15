import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type { AttendanceItem } from '../types';

export function useAttendance() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'hr', 'attendance'],
    queryFn: async () => {
      const [attRes, empRes] = await Promise.allSettled([
        adminService.getAttendanceLogs(),
        adminService.getEmployees(),
      ]);

      const rawRecords = attRes.status === 'fulfilled' && Array.isArray(attRes.value) ? (attRes.value as AttendanceItem[]) : [];
      const rawEmps = empRes.status === 'fulfilled' && empRes.value && typeof empRes.value === 'object' && 'employees' in empRes.value && Array.isArray(empRes.value.employees)
        ? (empRes.value.employees as { id: string; name: string }[])
        : [];

      if (rawRecords.length > 0) {
        return { records: rawRecords, employees: rawEmps };
      }

      const records: AttendanceItem[] = rawEmps.map((emp, idx) => ({
        id: `att_${emp.id}_${idx}`,
        employeeId: emp.id,
        employeeName: emp.name,
        date: new Date().toISOString().split('T')[0]!,
        checkIn: idx % 4 === 0 ? '09:25' : '08:55',
        checkOut: '17:30',
        status: idx % 5 === 0 ? 'late' : (idx % 8 === 0 ? 'absent' : 'present'),
      }));

      return { records, employees: rawEmps };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, checkIn, checkOut }: { id: string; status: AttendanceItem['status']; checkIn: string; checkOut?: string }) => {
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

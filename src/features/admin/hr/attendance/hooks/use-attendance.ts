'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hrService, type RawRow } from '@/lib/api/services/employee.service';
import { num, str } from '@/lib/api/case';
import { hrKeys } from '../../shared/keys';
import type { AttendanceFilters, AttendanceItem, AttendanceStatus, AttendanceSummary, AttendanceUpdate } from '../types';

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'late'];

export function mapAttendance(r: RawRow): AttendanceItem {
  const status = str(r.status).toLowerCase() as AttendanceStatus;
  return {
    id: str(r.id),
    employeeId: str(r.employee_id),
    employeeName: str(r.employee_name),
    employeeDesignation: str(r.employee_designation),
    date: str(r.date),
    checkIn: str(r.check_in),
    checkOut: str(r.check_out),
    status: STATUSES.includes(status) ? status : 'present',
    notes: str(r.notes),
  };
}

function filterParams(f: Omit<AttendanceFilters, 'page' | 'perPage' | 'search'>) {
  return {
    employee_id: f.employeeId !== 'all' ? f.employeeId : undefined,
    date_from: f.dateFrom || undefined,
    date_to: f.dateTo || undefined,
  };
}

/** Paged tenant attendance (`/v1/employees/attendance`) with server-side filters. */
export function useAttendance(filters: AttendanceFilters) {
  return useQuery({
    queryKey: [...hrKeys.attendance, 'list', filters],
    queryFn: async () => {
      const res = await hrService.listAttendance({
        ...filterParams(filters),
        page: filters.page,
        per_page: filters.perPage,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      });
      return { items: res.items.map(mapAttendance), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** Present / late / absent counts for the same window (`/v1/hr/attendance/summary`). */
export function useAttendanceSummary(filters: Pick<AttendanceFilters, 'employeeId' | 'dateFrom' | 'dateTo' | 'status'>) {
  const key = { employeeId: filters.employeeId, dateFrom: filters.dateFrom, dateTo: filters.dateTo };
  return useQuery({
    queryKey: [...hrKeys.attendance, 'summary', key],
    queryFn: async (): Promise<AttendanceSummary> => {
      const r = await hrService.attendanceSummary(filterParams(filters));
      return { total: num(r.total), present: num(r.present), late: num(r.late), absent: num(r.absent) };
    },
    placeholderData: keepPreviousData,
  });
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, checkIn, checkOut, notes }: AttendanceUpdate) =>
      hrService.updateAttendance(id, {
        status,
        check_in: checkIn || undefined,
        check_out: checkOut || undefined,
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.attendance });
      qc.invalidateQueries({ queryKey: ['admin', 'hr', 'employee'] });
    },
  });
}

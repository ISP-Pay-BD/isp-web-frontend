'use client';

import { useQuery } from '@tanstack/react-query';
import { hrService, type RawRow } from '@/lib/api/services/employee.service';
import { num, str } from '@/lib/api/case';
import { hrKeys } from './keys';
import type { HrMeta } from './types';

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => str(x)) : []);
const rows = (v: unknown): RawRow[] => (Array.isArray(v) ? (v as RawRow[]) : []);

export function mapHrMeta(raw: RawRow): HrMeta {
  return {
    designations: rows(raw.designations).map((d) => ({ value: str(d.value), label: str(d.label) })),
    statuses: strings(raw.statuses),
    locationIntervals: Array.isArray(raw.location_intervals) ? raw.location_intervals.map((n) => num(n)) : [],
    attendanceStatuses: strings(raw.attendance_statuses),
    advanceStatuses: strings(raw.advance_statuses),
    paymentStatuses: strings(raw.payment_statuses),
    paidVia: strings(raw.paid_via),
    months: strings(raw.months),
    areas: rows(raw.areas).map((a) => ({ id: str(a.id), name: str(a.name) })),
    employees: rows(raw.employees).map((e) => ({
      id: str(e.id),
      name: str(e.name),
      designation: str(e.designation),
      designationLabel: str(e.designation_label),
      salary: e.salary === null || e.salary === undefined ? null : num(e.salary),
      status: str(e.status),
      mobile: str(e.mobile),
    })),
  };
}

/** One cached query for every HR select (designations, areas, employee picker, payroll enums). */
export function useHrMeta() {
  return useQuery({
    queryKey: hrKeys.meta,
    queryFn: async () => mapHrMeta(await hrService.meta()),
    staleTime: 5 * 60_000,
  });
}

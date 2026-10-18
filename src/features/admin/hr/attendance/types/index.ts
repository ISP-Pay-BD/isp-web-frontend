export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDesignation: string;
  date: string;
  /** Backend datetime `YYYY-MM-DD HH:MM:SS` or '' */
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  notes: string;
}

export interface AttendanceFilters {
  page: number;
  perPage: number;
  search: string;
  employeeId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  late: number;
  absent: number;
}

export interface AttendanceUpdate {
  id: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  notes: string;
}

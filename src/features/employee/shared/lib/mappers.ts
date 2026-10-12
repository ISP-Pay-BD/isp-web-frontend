import { num, str } from '@/lib/api/case';
import type { RawRow } from '@/lib/api/services/employee.service';
import type {
  AdvanceStatus,
  EmployeeAdvanceRequest,
  EmployeeAttendanceRow,
  EmployeeInstallation,
  EmployeeJob,
  EmployeeProfile,
  EmployeeSalary,
  EmployeeSummary,
  InstallationStatus,
  JobStats,
  JobStatus,
  SalaryStatus,
} from '../types';

const optNum = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : num(v));
const flag = (v: unknown): boolean => v === true || v === 1 || v === '1' || v === 'true';
const oneOf = <T extends string>(value: string, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

export function mapSalary(r: RawRow): EmployeeSalary {
  return {
    id: str(r.id),
    invoice: str(r.invoice),
    month: str(r.month),
    year: optNum(r.year),
    netAmount: num(r.net_amount ?? r.amount),
    advanceDeducted: num(r.advance_deducted),
    grossSalary: num(r.gross_salary ?? r.amount),
    status: oneOf<SalaryStatus>(str(r.status), ['successful', 'pending', 'failed'], 'pending'),
    paidVia: str(r.paid_via),
    paidAt: str(r.paid_at),
    createdAt: str(r.created_at),
  };
}

export function mapAdvance(r: RawRow): EmployeeAdvanceRequest {
  return {
    id: str(r.id),
    amount: num(r.amount),
    reason: str(r.reason),
    status: oneOf<AdvanceStatus>(str(r.status), ['pending', 'approved', 'rejected', 'deducted'], 'pending'),
    requestedAt: str(r.created_at),
    approvedAt: str(r.approved_at),
    deductMonth: str(r.deduct_month),
    rejectionReason: str(r.rejection_reason),
  };
}

export function mapProfile(r: RawRow): EmployeeProfile {
  return {
    id: str(r.id),
    name: str(r.name),
    email: str(r.email),
    mobile: str(r.mobile),
    address: str(r.address),
    designationLabel: str(r.designation_label),
    status: str(r.status),
    salary: optNum(r.salary),
    areaNames: Array.isArray(r.area_names) ? r.area_names.map((a) => str(a)) : [],
    employerName: str(r.employer_name),
    joinedAt: str(r.joined_at),
    nidNumber: str(r.nid_number),
    locationRequired: flag(r.location_required),
    locationInterval: num(r.location_interval),
  };
}

export function mapSummary(r: RawRow): EmployeeSummary {
  const today = (r.today_attendance ?? null) as RawRow | null;
  const last = (r.last_location ?? null) as RawRow | null;
  const lat = last ? optNum(last.latitude) : null;
  const lng = last ? optNum(last.longitude) : null;
  return {
    employeeName: str(r.employee_name),
    checkedInToday: flag(r.checked_in_today),
    checkedOutToday: flag(r.checked_out_today),
    todayCheckIn: today ? str(today.check_in) : '',
    todayCheckOut: today ? str(today.check_out) : '',
    lastLocation:
      last && lat !== null && lng !== null
        ? { latitude: lat, longitude: lng, address: str(last.address), createdAt: str(last.created_at) }
        : null,
    salaryReceived: num(r.salary_received),
    salaryPending: num(r.salary_pending),
    advancePendingCount: num(r.advance_salary_pending_count),
    advanceApprovedTotal: num(r.advance_salary_approved_total),
  };
}

export function mapAttendanceRow(r: RawRow): EmployeeAttendanceRow {
  return {
    id: str(r.id),
    date: str(r.date),
    checkIn: str(r.check_in),
    checkOut: str(r.check_out),
    status: str(r.status),
    notes: str(r.notes),
  };
}

export function mapJob(r: RawRow): EmployeeJob {
  return {
    id: str(r.id),
    subject: str(r.subject),
    category: str(r.category),
    priority: str(r.priority),
    status: oneOf<JobStatus>(str(r.status), ['opened', 'processing', 'closed'], 'opened'),
    customerName: str(r.user_name) === '--' ? '' : str(r.user_name),
    datetime: str(r.datetime),
    remarks: str(r.remarks),
  };
}

export function mapJobStats(raw: RawRow): JobStats {
  const s = (raw.stats ?? {}) as RawRow;
  return { total: num(s.total), opened: num(s.opened), processing: num(s.processing), closed: num(s.closed) };
}

export function mapInstallation(r: RawRow): EmployeeInstallation {
  return {
    id: str(r.id),
    title: str(r.title),
    address: str(r.address),
    latitude: optNum(r.latitude),
    longitude: optNum(r.longitude),
    status: oneOf<InstallationStatus>(
      str(r.status),
      ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
      'pending',
    ),
    scheduledAt: str(r.scheduled_at),
    startedAt: str(r.started_at),
    completedAt: str(r.completed_at),
    notes: str(r.notes),
    completionNotes: str(r.completion_notes),
    customerName: str(r.customer_name),
    customerMobile: str(r.customer_mobile),
  };
}

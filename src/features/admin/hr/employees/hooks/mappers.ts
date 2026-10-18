import { num, str } from '@/lib/api/case';
import type { RawRow } from '@/lib/api/services/employee.service';
import { titleCase } from '../../shared/format';
import type {
  AdvanceLog,
  AttendanceLog,
  CustomerOption,
  EmployeeActivity,
  EmployeeItem,
  EmployeeSummary,
  InstallationItem,
  InstallationStatus,
  LocationPing,
} from '../types';

const rows = (v: unknown): RawRow[] => (Array.isArray(v) ? (v as RawRow[]) : []);
const optNum = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : num(v));
const flag = (v: unknown): boolean => v === true || v === 1 || v === '1' || v === 'true';

export function mapEmployee(r: RawRow): EmployeeItem {
  const designation = str(r.designation);
  const areaIds = Array.isArray(r.area_ids)
    ? r.area_ids.map((x) => str(x))
    : str(r.area_id)
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
  return {
    id: str(r.id),
    name: str(r.name),
    mobile: str(r.mobile),
    email: str(r.email),
    address: str(r.address),
    designation,
    designationLabel: designation ? titleCase(designation) : '',
    salary: optNum(r.salary),
    status: str(r.status) === 'active' ? 'active' : 'inactive',
    areaIds,
    areaLabel: str(r.area_label),
    nidNumber: str(r.nid_number),
    nidVerified: flag(r.nid_verified),
    otherInfo: str(r.other_info),
    locationRequired: flag(r.location_required),
    locationInterval: optNum(r.location_interval),
    joinedAt: str(r.created_at),
    lastLocationUpdate: str(r.last_location_update),
  };
}

export function mapEmployeeSummary(r: RawRow): EmployeeSummary {
  return {
    total: num(r.total),
    active: num(r.active),
    inactive: num(r.inactive),
    activePayroll: num(r.active_payroll),
    designationCount: num(r.designation_count),
  };
}

function mapAttendanceLog(r: RawRow): AttendanceLog {
  return {
    id: str(r.id),
    date: str(r.date),
    checkIn: str(r.check_in),
    checkOut: str(r.check_out),
    status: str(r.status),
    notes: str(r.notes),
  };
}

function mapPing(r: RawRow): LocationPing | null {
  const lat = optNum(r.latitude);
  const lng = optNum(r.longitude);
  if (lat === null || lng === null) return null;
  return { id: str(r.id), latitude: lat, longitude: lng, address: str(r.address), createdAt: str(r.created_at) };
}

function mapAdvanceLog(r: RawRow): AdvanceLog {
  return {
    id: str(r.id),
    amount: num(r.amount),
    reason: str(r.reason),
    status: str(r.status),
    createdAt: str(r.created_at),
    deductMonth: str(r.deduct_month),
  };
}

export function mapActivity(r: RawRow): EmployeeActivity {
  const summary = (r.summary ?? {}) as RawRow;
  return {
    employee: mapEmployee((r.employee ?? {}) as RawRow),
    attendanceCount: num(summary.attendance_count),
    locationCount: num(summary.location_count),
    advanceCount: num(summary.advance_count),
    locationRequired: flag(summary.location_required),
    locationInterval: num(summary.location_interval),
    lastLocationUpdate: str(summary.last_location_update),
    attendance: rows(r.attendance).map(mapAttendanceLog),
    locations: rows(r.locations)
      .map(mapPing)
      .filter((p): p is LocationPing => p !== null),
    advances: rows(r.advance_salaries).map(mapAdvanceLog),
  };
}

const INSTALL_STATUSES: InstallationStatus[] = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];

export function mapInstallation(r: RawRow): InstallationItem {
  const status = str(r.status) as InstallationStatus;
  return {
    id: str(r.id),
    title: str(r.title),
    address: str(r.address),
    latitude: optNum(r.latitude),
    longitude: optNum(r.longitude),
    status: INSTALL_STATUSES.includes(status) ? status : 'pending',
    scheduledAt: str(r.scheduled_at),
    startedAt: str(r.started_at),
    completedAt: str(r.completed_at),
    completedLatitude: optNum(r.completed_latitude),
    completedLongitude: optNum(r.completed_longitude),
    notes: str(r.notes),
    completionNotes: str(r.completion_notes),
    customerId: str(r.customer_id),
    customerName: str(r.customer_name),
    customerMobile: str(r.customer_mobile),
    assignedEmployeeId: str(r.assigned_employee_id),
    employeeName: str(r.employee_name),
    createdAt: str(r.created_at),
  };
}

export function mapCustomerOption(r: RawRow): CustomerOption {
  return { id: str(r.id), name: str(r.name), mobile: str(r.mobile), address: str(r.address) };
}

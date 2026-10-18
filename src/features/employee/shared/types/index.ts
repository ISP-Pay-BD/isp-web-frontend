export type SalaryStatus = 'successful' | 'pending' | 'failed';

/** One of my salary payments (`/v1/employee-portal/salaries`). */
export interface EmployeeSalary {
  id: string;
  invoice: string;
  month: string;
  year: number | null;
  netAmount: number;
  advanceDeducted: number;
  grossSalary: number;
  status: SalaryStatus;
  paidVia: string;
  paidAt: string;
  createdAt: string;
}

export type AdvanceStatus = 'pending' | 'approved' | 'rejected' | 'deducted';

export interface EmployeeAdvanceRequest {
  id: string;
  amount: number;
  reason: string;
  status: AdvanceStatus;
  requestedAt: string;
  approvedAt: string;
  deductMonth: string;
  rejectionReason: string;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  designationLabel: string;
  status: string;
  salary: number | null;
  areaNames: string[];
  employerName: string;
  joinedAt: string;
  nidNumber: string;
  locationRequired: boolean;
  locationInterval: number;
}

/** `/v1/employee-portal/summary` — my dashboard figures. */
export interface EmployeeSummary {
  employeeName: string;
  checkedInToday: boolean;
  checkedOutToday: boolean;
  todayCheckIn: string;
  todayCheckOut: string;
  lastLocation: { latitude: number; longitude: number; address: string; createdAt: string } | null;
  salaryReceived: number;
  salaryPending: number;
  advancePendingCount: number;
  advanceApprovedTotal: number;
}

export interface EmployeeAttendanceRow {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
}

export type JobStatus = 'opened' | 'processing' | 'closed';

/** A support ticket assigned to me (`/v1/employee-portal/jobs`). */
export interface EmployeeJob {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: JobStatus;
  customerName: string;
  datetime: string;
  remarks: string;
}

export interface JobStats {
  total: number;
  opened: number;
  processing: number;
  closed: number;
}

export type InstallationStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface EmployeeInstallation {
  id: string;
  title: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: InstallationStatus;
  scheduledAt: string;
  startedAt: string;
  completedAt: string;
  notes: string;
  completionNotes: string;
  customerName: string;
  customerMobile: string;
}

export interface EmployeeItem {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  designation: string;
  designationLabel: string;
  salary: number | null;
  status: 'active' | 'inactive';
  areaIds: string[];
  areaLabel: string;
  nidNumber: string;
  nidVerified: boolean;
  otherInfo: string;
  locationRequired: boolean;
  locationInterval: number | null;
  joinedAt: string;
  lastLocationUpdate: string;
}

export interface EmployeeSummary {
  total: number;
  active: number;
  inactive: number;
  activePayroll: number;
  designationCount: number;
}

export interface EmployeeListParams {
  page: number;
  perPage: number;
  search: string;
  designation: string;
  status: string;
  sort: 'name' | 'salary' | 'created_at';
  dir: 'asc' | 'desc';
}

export interface AttendanceLog {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
}

export interface LocationPing {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  createdAt: string;
}

export interface AdvanceLog {
  id: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
  deductMonth: string;
}

export interface EmployeeActivity {
  employee: EmployeeItem;
  attendanceCount: number;
  locationCount: number;
  advanceCount: number;
  locationRequired: boolean;
  locationInterval: number;
  lastLocationUpdate: string;
  attendance: AttendanceLog[];
  locations: LocationPing[];
  advances: AdvanceLog[];
}

export type InstallationStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface InstallationItem {
  id: string;
  title: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: InstallationStatus;
  scheduledAt: string;
  startedAt: string;
  completedAt: string;
  completedLatitude: number | null;
  completedLongitude: number | null;
  notes: string;
  completionNotes: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  assignedEmployeeId: string;
  employeeName: string;
  createdAt: string;
}

export interface CustomerOption {
  id: string;
  name: string;
  mobile: string;
  address: string;
}

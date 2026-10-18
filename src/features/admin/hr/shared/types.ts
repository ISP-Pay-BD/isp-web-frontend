export interface Option {
  value: string;
  label: string;
}

export interface EmployeeOption {
  id: string;
  name: string;
  designation: string;
  designationLabel: string;
  salary: number | null;
  status: string;
  mobile: string;
}

/** `/v1/hr/meta` — every select option the HR screens need, from the backend. */
export interface HrMeta {
  designations: Option[];
  statuses: string[];
  locationIntervals: number[];
  attendanceStatuses: string[];
  advanceStatuses: string[];
  paymentStatuses: string[];
  paidVia: string[];
  months: string[];
  areas: { id: string; name: string }[];
  employees: EmployeeOption[];
}

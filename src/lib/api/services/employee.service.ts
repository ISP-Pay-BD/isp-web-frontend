import { http } from '../client';

/**
 * HR (admin/reseller staff) + employee self-service API.
 *
 * Staff routes resolve the tenant from the JWT (`/v1/employees`, `/v1/employee-payments`,
 * `/v1/employee-accounts`, `/v1/hr/*`, `/v1/installations`). Employee routes live under
 * `/v1/employee-portal/*` and are scoped to the signed-in employee by the backend.
 * Payloads are returned raw (snake_case); each feature maps them in one place.
 */
export type RawRow = Record<string, unknown>;
type Params = Record<string, unknown>;

export interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
}

export const hrService = {
  /* ---- meta / summaries ---- */
  meta: () => http.get<RawRow>('/v1/hr/meta'),
  employeeSummary: () => http.get<RawRow>('/v1/hr/employees/summary'),
  attendanceSummary: (params?: Params) => http.get<RawRow>('/v1/hr/attendance/summary', params),
  advanceSummary: () => http.get<RawRow>('/v1/hr/advances/summary'),
  paymentSummary: (params?: Params) => http.get<RawRow>('/v1/employee-payments/summary', params),

  /* ---- employees ---- */
  listEmployees: (params: Params) => http.getPage<RawRow>('/v1/employees', params),
  getEmployeeActivity: (id: string, date?: string) =>
    http.get<RawRow>(`/v1/employees/${id}/activity`, date ? { date } : undefined),
  createEmployee: (body: RawRow) => http.post<RawRow>('/v1/employees', body),
  updateEmployee: (id: string, body: RawRow) => http.put<RawRow>(`/v1/employees/${id}`, body),
  deleteEmployee: (id: string) => http.delete<RawRow>(`/v1/employees/${id}`),

  /* ---- attendance ---- */
  listAttendance: (params: Params) => http.getPage<RawRow>('/v1/employees/attendance', params),
  updateAttendance: (id: string, body: RawRow) => http.put<RawRow>(`/v1/employees/attendance/${id}`, body),

  /* ---- advance salary ---- */
  listAdvances: (params: Params) => http.getPage<RawRow>('/v1/employees/advance-salary', params),
  grantAdvance: (body: RawRow) => http.post<RawRow>('/v1/employees/advance-salary', { ...body, grant: 1 }),
  decideAdvance: (id: string, body: RawRow) => http.put<RawRow>(`/v1/employees/advance-salary/${id}`, body),
  deductAdvance: (id: string) => http.post<RawRow>(`/v1/employees/advance-salary/${id}/deduct`),

  /* ---- salary payments / accounts ---- */
  listPayments: (params: Params) => http.getPage<RawRow>('/v1/employee-payments', params),
  salaryBreakdown: (employeeId: string, month: string, year: number) =>
    http.get<RawRow>(`/v1/employee-payments/salary-summary/${employeeId}/${encodeURIComponent(month)}`, { year }),
  createPayment: (body: RawRow) => http.post<RawRow>('/v1/employee-payments', body),
  listAccounts: (params: Params) => http.getPage<RawRow>('/v1/employee-accounts', params),

  /* ---- installation work orders ---- */
  listInstallations: (params: Params) => http.getPage<RawRow>('/v1/installations', params),
  createInstallation: (body: RawRow) => http.post<RawRow>('/v1/installations', body),
  updateInstallation: (id: string, body: RawRow) => http.put<RawRow>(`/v1/installations/${id}`, body),
  searchInstallationCustomers: (search: string) =>
    http.get<RawRow[]>('/v1/installations/customers', search ? { search } : undefined),
};

export const employeeService = {
  summary: () => http.get<RawRow>('/v1/employee-portal/summary'),
  profile: () => http.get<RawRow>('/v1/employee-portal/profile'),
  /** Self profile write (name / email / mobile / address) — target is the JWT subject. */
  updateProfile: (body: RawRow) => http.patch<RawRow>('/v1/users/me', body),

  salaries: (params: Params) => http.getPage<RawRow>('/v1/employee-portal/salaries', params),
  advances: (params: Params) => http.getPage<RawRow>('/v1/employee-portal/advances', params),
  requestAdvance: (body: { amount: number; reason: string }) =>
    http.post<RawRow>('/v1/employee-portal/advances', body),

  attendance: (params: Params) => http.getPage<RawRow>('/v1/employee-portal/attendance', params),
  checkIn: (coords?: Coordinates) => http.post<RawRow>('/v1/employee-portal/attendance/check-in', coords ?? {}),
  checkOut: (coords?: Coordinates) => http.post<RawRow>('/v1/employee-portal/attendance/check-out', coords ?? {}),

  /** Support tickets assigned to the signed-in employee (`data: { items, stats }`). */
  jobs: (params: Params) => http.getPage<RawRow>('/v1/employee-portal/jobs', params, { listKey: 'items' }),
  updateJobStatus: (id: string, status: string) =>
    http.post<RawRow>(`/v1/employee-portal/jobs/${id}/status`, { status }),

  installations: (params: Params) => http.getPage<RawRow>('/v1/employee-portal/installations', params),
  startInstallation: (id: string, coords?: Coordinates) =>
    http.post<RawRow>(`/v1/employee-portal/installations/${id}/start`, coords ?? {}),
  completeInstallation: (id: string, body: Coordinates & { notes?: string }) =>
    http.post<RawRow>(`/v1/employee-portal/installations/${id}/complete`, body),
};

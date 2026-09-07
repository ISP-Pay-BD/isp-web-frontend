export { employees, salaryPayments, advanceSalaryRequests } from '../admin/hr.data';

export const employeeProfile = {
  id: 'emp_001',
  name: 'Staff Member',
  phone: '01710000005',
  email: 'employee@demo.isppaybd.com',
  role: 'Support Agent',
  department: 'Customer Support',
  joinedAt: '2024-03-01',
  manager: 'Admin Demo',
};

export const employeeSalaries = [
  { id: 'sal_self_1', month: '2026-08', amountBdt: 18000, paidAt: '2026-08-30', status: 'paid' as const, breakdown: { basic: 15000, allowance: 2000, deduction: 1000 } },
  { id: 'sal_self_2', month: '2026-07', amountBdt: 18000, paidAt: '2026-07-30', status: 'paid' as const, breakdown: { basic: 15000, allowance: 2000, deduction: 1000 } },
  { id: 'sal_self_3', month: '2026-06', amountBdt: 17500, paidAt: '2026-06-30', status: 'paid' as const, breakdown: { basic: 15000, allowance: 1500, deduction: 1000 } },
];

export const employeeAdvanceRequests = [
  { id: 'adv_1', amountBdt: 5000, reason: 'Medical emergency', status: 'approved' as const, requestedAt: '2026-08-15', approvedAt: '2026-08-16' },
  { id: 'adv_2', amountBdt: 3000, reason: 'Family expense', status: 'pending' as const, requestedAt: '2026-09-01' },
];

export const employeeAttendance = [
  { date: '2026-09-02', checkIn: '09:05', checkOut: '18:10', status: 'present' as const },
  { date: '2026-09-01', checkIn: '09:00', checkOut: '18:00', status: 'present' as const },
  { date: '2026-08-31', checkIn: '09:15', checkOut: '18:05', status: 'late' as const },
];

export interface GpsPunch {
  id: string;
  at: string;
  type: 'in' | 'out';
  lat: number;
  lng: number;
  area: string;
  accuracyM: number;
}

export interface FieldJob {
  id: string;
  title: string;
  customerName: string;
  area: string;
  status: 'open' | 'in_progress' | 'done';
  dueLabel: string;
  priority: 'normal' | 'high';
}

export const gpsPunches: GpsPunch[] = [
  {
    id: 'gp_1',
    at: '2026-09-07 09:02',
    type: 'in',
    lat: 23.7925,
    lng: 90.4078,
    area: 'Banani',
    accuracyM: 12,
  },
  {
    id: 'gp_2',
    at: '2026-09-07 13:10',
    type: 'out',
    lat: 23.8103,
    lng: 90.4125,
    area: 'Gulshan',
    accuracyM: 18,
  },
  {
    id: 'gp_3',
    at: '2026-09-06 09:05',
    type: 'in',
    lat: 23.7925,
    lng: 90.4078,
    area: 'Banani',
    accuracyM: 9,
  },
];

export const fieldJobs: FieldJob[] = [
  {
    id: 'job_01',
    title: 'New install — Banani Road 11',
    customerName: 'Rahim Uddin',
    area: 'Banani',
    status: 'open',
    dueLabel: 'Today · 16:00',
    priority: 'high',
  },
  {
    id: 'job_02',
    title: 'LOS repair — ONU power',
    customerName: 'Sajjad Hossain',
    area: 'Mirpur-10',
    status: 'in_progress',
    dueLabel: 'Today · 14:00',
    priority: 'high',
  },
  {
    id: 'job_03',
    title: 'Cable tidy — POP check',
    customerName: 'POP Mirpur',
    area: 'Mirpur',
    status: 'open',
    dueLabel: 'Tomorrow',
    priority: 'normal',
  },
];

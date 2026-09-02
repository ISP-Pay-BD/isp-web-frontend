import type { Employee } from '../shared/types';
import { pick, BD_FIRST_NAMES, BD_LAST_NAMES, bdPhone, isoDate } from '../shared/generators';

const roles = ['Support Agent', 'Field Technician', 'Accountant', 'Network Engineer', 'Sales Executive', 'Office Admin'];

export const employees: Employee[] = Array.from({ length: 12 }, (_, i) => ({
  id: `emp_${String(i + 1).padStart(3, '0')}`,
  name: `${pick(BD_FIRST_NAMES, i + 5)} ${pick(BD_LAST_NAMES, i)}`,
  phone: bdPhone(2000 + i),
  role: pick(roles, i),
  salaryBdt: [15000, 18000, 22000, 25000, 28000, 35000][i % 6]!,
  joinedAt: isoDate(2023 + (i % 3), (i % 12) + 1, 1),
  status: i === 11 ? 'inactive' : 'active',
}));

export const salaryPayments = employees.filter((e) => e.status === 'active').flatMap((e, i) =>
  ['2026-08', '2026-07'].map((month, mi) => ({
    id: `sal_${e.id}_${month}`,
    employeeId: e.id,
    employeeName: e.name,
    amountBdt: e.salaryBdt,
    month,
    paidAt: `${month}-${mi === 0 ? '30' : '30'}`,
    status: 'paid' as const,
  })),
);

export const attendanceRecords = employees.slice(0, 8).flatMap((e, i) =>
  Array.from({ length: 5 }, (_, d) => ({
    id: `att_${e.id}_${d}`,
    employeeId: e.id,
    employeeName: e.name,
    date: isoDate(2026, 9, 1 + d),
    checkIn: '09:00',
    checkOut: i % 5 === 0 ? undefined : '18:00',
    status: (i % 5 === 0 ? 'absent' : d === 4 && i % 3 === 0 ? 'late' : 'present') as 'present' | 'absent' | 'late',
  })),
);

export const advanceSalaryRequests = [
  { id: 'adv_1', employeeId: 'emp_001', employeeName: employees[0]!.name, amountBdt: 5000, reason: 'Medical emergency', status: 'approved' as const, requestedAt: '2026-08-15' },
  { id: 'adv_2', employeeId: 'emp_002', employeeName: employees[1]!.name, amountBdt: 3000, reason: 'Family expense', status: 'pending' as const, requestedAt: '2026-09-01' },
  { id: 'adv_3', employeeId: 'emp_003', employeeName: employees[2]!.name, amountBdt: 8000, reason: 'Home repair', status: 'rejected' as const, requestedAt: '2026-08-20' },
];

export const employeeAccounts = employees.map((e) => ({
  employeeId: e.id,
  employeeName: e.name,
  balanceBdt: e.id === 'emp_001' ? -5000 : 0,
  advancesBdt: e.id === 'emp_001' ? 5000 : 0,
  lastSalaryMonth: '2026-08',
}));

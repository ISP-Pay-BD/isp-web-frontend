export interface SalaryBreakdown {
  basic: number;
  allowance: number;
  deduction: number;
}

export interface EmployeeSalary extends Record<string, unknown> {
  id: string;
  month: string;
  amountBdt: number;
  paidAt: string;
  status: 'paid' | 'pending';
  breakdown: SalaryBreakdown;
}

export interface EmployeeAdvanceRequest extends Record<string, unknown> {
  id: string;
  amountBdt: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  department: string;
  joinedAt: string;
  manager: string;
}

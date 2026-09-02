export interface AdvanceSalaryItem {
  id: string;
  employeeId: string;
  employeeName: string;
  amountBdt: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'deducted';
  requestedAt: string;
  deductMonth?: string;
}

export interface GrantAdvanceFormData {
  employeeId: string;
  amountBdt: number;
  deductMonth: string;
  reason: string;
}

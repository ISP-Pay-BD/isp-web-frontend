export interface SalaryPaymentItem {
  id: string;
  employeeId: string;
  employeeName: string;
  amountBdt: number;
  month: string;
  paidAt: string;
  paidVia?: string;
  status: 'paid' | 'pending';
}

export interface SalaryPaymentFormData {
  employeeId: string;
  month: string;
  amountBdt: number;
  paidVia: string;
  notes?: string;
}

export type PaymentStatus = 'successful' | 'pending' | 'failed';

export interface SalaryPaymentItem {
  id: string;
  invoice: string;
  employeeId: string;
  employeeName: string;
  employeeDesignation: string;
  amount: number;
  advanceDeducted: number;
  month: string;
  status: PaymentStatus;
  paidVia: string;
  paidAt: string;
  createdAt: string;
}

export interface SalaryPaymentSummary {
  totalCount: number;
  successfulCount: number;
  successfulTotal: number;
  pendingCount: number;
  pendingTotal: number;
  failedCount: number;
}

export interface SalaryBreakdown {
  salary: number;
  advance: number;
  netPaid: number;
  remaining: number;
}

export interface SalaryPaymentFormData {
  employeeId: string;
  month: string;
  year: number;
  amount: number;
  status: PaymentStatus;
  paidVia: string;
  methodTrx: string;
  deductAdvances: boolean;
}

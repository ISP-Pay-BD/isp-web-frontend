export type AdvanceStatus = 'pending' | 'approved' | 'rejected' | 'deducted';

export interface AdvanceSalaryItem {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  reason: string;
  status: AdvanceStatus;
  createdAt: string;
  approvedAt: string;
  deductMonth: string;
  rejectionReason: string;
  deductedAmount: number;
}

export interface AdvanceSummary {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  deductedCount: number;
  approvedTotal: number;
  pendingTotal: number;
}

export interface GrantAdvanceFormData {
  employeeId: string;
  amount: number;
  deductMonth: string;
  reason: string;
}

export type AdvanceDecision =
  | { id: string; status: 'approved'; deductMonth: string }
  | { id: string; status: 'rejected'; rejectionReason: string };

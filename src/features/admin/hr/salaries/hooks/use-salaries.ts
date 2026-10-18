'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hrService, type RawRow } from '@/lib/api/services/employee.service';
import { num, str } from '@/lib/api/case';
import { hrKeys } from '../../shared/keys';
import type { PaymentStatus, SalaryBreakdown, SalaryPaymentFormData, SalaryPaymentItem, SalaryPaymentSummary } from '../types';

const STATUSES: PaymentStatus[] = ['successful', 'pending', 'failed'];

export function mapSalaryPayment(r: RawRow): SalaryPaymentItem {
  const status = str(r.status) as PaymentStatus;
  return {
    id: str(r.id),
    invoice: str(r.invoice),
    employeeId: str(r.user_id),
    employeeName: str(r.employee_name) === '--' ? '' : str(r.employee_name),
    employeeDesignation: str(r.employee_designation),
    amount: num(r.amount),
    advanceDeducted: num(r.advance_deducted),
    month: str(r.month),
    status: STATUSES.includes(status) ? status : 'pending',
    paidVia: str(r.paid_via),
    paidAt: str(r.paid_at),
    createdAt: str(r.created_at),
  };
}

export interface SalaryFilters {
  page: number;
  perPage: number;
  search: string;
  month: string;
  status: string;
}

export function useSalaries(filters: SalaryFilters) {
  return useQuery({
    queryKey: [...hrKeys.salaries, 'list', filters],
    queryFn: async () => {
      const res = await hrService.listPayments({
        page: filters.page,
        per_page: filters.perPage,
        search: filters.search || undefined,
        month: filters.month !== 'all' ? filters.month : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      });
      return { items: res.items.map(mapSalaryPayment), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** Totals per status for the same search/month (status-independent). */
export function useSalarySummary(filters: Pick<SalaryFilters, 'search' | 'month'>) {
  return useQuery({
    queryKey: [...hrKeys.salaries, 'summary', filters],
    queryFn: async (): Promise<SalaryPaymentSummary> => {
      const r = await hrService.paymentSummary({
        search: filters.search || undefined,
        month: filters.month !== 'all' ? filters.month : undefined,
      });
      return {
        totalCount: num(r.total_count),
        successfulCount: num(r.successful_count),
        successfulTotal: num(r.successful_total),
        pendingCount: num(r.pending_count),
        pendingTotal: num(r.pending_total),
        failedCount: num(r.failed_count),
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** Salary / outstanding advance / paid / remaining for one employee-month (prefills the form). */
export function useSalaryBreakdown(employeeId: string, month: string, year: number) {
  return useQuery({
    queryKey: [...hrKeys.salaries, 'breakdown', employeeId, month, year],
    queryFn: async (): Promise<SalaryBreakdown> => {
      const r = await hrService.salaryBreakdown(employeeId, month, year);
      return { salary: num(r.salary), advance: num(r.advance), netPaid: num(r.net_paid), remaining: num(r.remaining) };
    },
    enabled: !!employeeId && !!month && year >= 2000,
  });
}

export function useRecordSalaryPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: SalaryPaymentFormData) =>
      hrService.createPayment({
        employee_id: Number(v.employeeId),
        amount: v.amount,
        month: v.month,
        year: v.year,
        status: v.status,
        paid_via: v.paidVia || undefined,
        method_trx: v.methodTrx.trim() || undefined,
        deduct_advances: v.deductAdvances ? 1 : 0,
      }),
    meta: { silent: true },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.salaries });
      qc.invalidateQueries({ queryKey: hrKeys.accounts });
      qc.invalidateQueries({ queryKey: hrKeys.advances });
    },
  });
}

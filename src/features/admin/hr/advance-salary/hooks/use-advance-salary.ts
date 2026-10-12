'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hrService, type RawRow } from '@/lib/api/services/employee.service';
import { num, str } from '@/lib/api/case';
import { hrKeys } from '../../shared/keys';
import type { AdvanceDecision, AdvanceSalaryItem, AdvanceStatus, AdvanceSummary, GrantAdvanceFormData } from '../types';

const STATUSES: AdvanceStatus[] = ['pending', 'approved', 'rejected', 'deducted'];

export function mapAdvance(r: RawRow): AdvanceSalaryItem {
  const status = str(r.status) as AdvanceStatus;
  return {
    id: str(r.id),
    employeeId: str(r.employee_id),
    employeeName: str(r.employee_name),
    amount: num(r.amount),
    reason: str(r.reason),
    status: STATUSES.includes(status) ? status : 'pending',
    createdAt: str(r.created_at),
    approvedAt: str(r.approved_at),
    deductMonth: str(r.deduct_month),
    rejectionReason: str(r.rejection_reason),
    deductedAmount: num(r.deducted_amount),
  };
}

export interface AdvanceFilters {
  page: number;
  perPage: number;
  search: string;
  status: string;
}

export function useAdvanceSalary(filters: AdvanceFilters) {
  return useQuery({
    queryKey: [...hrKeys.advances, 'list', filters],
    queryFn: async () => {
      const res = await hrService.listAdvances({
        page: filters.page,
        per_page: filters.perPage,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      });
      return { items: res.items.map(mapAdvance), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdvanceSummary() {
  return useQuery({
    queryKey: [...hrKeys.advances, 'summary'],
    queryFn: async (): Promise<AdvanceSummary> => {
      const r = await hrService.advanceSummary();
      return {
        totalCount: num(r.total_count),
        pendingCount: num(r.pending_count),
        approvedCount: num(r.approved_count),
        rejectedCount: num(r.rejected_count),
        deductedCount: num(r.deducted_count),
        approvedTotal: num(r.approved_total),
        pendingTotal: num(r.pending_total),
      };
    },
  });
}

export function useAdvanceMutations() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: hrKeys.advances });
    qc.invalidateQueries({ queryKey: hrKeys.accounts });
  };

  const grant = useMutation({
    mutationFn: (v: GrantAdvanceFormData) =>
      hrService.grantAdvance({
        employee_id: Number(v.employeeId),
        amount: v.amount,
        reason: v.reason.trim(),
        deduct_month: v.deductMonth || undefined,
      }),
    onSuccess: refresh,
  });

  const decide = useMutation({
    mutationFn: (d: AdvanceDecision) =>
      hrService.decideAdvance(
        d.id,
        d.status === 'approved'
          ? { status: 'approved', deduct_month: d.deductMonth || undefined }
          : { status: 'rejected', rejection_reason: d.rejectionReason.trim() },
      ),
    onSuccess: refresh,
  });

  const deduct = useMutation({
    mutationFn: (id: string) => hrService.deductAdvance(id),
    onSuccess: refresh,
  });

  return { grant, decide, deduct };
}

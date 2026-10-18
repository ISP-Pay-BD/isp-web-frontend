'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { hrService, type RawRow } from '@/lib/api/services/employee.service';
import { num, str } from '@/lib/api/case';
import { hrKeys } from '../../shared/keys';
import type { EmployeeAccountItem } from '../types';

export function mapAccount(r: RawRow): EmployeeAccountItem {
  return {
    employeeId: str(r.employee_id),
    employeeName: str(r.employee_name),
    designation: str(r.designation),
    mobile: str(r.mobile),
    status: str(r.status),
    salary: num(r.salary),
    advance: num(r.advance),
    paid: num(r.paid),
    balance: num(r.balance),
    month: str(r.month),
    year: num(r.year),
  };
}

export interface AccountFilters {
  page: number;
  perPage: number;
  search: string;
  month: string;
  year: number;
}

/** Salary − outstanding advance − paid = balance, per employee for one pay month. */
export function useEmployeeAccounts(filters: AccountFilters) {
  return useQuery({
    queryKey: [...hrKeys.accounts, filters],
    queryFn: async () => {
      const res = await hrService.listAccounts({
        page: filters.page,
        per_page: filters.perPage,
        search: filters.search || undefined,
        month: filters.month,
        year: filters.year,
      });
      return { items: res.items.map(mapAccount), meta: res.meta };
    },
    placeholderData: keepPreviousData,
    enabled: filters.year >= 2000 && filters.year <= 2100,
  });
}

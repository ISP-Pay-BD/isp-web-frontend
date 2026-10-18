'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import type { ApiError } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { accountingKeys } from '../../shared/query-keys';

export const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface ChartOfAccountItem {
  id: string;
  code: string;
  name: string;
  type: AccountType | string;
  isSystem: boolean;
  status: string;
  balance: number;
}

export interface NewAccountInput {
  code: string;
  name: string;
  type: AccountType;
}

type Row = Record<string, unknown>;

function mapAccount(r: Row): ChartOfAccountItem {
  return {
    id: str(r.id),
    code: str(r.code),
    name: str(r.name),
    type: str(r.type),
    isSystem: num(r.is_system) === 1 || r.is_system === true,
    status: str(r.status),
    balance: num(r.balance),
  };
}

/** Full chart of accounts (bounded reference list, filtered client-side). */
export function useChartOfAccounts() {
  const query = useQuery({
    queryKey: accountingKeys.chartOfAccounts,
    queryFn: async () => {
      const res = await http.getPage<Row>('/v1/accounting/chart-of-accounts');
      return res.items.map(mapAccount);
    },
  });
  return { ...query, accounts: query.data ?? [] };
}

/** POST a new GL account; the caller maps 422 field errors via `onError`. */
export function useCreateAccount(onError: (error: ApiError) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewAccountInput) =>
      http.post<Row>('/v1/accounting/chart-of-accounts', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountingKeys.chartOfAccounts }),
    onError,
  });
}

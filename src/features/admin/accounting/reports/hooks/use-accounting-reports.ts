'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { accountingKeys } from '../../shared/query-keys';

export interface AccountingSummary {
  fromDate: string;
  toDate: string;
  income: {
    total: number;
    customersPaymentReceived: number;
    otherIncome: number;
    bandwidthSell: number;
    otc: number;
  };
  expense: { total: number; employeePayment: number; otherExpenses: number; bandwidthBuy: number };
  netAmount: number;
}

type Row = Record<string, unknown>;

function mapSummary(d: Row): AccountingSummary {
  const inc = (d.income ?? {}) as Row;
  const exp = (d.expense ?? {}) as Row;
  return {
    fromDate: str(d.from_date),
    toDate: str(d.to_date),
    income: {
      total: num(inc.total),
      customersPaymentReceived: num(inc.customers_payment_received),
      otherIncome: num(inc.other_income),
      bandwidthSell: num(inc.bandwidth_sell),
      otc: num(inc.otc),
    },
    expense: {
      total: num(exp.total),
      employeePayment: num(exp.employee_payment),
      otherExpenses: num(exp.other_expenses),
      bandwidthBuy: num(exp.bandwidth_buy),
    },
    netAmount: num(d.net_amount),
  };
}

/** Period income/expense summary (GET /v1/accounting/summary). */
export function useAccountingSummary(fromDate: string, toDate: string) {
  return useQuery({
    queryKey: [...accountingKeys.summary, { fromDate, toDate }],
    queryFn: async () =>
      mapSummary(
        (await http.get<Row>('/v1/accounting/summary', {
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        })) ?? {},
      ),
    placeholderData: keepPreviousData,
  });
}

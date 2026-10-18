'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { accountingKeys } from '../../shared/query-keys';

export interface BalanceSheetRow {
  code: string;
  name: string;
  balance: number;
}

export interface BalanceSheetData {
  asOf: string;
  assets: BalanceSheetRow[];
  liabilities: BalanceSheetRow[];
  equity: BalanceSheetRow[];
  totals: { assets: number; liabilities: number; equity: number };
  totalLiabilitiesAndEquity: number;
  /** assets − (liabilities + equity) */
  difference: number;
  isBalanced: boolean;
}

type Row = Record<string, unknown>;

const rows = (v: unknown): BalanceSheetRow[] =>
  Array.isArray(v)
    ? (v as Row[]).map((r) => ({ code: str(r.code), name: str(r.name), balance: num(r.balance) }))
    : [];

function mapBalanceSheet(d: Row): BalanceSheetData {
  const sheet = (d.sheet ?? {}) as Row;
  const totals = (sheet.totals ?? {}) as Row;
  return {
    asOf: str(d.as_of),
    assets: rows(sheet.assets),
    liabilities: rows(sheet.liabilities),
    equity: rows(sheet.equity),
    totals: {
      assets: num(totals.assets),
      liabilities: num(totals.liabilities),
      equity: num(totals.equity),
    },
    totalLiabilitiesAndEquity: num(d.total_liabilities_and_equity),
    difference: num(d.difference),
    isBalanced: d.is_balanced === true || d.is_balanced === 1 || d.is_balanced === '1',
  };
}

/** Balance sheet as of a date (YYYY-MM-DD; empty = backend default, today). */
export function useBalanceSheet(asOf: string) {
  const query = useQuery({
    queryKey: [...accountingKeys.balanceSheet, { asOf }],
    queryFn: async () =>
      mapBalanceSheet(
        (await http.get<Row>('/v1/accounting/balance-sheet', { as_of: asOf || undefined })) ?? {},
      ),
    placeholderData: keepPreviousData,
  });
  return { ...query, balanceSheet: query.data };
}

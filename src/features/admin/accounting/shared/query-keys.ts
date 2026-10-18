import type { QueryClient } from '@tanstack/react-query';

/** Query-key roots for the accounting screens (lists/summaries nest under these). */
export const accountingKeys = {
  chartOfAccounts: ['admin', 'accounting', 'chart-of-accounts'] as const,
  journalEntries: ['admin', 'accounting', 'journal-entries'] as const,
  balanceSheet: ['admin', 'accounting', 'balance-sheet'] as const,
  summary: ['admin', 'accounting', 'summary'] as const,
};

/** Everything derived from posted journal lines (balances, GL, period summary). */
export function invalidateGeneralLedger(queryClient: QueryClient) {
  for (const queryKey of Object.values(accountingKeys)) {
    void queryClient.invalidateQueries({ queryKey });
  }
}

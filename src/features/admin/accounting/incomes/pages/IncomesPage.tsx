'use client';

import { LedgerEntriesPage } from '../../shared/ledger/LedgerEntriesPage';

export function IncomesPage() {
  return (
    <LedgerEntriesPage
      kind="income"
      title="Income & Inward Ledger"
      subtitle="Track subscription receipts, installation revenues, OTC payments, and misc revenue deposits."
    />
  );
}

'use client';

import { LedgerEntriesPage } from '../../shared/ledger/LedgerEntriesPage';

export function ExpensesPage() {
  return (
    <LedgerEntriesPage
      kind="expense"
      title="Operational Expenses & Payables"
      subtitle="Manage upstream IIG bandwidth costs, NTTN transmission, staff salaries, hardware procurement, and utility bills."
    />
  );
}

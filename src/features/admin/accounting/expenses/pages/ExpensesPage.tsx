'use client';

import { useTranslations } from '@/i18n/locale-context';
import { LedgerEntriesPage } from '../../shared/ledger/LedgerEntriesPage';

export function ExpensesPage() {
  const t = useTranslations();
  return (
    <LedgerEntriesPage
      kind="expense"
      title={t('admin.accounting.expenses.title', 'Operational Expenses & Payables')}
      subtitle={
        t(
          'admin.accounting.expenses.subtitle',
          'Manage upstream IIG bandwidth costs, NTTN transmission, staff salaries, hardware procurement, and utility bills.',
        )
      }
    />
  );
}

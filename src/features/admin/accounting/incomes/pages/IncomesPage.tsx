'use client';

import { useTranslations } from '@/i18n/locale-context';
import { LedgerEntriesPage } from '../../shared/ledger/LedgerEntriesPage';

export function IncomesPage() {
  const t = useTranslations();
  return (
    <LedgerEntriesPage
      kind="income"
      title={t('admin.accounting.incomes.title', 'Income & Inward Ledger')}
      subtitle={
        t(
          'admin.accounting.incomes.subtitle',
          'Track subscription receipts, installation revenues, OTC payments, and misc revenue deposits.',
        )
      }
    />
  );
}

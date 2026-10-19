import type { useTranslations } from '@/i18n/locale-context';
import type { LedgerKind } from './api';

type Translate = ReturnType<typeof useTranslations>;

/** Income / expense wording of the shared ledger screens (the noun changes the sentence, not just a word). */
export function ledgerCopy(t: Translate, kind: LedgerKind) {
  const income = kind === 'income';
  return {
    crumb: income ? t('nav.acc-incomes', 'Incomes') : t('nav.acc-expenses', 'Expenses'),
    totalLabel: income
      ? t('admin.accounting.ledger.income.totalLabel', 'Total Recorded')
      : t('admin.accounting.ledger.expense.totalLabel', 'Total Expenses'),
    newEntry: income
      ? t('admin.accounting.ledger.income.newEntry', 'New Income Entry')
      : t('admin.accounting.ledger.expense.newEntry', 'New Expense Entry'),
    loadFailed: income
      ? t('admin.accounting.ledger.income.loadFailed', 'Failed to load income entries')
      : t('admin.accounting.ledger.expense.loadFailed', 'Failed to load expense entries'),
    emptyTitle: income
      ? t('admin.accounting.ledger.income.emptyTitle', 'No income entries found')
      : t('admin.accounting.ledger.expense.emptyTitle', 'No expense entries found'),
    emptyFiltered: income
      ? t('admin.accounting.ledger.income.emptyFiltered', 'No income entries match your search or filters.')
      : t('admin.accounting.ledger.expense.emptyFiltered', 'No expense entries match your search or filters.'),
    emptyNoCategory: income
      ? t(
          'admin.accounting.ledger.income.emptyNoCategory',
          'Add a category under "Manage categories", then record the first income entry.',
        )
      : t(
          'admin.accounting.ledger.expense.emptyNoCategory',
          'Add a category under "Manage categories", then record the first expense entry.',
        ),
    emptyNone: income
      ? t('admin.accounting.ledger.income.emptyNone', 'No income entries have been recorded yet.')
      : t('admin.accounting.ledger.expense.emptyNone', 'No expense entries have been recorded yet.'),
    exported: (n: string) =>
      income
        ? t('admin.accounting.ledger.income.exported', 'Exported {n} income entries', { n })
        : t('admin.accounting.ledger.expense.exported', 'Exported {n} expense entries', { n }),
    entryLabel: (vars: { id: string; name: string; amount: string }) =>
      income
        ? t('admin.accounting.ledger.income.entryLabel', 'income entry #{id} ({name}, {amount})', vars)
        : t('admin.accounting.ledger.expense.entryLabel', 'expense entry #{id} ({name}, {amount})', vars),
    editTitle: (id: string) =>
      income
        ? t('admin.accounting.ledger.income.editTitle', 'Edit income entry #{id}', { id })
        : t('admin.accounting.ledger.expense.editTitle', 'Edit expense entry #{id}', { id }),
    recordTitle: income
      ? t('admin.accounting.ledger.income.recordTitle', 'Record income entry')
      : t('admin.accounting.ledger.expense.recordTitle', 'Record expense entry'),
    recorded: income
      ? t('admin.accounting.ledger.income.recorded', 'Income entry recorded (pending approval)')
      : t('admin.accounting.ledger.expense.recorded', 'Expense entry recorded (pending approval)'),
    categoriesTitle: income
      ? t('admin.accounting.ledger.income.categoriesTitle', 'Income categories')
      : t('admin.accounting.ledger.expense.categoriesTitle', 'Expense categories'),
    categoriesDesc: income
      ? t('admin.accounting.ledger.income.categoriesDesc', 'Categories offered when recording income entries.')
      : t('admin.accounting.ledger.expense.categoriesDesc', 'Categories offered when recording expense entries.'),
  };
}

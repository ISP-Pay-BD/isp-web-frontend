/**
 * @module features/admin/accounting/incomes
 * Public exports only — import from '@/features/admin/accounting/incomes'
 */

export { IncomesPage } from './pages/IncomesPage';
export { IncomeModal } from './components/IncomeModal';
export { useIncomes } from './hooks/use-incomes';
export type { IncomeItem, IncomeCategory } from './types';
export { incomeSchema, type IncomeFormValues } from './schemas';

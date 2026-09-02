/**
 * @module features/admin/accounting/expenses
 * Public exports only — import from '@/features/admin/accounting/expenses'
 */

export { ExpensesPage } from './pages/ExpensesPage';
export { ExpenseModal } from './components/ExpenseModal';
export { useExpenses } from './hooks/use-expenses';
export type { ExpenseItem, ExpenseFormData } from './types';
export { expenseSchema, type ExpenseFormValues } from './schemas';

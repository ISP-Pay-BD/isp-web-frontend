/**
 * @module features/admin/hr/salaries
 * Public exports only — import from '@/features/admin/hr/salaries'
 */

export { SalariesPage } from './pages/SalariesPage';
export { SalaryPaymentModal } from './components/SalaryPaymentModal';
export { useSalaries } from './hooks/use-salaries';
export type { SalaryPaymentItem, SalaryPaymentFormData } from './types';
export { salaryPaymentSchema, type SalaryPaymentFormValues } from './schemas';

/**
 * @module features/admin/hr/employees
 * Public exports only — import from '@/features/admin/hr/employees'
 */

export { EmployeesPage } from './pages/EmployeesPage';
export { EmployeeModal } from './components/EmployeeModal';
export { useEmployees } from './hooks/use-employees';
export type { EmployeeItem, EmployeeFormData } from './types';
export { employeeSchema, type EmployeeFormValues } from './schemas';

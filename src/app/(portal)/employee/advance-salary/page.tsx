import type { Metadata } from 'next';
import { EmployeeAdvanceSalaryPage } from '@/features/employee/advance-salary';

export const metadata: Metadata = {
  title: 'Advance Salary',
  description: 'Request and track advance salary',
};

export default function Page() {
  return <EmployeeAdvanceSalaryPage />;
}

import type { Metadata } from 'next';
import { EmployeesPage } from '@/features/admin/hr/employees';

export const metadata: Metadata = {
  title: 'Staff & Employees',
  description: 'Manage ISP staff, technicians, and salary structures.',
};

export default function Page() {
  return <EmployeesPage />;
}

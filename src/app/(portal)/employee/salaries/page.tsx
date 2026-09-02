import type { Metadata } from 'next';
import { EmployeeSalariesPage } from '@/features/employee/salaries';

export const metadata: Metadata = {
  title: 'My Salaries',
  description: 'View salary slips and payment history',
};

export default function Page() {
  return <EmployeeSalariesPage />;
}

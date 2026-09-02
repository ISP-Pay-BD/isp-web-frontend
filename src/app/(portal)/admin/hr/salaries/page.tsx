import type { Metadata } from 'next';
import { SalariesPage } from '@/features/admin/hr/salaries';

export const metadata: Metadata = {
  title: 'Salary Payments',
  description: 'Disburse and review employee payroll.',
};

export default function Page() {
  return <SalariesPage />;
}

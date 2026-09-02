import type { Metadata } from 'next';
import { AdvanceSalaryPage } from '@/features/admin/hr/advance-salary';

export const metadata: Metadata = {
  title: 'Advance Salary',
  description: 'Request and approve salary advances.',
};

export default function Page() {
  return <AdvanceSalaryPage />;
}

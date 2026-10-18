import type { Metadata } from 'next';
import { AccountingReportsPage } from '@/features/admin/accounting/reports';

export const metadata: Metadata = {
  title: 'Accounting Reports',
  description: 'Income, expense and net results for a period.',
};

export default function Page() {
  return <AccountingReportsPage />;
}

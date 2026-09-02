import type { Metadata } from 'next';
import { ExpensesPage } from '@/features/admin/accounting/expenses';

export const metadata: Metadata = {
  title: 'Expenses & Payables',
  description: 'Track operational and vendor expenses.',
};

export default function Page() {
  return <ExpensesPage />;
}

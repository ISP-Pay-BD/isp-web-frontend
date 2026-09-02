import type { Metadata } from 'next';
import { IncomesPage } from '@/features/admin/accounting/incomes';

export const metadata: Metadata = {
  title: 'Revenue & Incomes',
  description: 'Track collections and revenue streams.',
};

export default function Page() {
  return <IncomesPage />;
}

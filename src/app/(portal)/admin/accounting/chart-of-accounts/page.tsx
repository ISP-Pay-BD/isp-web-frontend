import type { Metadata } from 'next';
import { ChartOfAccountsPage } from '@/features/admin/accounting/chart-of-accounts';

export const metadata: Metadata = {
  title: 'Chart of Accounts',
  description: 'General ledger account hierarchy.',
};

export default function Page() {
  return <ChartOfAccountsPage />;
}

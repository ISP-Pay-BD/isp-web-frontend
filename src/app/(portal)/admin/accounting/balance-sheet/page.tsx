import type { Metadata } from 'next';
import { BalanceSheetPage } from '@/features/admin/accounting/balance-sheet';

export const metadata: Metadata = {
  title: 'Balance Sheet',
  description: 'Assets, liabilities, and equity snapshot.',
};

export default function Page() {
  return <BalanceSheetPage />;
}

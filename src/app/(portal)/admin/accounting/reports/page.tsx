import type { Metadata } from 'next';
import { AccountingReportsPage } from '@/features/admin/accounting/reports';

export const metadata: Metadata = {
  title: 'Accounting Reports',
  description: 'P&L, cash flow, and receivables.',
};

export default function Page() {
  return <AccountingReportsPage />;
}

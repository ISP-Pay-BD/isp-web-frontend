import type { Metadata } from 'next';
import { EmployeeAccountsPage } from '@/features/admin/hr/accounts';

export const metadata: Metadata = {
  title: 'Employee Accounts',
  description: 'Staff ledger balances and advances.',
};

export default function Page() {
  return <EmployeeAccountsPage />;
}

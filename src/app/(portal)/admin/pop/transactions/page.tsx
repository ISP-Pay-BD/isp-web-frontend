import type { Metadata } from 'next';
import { PopTransactionsPage } from '@/features/admin/pop/transactions';

export const metadata: Metadata = {
  title: 'POP Transactions | Admin',
  description: 'POP funding credits and remittance ledger',
};

export default function PopTransactionsRoute() {
  return <PopTransactionsPage />;
}

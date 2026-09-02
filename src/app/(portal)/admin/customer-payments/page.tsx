import type { Metadata } from 'next';
import { CustomerPaymentsPage } from '@/features/admin/customer-payments';

export const metadata: Metadata = {
  title: 'Customer Payments | Admin',
  description: 'Collection ledger for subscriber payments',
};

export default function CustomerPaymentsRoute() {
  return <CustomerPaymentsPage />;
}

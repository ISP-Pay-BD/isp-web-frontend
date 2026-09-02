import type { Metadata } from 'next';
import { NewCustomerPaymentPage } from '@/features/admin/customer-payments';

export const metadata: Metadata = {
  title: 'Record Payment | Admin',
  description: 'Log a new customer collection payment',
};

export default function NewCustomerPaymentRoute() {
  return <NewCustomerPaymentPage />;
}

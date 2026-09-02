import type { Metadata } from 'next';
import { CustomerPaymentsPage } from '@/features/customer/payments';

export const metadata: Metadata = {
  title: 'Payment History',
  description: 'Customer Payment History, TrxID Records, and Invoices',
};

export default function Page() {
  return <CustomerPaymentsPage />;
}

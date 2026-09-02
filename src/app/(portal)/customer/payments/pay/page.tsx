import type { Metadata } from 'next';
import { CustomerPayPage } from '@/features/customer/payments';

export const metadata: Metadata = {
  title: 'Pay Bill Now',
  description: 'Instant Online Bill Payment via bKash, Nagad, and Cards',
};

export default function Page() {
  return <CustomerPayPage />;
}

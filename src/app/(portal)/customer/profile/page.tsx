import type { Metadata } from 'next';
import { CustomerProfilePage } from '@/features/customer/profile';

export const metadata: Metadata = {
  title: 'Customer Profile',
  description: 'Subscriber Identity, NID, Contact Details, and Network Info',
};

export default function Page() {
  return <CustomerProfilePage />;
}

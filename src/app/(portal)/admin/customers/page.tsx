import type { Metadata } from 'next';
import { AllCustomersPage } from '@/features/admin/customers';

export const metadata: Metadata = {
  title: 'Customers | Admin',
  description: 'Manage broadband subscriber records and credentials',
};

export default function CustomersRoute() {
  return <AllCustomersPage />;
}

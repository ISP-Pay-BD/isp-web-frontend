import type { Metadata } from 'next';
import { NewCustomerPage } from '@/features/admin/customers';

export const metadata: Metadata = {
  title: 'Add Customer | Admin',
  description: 'Create a new broadband subscriber account',
};

export default function NewCustomerRoute() {
  return <NewCustomerPage />;
}

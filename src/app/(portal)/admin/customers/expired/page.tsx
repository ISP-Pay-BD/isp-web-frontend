import type { Metadata } from 'next';
import { ExpiredCustomersPage } from '@/features/admin/customers';

export const metadata: Metadata = {
  title: 'Expired Customers | Admin',
  description: 'View expired subscriber lines and issue reminders or renewals',
};

export default function ExpiredCustomersRoute() {
  return <ExpiredCustomersPage />;
}

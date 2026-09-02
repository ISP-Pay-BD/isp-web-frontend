import type { Metadata } from 'next';
import { FreeRequestsPage } from '@/features/admin/customers';

export const metadata: Metadata = {
  title: 'Free User Requests | Admin',
  description: 'Manage incoming promotion and free trial requests',
};

export default function FreeRequestsRoute() {
  return <FreeRequestsPage />;
}

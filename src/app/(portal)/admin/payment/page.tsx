import type { Metadata } from 'next';
import { AdminPaymentPage } from '@/features/admin/payment';

export const metadata: Metadata = {
  title: 'My Payment | Admin',
  description: 'ISP Pay BD SaaS subscription billing history',
};

export default function AdminPaymentRoute() {
  return <AdminPaymentPage />;
}

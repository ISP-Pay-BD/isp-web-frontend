import type { Metadata } from 'next';
import { CustomerDashboardPage } from '@/features/customer/dashboard';

export const metadata: Metadata = {
  title: 'Customer Dashboard',
  description: 'Subscription status, usage, and quick pay',
};

export default function Page() {
  return <CustomerDashboardPage />;
}

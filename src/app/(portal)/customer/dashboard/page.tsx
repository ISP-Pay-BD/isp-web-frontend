import type { Metadata } from 'next';
import { CustomerDashboardPage } from '@/features/customer/dashboard';

export const metadata: Metadata = {
  title: 'Customer Dashboard',
  description: 'ISP Pay BD Customer Operations and Network Overview',
};

export default function Page() {
  return <CustomerDashboardPage />;
}

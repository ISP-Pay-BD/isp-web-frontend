import type { Metadata } from 'next';
import { AdminDashboardPage } from '@/features/admin/dashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'KPI overview, charts, and quick actions',
};

export default function Page() {
  return <AdminDashboardPage />;
}

import type { Metadata } from 'next';
import { AdminDashboardPage } from '@/features/admin/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Admin',
  description: 'ISP Pay BD Admin Dashboard — operations, active users, collections',
};

export default function AdminDashboardRoute() {
  return <AdminDashboardPage />;
}

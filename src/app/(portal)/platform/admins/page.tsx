import { AdminsListPage } from '@/features/platform/admins';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Second Admins | ISP Pay BD Platform',
};

export default function Page() {
  return <AdminsListPage />;
}

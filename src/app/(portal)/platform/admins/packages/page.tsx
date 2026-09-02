import { AdminPackagesPage } from '@/features/platform/admins';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Packages | ISP Pay BD Platform',
};

export default function Page() {
  return <AdminPackagesPage />;
}

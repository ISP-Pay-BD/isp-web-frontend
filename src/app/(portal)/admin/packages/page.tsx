import type { Metadata } from 'next';
import { PackagesPage } from '@/features/admin/packages';

export const metadata: Metadata = {
  title: 'Packages | Admin',
  description: 'Manage broadband internet packages and pricing',
};

export default function PackagesRoute() {
  return <PackagesPage />;
}

import type { Metadata } from 'next';
import { PopPackagesPage } from '@/features/admin/pop-packages';

export const metadata: Metadata = {
  title: 'POP Packages | Admin',
  description: 'Reseller internet packages for POP downstream customers',
};

export default function PopPackagesRoute() {
  return <PopPackagesPage />;
}

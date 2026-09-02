import type { Metadata } from 'next';
import { CustomerPackagesPage } from '@/features/customer/packages';

export const metadata: Metadata = {
  title: 'Available Packages',
  description: 'Broadband Speed Upgrades and High-Speed Packages',
};

export default function Page() {
  return <CustomerPackagesPage />;
}

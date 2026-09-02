import type { Metadata } from 'next';
import { VendorsPage } from '@/features/admin/purchase';

export const metadata: Metadata = {
  title: 'Purchase Vendors',
  description: 'Supplier directory and payables.',
};

export default function Page() {
  return <VendorsPage />;
}

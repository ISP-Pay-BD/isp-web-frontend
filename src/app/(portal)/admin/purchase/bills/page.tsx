import type { Metadata } from 'next';
import { PurchaseBillsPage } from '@/features/admin/purchase';

export const metadata: Metadata = {
  title: 'Purchase Bills',
  description: 'Vendor bills and payment status.',
};

export default function Page() {
  return <PurchaseBillsPage />;
}

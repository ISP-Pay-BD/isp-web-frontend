import type { Metadata } from 'next';
import { RequisitionsPage } from '@/features/admin/purchase';

export const metadata: Metadata = {
  title: 'Purchase Requisitions',
  description: 'Internal procurement requests.',
};

export default function Page() {
  return <RequisitionsPage />;
}

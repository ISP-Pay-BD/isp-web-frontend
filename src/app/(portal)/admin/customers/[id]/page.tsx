import type { Metadata } from 'next';
import { CustomerDetailPage } from '@/features/admin/customers';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Customer Detail | Admin',
  description: 'View subscriber line status, history, and network properties',
};

export default async function CustomerDetailRoute({ params }: Props) {
  const { id } = await params;
  return <CustomerDetailPage id={id} />;
}

import type { Metadata } from 'next';
import { EditCustomerPage } from '@/features/admin/customers';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Customer | Admin',
  description: 'Modify subscriber parameters and plan',
};

export default async function EditCustomerRoute({ params }: Props) {
  const { id } = await params;
  return <EditCustomerPage id={id} />;
}

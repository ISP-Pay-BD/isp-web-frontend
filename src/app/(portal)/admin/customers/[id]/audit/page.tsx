import { CustomerAuditPage } from '@/features/admin/customers';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Customer Audit', description: 'Customer change history' };

export default async function CustomerAuditRoute({ params }: Props) {
  const { id } = await params;
  return <CustomerAuditPage customerId={id} />;
}

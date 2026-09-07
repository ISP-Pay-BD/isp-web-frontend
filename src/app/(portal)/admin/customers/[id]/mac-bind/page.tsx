import { MacBindPage } from '@/features/admin/customers';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'MAC Bind', description: 'Bind or unbind customer MAC' };

export default async function CustomerMacBindRoute({ params }: Props) {
  const { id } = await params;
  return <MacBindPage customerId={id} />;
}

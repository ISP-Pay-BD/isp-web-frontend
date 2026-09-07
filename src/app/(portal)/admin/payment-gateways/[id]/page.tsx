import { PaymentGatewayDetailPage } from '@/features/admin/payment-gateways';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Gateway Config', description: 'Configure payment gateway' };

export default async function AdminPaymentGatewayDetailRoute({ params }: Props) {
  const { id } = await params;
  return <PaymentGatewayDetailPage id={id} />;
}

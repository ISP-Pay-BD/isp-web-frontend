import { MakePaymentPage } from '@/features/marketing/make-payment';

export const metadata = { title: 'Make payment', description: 'Pay your internet bill online' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MakePaymentPage paymentId={id} />;
}

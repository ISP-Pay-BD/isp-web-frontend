import { PaymentReturnPage } from '@/features/marketing/make-payment';

export const metadata = { title: 'Payment failed' };

export default function Page() {
  return <PaymentReturnPage outcome="failed" />;
}

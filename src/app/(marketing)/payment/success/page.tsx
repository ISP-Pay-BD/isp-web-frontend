import { PaymentReturnPage } from '@/features/marketing/make-payment';

export const metadata = { title: 'Payment successful' };

export default function Page() {
  return <PaymentReturnPage outcome="success" />;
}

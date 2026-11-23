import { PaymentReturnPage } from '@/features/marketing/make-payment';

export const metadata = { title: 'Payment cancelled' };

export default function Page() {
  return <PaymentReturnPage outcome="cancel" />;
}

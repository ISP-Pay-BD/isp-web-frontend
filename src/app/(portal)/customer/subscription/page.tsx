import type { Metadata } from 'next';
import { CustomerSubscriptionPage } from '@/features/customer/subscription';

export const metadata: Metadata = {
  title: 'My Subscription',
  description: 'View and renew your PPPoE subscription',
};

export default function Page() {
  return <CustomerSubscriptionPage />;
}

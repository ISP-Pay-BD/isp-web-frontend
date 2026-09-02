import type { Metadata } from 'next';
import { CustomerSubscriptionPage } from '@/features/customer/subscription';

export const metadata: Metadata = {
  title: 'My Subscription',
  description: 'Active Broadband Subscription and Renewal',
};

export default function Page() {
  return <CustomerSubscriptionPage />;
}

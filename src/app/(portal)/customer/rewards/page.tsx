import type { Metadata } from 'next';
import { CustomerRewardsPage } from '@/features/customer/rewards';

export const metadata: Metadata = {
  title: 'Referrals & Rewards',
  description: 'Customer Loyalty Points Wallet and Referral Program',
};

export default function Page() {
  return <CustomerRewardsPage />;
}

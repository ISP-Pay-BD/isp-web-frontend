import type { Metadata } from 'next';
import { PopFundingPage } from '@/features/admin/pop/funding';

export const metadata: Metadata = {
  title: 'POP Funding | Admin',
  description: 'Credit POP reseller wallet balances',
};

export default function PopFundingRoute() {
  return <PopFundingPage />;
}

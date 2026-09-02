import type { Metadata } from 'next';
import { WalletPage } from '@/features/admin/wallet';

export const metadata: Metadata = {
  title: 'My Wallet',
  description: 'Tenant PAYG wallet balance and top-ups.',
};

export default function Page() {
  return <WalletPage />;
}

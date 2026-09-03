import type { Metadata } from 'next';
import { SelfRechargePage } from '@/features/admin/subscription';

export const metadata: Metadata = {
  title: 'Self Recharge',
  description: 'Renew your admin subscription when expired',
};

export default function Page() {
  return <SelfRechargePage />;
}

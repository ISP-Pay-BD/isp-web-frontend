import type { Metadata } from 'next';
import { SelfRechargePage } from '@/features/admin/subscription';

export const metadata: Metadata = {
  title: 'Self Recharge | Admin',
  description: 'Renew ISP Pay BD SaaS subscription license',
};

export default function SelfRechargeRoute() {
  return <SelfRechargePage />;
}

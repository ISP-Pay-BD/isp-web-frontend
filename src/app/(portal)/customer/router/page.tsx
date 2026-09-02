import type { Metadata } from 'next';
import { CustomerRouterPage } from '@/features/customer/router';

export const metadata: Metadata = {
  title: 'Router Tools & Diagnostics',
  description: 'Self-Service Router Diagnostics, PPPoE Reset, and DNS Flushes',
};

export default function Page() {
  return <CustomerRouterPage />;
}

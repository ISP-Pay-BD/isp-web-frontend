import type { Metadata } from 'next';
import { RegisterPage } from '@/features/marketing/register';

export const metadata: Metadata = {
  title: 'Start Free Trial — ISP Pay BD Platform',
  description:
    'Start your 14-day free trial. Setup your ISP organization, connect MikroTik routers, and enable automated bKash reconciliation.',
};

export default function RegisterRoute() {
  return <RegisterPage />;
}

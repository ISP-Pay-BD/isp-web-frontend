import type { Metadata } from 'next';
import { RegisterPage } from '@/features/marketing/register';

export const metadata: Metadata = {
  title: 'Register your ISP — ISP Pay BD Platform',
  description:
    'Create your ISP organization account, pick a plan, connect MikroTik routers and automate bKash reconciliation.',
};

export default function RegisterRoute() {
  return <RegisterPage />;
}

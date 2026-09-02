import { PlatformDashboardPage } from '@/features/platform/dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Dashboard | ISP Pay BD',
  description: 'Super-admin platform overview, tenant telemetry and revenue metrics',
};

export default function Page() {
  return <PlatformDashboardPage />;
}

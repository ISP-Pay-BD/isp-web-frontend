import { CronDashboardPage } from '@/features/platform/cron';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cron Jobs | ISP Pay BD Platform',
};

export default function Page() {
  return <CronDashboardPage />;
}

import { RedisLogsPage } from '@/features/platform/settings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redis & Logs | ISP Pay BD Platform',
};

export default function Page() {
  return <RedisLogsPage />;
}

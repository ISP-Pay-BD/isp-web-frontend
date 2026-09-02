import type { Metadata } from 'next';
import { CustomerNewsPage } from '@/features/customer/news';

export const metadata: Metadata = {
  title: 'News & Notices',
  description: 'Official Provider Maintenance Alerts and Broadcasts',
};

export default function Page() {
  return <CustomerNewsPage />;
}

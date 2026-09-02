import { MaintenancePage } from '@/features/platform/settings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maintenance Mode | ISP Pay BD Platform',
};

export default function Page() {
  return <MaintenancePage />;
}

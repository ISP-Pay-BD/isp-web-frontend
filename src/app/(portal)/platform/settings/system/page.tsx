import { SystemSettingsPage } from '@/features/platform/system-settings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Settings | ISP Pay BD Platform',
};

export default function Page() {
  return <SystemSettingsPage />;
}

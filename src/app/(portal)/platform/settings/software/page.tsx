import { SoftwareSettingsPage } from '@/features/platform/settings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software Settings | ISP Pay BD Platform',
};

export default function Page() {
  return <SoftwareSettingsPage />;
}

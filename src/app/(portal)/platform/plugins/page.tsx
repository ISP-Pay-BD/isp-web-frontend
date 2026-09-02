import { PluginsPage } from '@/features/platform/plugins';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plugins & Addons | ISP Pay BD Platform',
};

export default function Page() {
  return <PluginsPage />;
}

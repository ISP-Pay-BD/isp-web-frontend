import type { Metadata } from 'next';
import { PluginsPage } from '@/features/marketing/plugins';

export const metadata: Metadata = {
  title: 'Plugins & Addons Marketplace — ISP Pay BD',
  description:
    'Browse the modular add-ons available on ISP Pay BD and request the ones your ISP needs.',
};

export default function PluginsRoute() {
  return <PluginsPage />;
}

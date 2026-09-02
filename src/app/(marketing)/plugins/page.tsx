import type { Metadata } from 'next';
import { PluginsPage } from '@/features/marketing/plugins';

export const metadata: Metadata = {
  title: 'Plugins & Addons Marketplace — ISP Pay BD',
  description:
    'Explore 15+ modular add-ons including WhatsApp Business, Huawei/ZTE OLT Manager, HR Payroll, and Merchant webhooks.',
};

export default function PluginsRoute() {
  return <PluginsPage />;
}

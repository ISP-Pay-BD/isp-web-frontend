import type { Metadata } from 'next';
import { CustomerDevicesPage } from '@/features/customer/router';

export const metadata: Metadata = {
  title: 'Connected Devices',
  description: 'Active Network DHCP Clients and Access Control',
};

export default function Page() {
  return <CustomerDevicesPage />;
}

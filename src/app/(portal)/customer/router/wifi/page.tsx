import type { Metadata } from 'next';
import { CustomerWifiSettingsPage } from '@/features/customer/router';

export const metadata: Metadata = {
  title: 'WiFi Network Settings',
  description: 'Change WiFi Network SSID and WPA2 Security Password',
};

export default function Page() {
  return <CustomerWifiSettingsPage />;
}

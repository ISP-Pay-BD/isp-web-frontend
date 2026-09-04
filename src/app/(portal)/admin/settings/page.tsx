import { SettingsPage } from '@/features/admin/settings';

export const metadata = { title: 'Settings', description: 'Software and gateway configuration' };

export default function AdminSettingsRoute() {
  return <SettingsPage />;
}

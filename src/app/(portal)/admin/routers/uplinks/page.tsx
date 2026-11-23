import { UplinksPage } from '@/features/admin/uplinks/pages/UplinksPage';

export const metadata = {
  title: 'Uplink monitoring',
  description: 'MikroTik uplink monitoring and WhatsApp/SMS alerts',
};

export default function Page() {
  return <UplinksPage />;
}

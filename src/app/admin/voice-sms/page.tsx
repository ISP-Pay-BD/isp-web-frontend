import { VoiceSmsPage } from '@/features/admin/voice-sms';

export const metadata = { title: 'Voice SMS', description: 'Broadcast voice alerts to subscribers' };

export default function AdminVoiceSmsRoute() {
  return <VoiceSmsPage />;
}

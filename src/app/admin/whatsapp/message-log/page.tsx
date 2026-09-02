import { WhatsAppMessageLogPage } from '@/features/admin/whatsapp';

export const metadata = { title: 'WhatsApp Message Log', description: 'WhatsApp delivery audit trail' };

export default function AdminWhatsAppMessageLogRoute() {
  return <WhatsAppMessageLogPage />;
}

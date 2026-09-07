import type { Metadata } from 'next';
import { ContactPage } from '@/features/marketing/contact';

export const metadata: Metadata = {
  title: 'Contact — ISP Pay BD',
  description:
    'Talk to the Dhaka operations team for demos, migration help, and enterprise SLA. Call, WhatsApp, or send a message.',
};

export default function ContactRoute() {
  return <ContactPage />;
}

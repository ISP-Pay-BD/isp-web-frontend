import type { Metadata } from 'next';
import { ContactPage } from '@/features/marketing/contact';

export const metadata: Metadata = {
  title: 'Contact Us — Sales & NOC Support | ISP Pay BD',
  description:
    'Talk to our Dhaka operations team for product demos, zero-downtime subscriber migration, and enterprise ISP SLA.',
};

export default function ContactRoute() {
  return <ContactPage />;
}

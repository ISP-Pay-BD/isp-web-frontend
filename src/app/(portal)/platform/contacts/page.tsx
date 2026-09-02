import { ContactsPage } from '@/features/platform/contacts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Inquiries | ISP Pay BD Platform',
};

export default function Page() {
  return <ContactsPage />;
}

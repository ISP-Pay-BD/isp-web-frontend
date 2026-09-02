import { SupportTicketsPage } from '@/features/platform/support';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support Tickets | ISP Pay BD Platform',
};

export default function Page() {
  return <SupportTicketsPage />;
}

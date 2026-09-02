import type { Metadata } from 'next';
import { CustomerTicketDetailPage } from '@/features/customer/support';

export const metadata: Metadata = {
  title: 'Ticket Conversation',
  description: 'Support Ticket Thread and Response History',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  return <CustomerTicketDetailPage params={params} />;
}

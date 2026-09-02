import type { Metadata } from 'next';
import { CustomerNewTicketPage } from '@/features/customer/support';

export const metadata: Metadata = {
  title: 'Open Support Ticket',
  description: 'Submit an Issue to the Technical Helpdesk',
};

export default function Page() {
  return <CustomerNewTicketPage />;
}

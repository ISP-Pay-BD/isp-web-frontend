import { SupportTicketsPage } from '@/features/admin/support';

export const metadata = { title: 'Support Tickets', description: 'Manage customer support requests' };

export default function AdminSupportRoute() {
  return <SupportTicketsPage />;
}

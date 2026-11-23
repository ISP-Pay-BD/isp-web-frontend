import type { Metadata } from 'next';
import { EmployeeTicketDetailPage } from '@/features/employee/operations/pages/EmployeeTicketDetailPage';

export const metadata: Metadata = {
  title: 'Support Ticket',
  description: 'Ticket conversation, reply and status',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeeTicketDetailPage id={id} />;
}

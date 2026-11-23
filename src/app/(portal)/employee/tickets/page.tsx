import type { Metadata } from 'next';
import { EmployeeTicketsPage } from '@/features/employee/operations/pages/EmployeeTicketsPage';

export const metadata: Metadata = {
  title: 'Support Tickets',
  description: 'Customer support tickets for staff',
};

export default function Page() {
  return <EmployeeTicketsPage />;
}

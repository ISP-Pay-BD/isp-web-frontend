import type { Metadata } from 'next';
import { EmployeeNewCustomerPage } from '@/features/employee/operations/pages/EmployeeNewCustomerPage';

export const metadata: Metadata = {
  title: 'Add Customer',
  description: 'Add a new customer from the employee portal',
};

export default function Page() {
  return <EmployeeNewCustomerPage />;
}

import type { Metadata } from 'next';
import { EmployeeOperationsPage } from '@/features/employee/operations/pages/EmployeeOperationsPage';

export const metadata: Metadata = {
  title: 'My Operations',
  description: 'Area dues, my collections and assigned tickets',
};

export default function Page() {
  return <EmployeeOperationsPage />;
}

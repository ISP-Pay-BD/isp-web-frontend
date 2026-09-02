import type { Metadata } from 'next';
import { EmployeeProfilePage } from '@/features/employee/profile';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your employee profile',
};

export default function Page() {
  return <EmployeeProfilePage />;
}

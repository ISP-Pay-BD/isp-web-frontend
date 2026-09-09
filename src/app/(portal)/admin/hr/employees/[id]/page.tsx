import type { Metadata } from 'next';
import { EmployeeDetailsPage } from '@/features/admin/hr/employees/pages/EmployeeDetailsPage';

export const metadata: Metadata = {
  title: 'Employee Activity & Profile | Admin',
  description: 'View employee profile details, real-time GPS locations, attendance logs, and salary advances',
};

export default async function EmployeeDetailsRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeeDetailsPage employeeId={id} />;
}

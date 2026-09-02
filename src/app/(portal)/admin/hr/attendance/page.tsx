import type { Metadata } from 'next';
import { AttendancePage } from '@/features/admin/hr/attendance';

export const metadata: Metadata = {
  title: 'Staff Attendance',
  description: 'Track daily attendance and field presence.',
};

export default function Page() {
  return <AttendancePage />;
}

import type { Metadata } from 'next';
import { BtrcReportPage } from '@/features/admin/reports';

export const metadata: Metadata = {
  title: 'BTRC Report',
  description: 'Regulatory subscriber report for BTRC filing.',
};

export default function Page() {
  return <BtrcReportPage />;
}

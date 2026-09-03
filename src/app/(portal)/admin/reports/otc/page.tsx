import type { Metadata } from 'next';
import { OtcReportPage } from '@/features/admin/reports/pages/OtcReportPage';

export const metadata: Metadata = {
  title: 'OTC Report',
  description: 'One-time charges and installation fee report for ISP operations.',
};

export default function Page() {
  return <OtcReportPage />;
}

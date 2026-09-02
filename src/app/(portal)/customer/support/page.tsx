import type { Metadata } from 'next';
import { CustomerSupportPage } from '@/features/customer/support';

export const metadata: Metadata = {
  title: 'Customer Support',
  description: 'Technical Support Tickets, ISP NOC Assistance, and Inquiries',
};

export default function Page() {
  return <CustomerSupportPage />;
}

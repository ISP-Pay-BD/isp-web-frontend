import { SmsPage } from '@/features/admin/sms';

export const metadata = {
  title: 'Send SMS',
  description: 'Send personalized SMS to broadband customers',
};

export default function AdminSmsRoute() {
  return <SmsPage />;
}

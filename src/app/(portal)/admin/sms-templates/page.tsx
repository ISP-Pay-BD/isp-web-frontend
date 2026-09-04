import { SmsTemplatesPage } from '@/features/admin/sms-templates';

export const metadata = { title: 'SMS Templates', description: 'Manage SMS templates and event triggers' };

export default function AdminSmsTemplatesRoute() {
  return <SmsTemplatesPage />;
}

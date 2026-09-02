import type { Metadata } from 'next';
import { CustomerChangePasswordPage } from '@/features/customer/change-password';

export const metadata: Metadata = {
  title: 'Change Password',
  description: 'Update Customer Portal Access Password',
};

export default function Page() {
  return <CustomerChangePasswordPage />;
}

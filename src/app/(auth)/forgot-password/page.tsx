import type { Metadata } from 'next';
import { ForgotPasswordPage } from '@/features/auth/forgot-password';

export const metadata: Metadata = {
  title: 'Reset password',
};

export default function ForgotPasswordRoutePage() {
  return <ForgotPasswordPage />;
}

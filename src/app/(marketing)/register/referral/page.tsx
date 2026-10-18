import type { Metadata } from 'next';
import { RegisterPage } from '@/features/marketing/register';

export const metadata: Metadata = {
  title: 'Customer Referral Registration — ISP Pay BD',
  description:
    'Register as a new internet customer with a referral code from an existing subscriber. Your ISP reviews your details and completes your connection setup.',
};

export default async function ReferralRegisterRoute(props: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await props.searchParams;
  return <RegisterPage initialReferralCode={params.code ?? ''} isReferralFlow={true} />;
}

import type { Metadata } from 'next';
import { RegisterPage } from '@/features/marketing/register';

export const metadata: Metadata = {
  title: 'Partner Referral Registration — ISP Pay BD',
  description:
    'Register with a partner referral code to unlock an extended 30-day trial and bonus wallet credits.',
};

export default async function ReferralRegisterRoute(props: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await props.searchParams;
  return <RegisterPage initialReferralCode={params.code ?? 'PARTNER-PROMO'} isReferralFlow={true} />;
}

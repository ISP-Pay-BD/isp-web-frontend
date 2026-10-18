import { Suspense } from 'react';
import { CaptivePage } from '@/features/marketing/captive';

export const metadata = { title: 'Captive portal', description: 'Expired session paywall' };

export default function Page() {
  // CaptivePage reads rid/ip/mac via useSearchParams.
  return (
    <Suspense fallback={<div className="min-h-dvh bg-landing-bg" />}>
      <CaptivePage />
    </Suspense>
  );
}

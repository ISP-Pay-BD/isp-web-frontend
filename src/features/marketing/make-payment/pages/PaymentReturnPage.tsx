'use client';

import Link from 'next/link';
import { Ban, CircleCheck, CircleX } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/i18n/locale-context';

export type PaymentReturnOutcome = 'success' | 'failed' | 'cancel';

const shell =
  'relative flex min-h-[70dvh] flex-col items-center justify-center bg-landing-bg px-4 py-16 text-white';
const panel =
  'relative z-10 w-full max-w-md space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md sm:p-8';
const link =
  'inline-block rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors duration-200 ease-out hover:bg-white/5 hover:text-white';

/**
 * Gateway browser return (`/payment/{success,failed,cancel}`). The Rust gateway callback verifies + settles,
 * then redirects the browser here — PHP's `route.subscription.callback` (paid) and `route.payment` with a
 * `pay-error` flash (failed / "You've cancelled the payment"). The page only reports that outcome; it never
 * decides it.
 */
export function PaymentReturnPage({ outcome }: { outcome: PaymentReturnOutcome }) {
  const t = useTranslations();
  const view = {
    success: {
      Icon: CircleCheck,
      tone: 'text-emerald-400',
      title: t('marketing.makePayment.return.successTitle', 'Payment successful'),
      body: t(
        'marketing.makePayment.return.successBody',
        'Your payment was received and your connection has been renewed.',
      ),
    },
    failed: {
      Icon: CircleX,
      tone: 'text-red-400',
      title: t('marketing.makePayment.return.failedTitle', 'Payment failed'),
      body: t(
        'marketing.makePayment.return.failedBody',
        'The payment could not be verified, so nothing was charged to your invoice. Please try again or contact your ISP.',
      ),
    },
    cancel: {
      Icon: Ban,
      tone: 'text-amber-400',
      title: t('marketing.makePayment.return.cancelTitle', 'Payment cancelled'),
      body: t('marketing.makePayment.return.cancelBody', "You've cancelled the payment."),
    },
  }[outcome];

  return (
    <div className={shell}>
      <Reveal className={panel}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <view.Icon className={`h-6 w-6 ${view.tone}`} aria-hidden />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{view.title}</h1>
        <p className="text-sm text-white/60">{view.body}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/customer/payments" className={link}>
            {t('marketing.makePayment.return.myPayments', 'My payments')}
          </Link>
          <Link href="/" className={link}>
            {t('marketing.makePayment.return.home', 'Home')}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

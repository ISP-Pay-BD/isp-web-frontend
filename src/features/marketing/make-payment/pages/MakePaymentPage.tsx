'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CreditCard, Receipt, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/i18n/locale-context';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import { usePublicInvoice, useStartPayment } from '../hooks/use-make-payment';

const shell =
  'relative flex min-h-[70dvh] flex-col items-center justify-center bg-landing-bg px-4 py-16 text-white';
const panel =
  'relative z-10 w-full rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8';

/**
 * Public pay link (`/payment/make-payment/{id}`, PHP `Payment::makePayment`): no login. Shows the pending
 * invoice amount and one card per enabled gateway (amount, surcharge, total); "Pay" redirects to the gateway.
 */
export function MakePaymentPage({ paymentId }: { paymentId: string }) {
  const t = useTranslations();
  const invoice = usePublicInvoice(paymentId);
  const start = useStartPayment(paymentId);
  const [active, setActive] = useState<string | null>(null);

  const pay = (gateway: string) => {
    setActive(gateway);
    start.mutate(gateway, {
      onSuccess: (url) => {
        if (!url) {
          setActive(null);
          toast.error(
            t('marketing.makePayment.noCheckout', 'The gateway did not return a checkout page.'),
          );
          return;
        }
        toast.message(
          t('marketing.makePayment.redirecting', 'Redirecting to the payment gateway…'),
        );
        window.location.assign(url);
      },
      onError: (err) => {
        setActive(null);
        toast.error(t('marketing.makePayment.startFailed', "Couldn't start payment"), {
          description: err.message,
        });
        // A 404 here means the invoice was paid meanwhile — refresh to show that.
        if ((err as { status?: number }).status === 404) invoice.refetch();
      },
    });
  };

  if (invoice.isLoading) {
    return (
      <div className={shell}>
        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  const notFound = !/^\d+$/.test(paymentId) || invoice.error?.status === 404;
  if (notFound) {
    return (
      <div className={shell}>
        <Reveal className={`${panel} max-w-md space-y-4`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <SearchX className="h-5 w-5 text-white/70" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              {t('marketing.makePayment.notFoundTitle', 'This payment link is not available')}
            </h1>
          </div>
          <p className="text-sm text-white/60">
            {t(
              'marketing.makePayment.notFoundBody',
              'The invoice was already paid, cancelled, or the link is wrong. Contact your ISP if you still need to pay.',
            )}
          </p>
          <Link href="/help" className="inline-block text-sm text-white/60 underline">
            {t('marketing.makePayment.help', 'Help')}
          </Link>
        </Reveal>
      </div>
    );
  }

  if (invoice.isError || !invoice.data) {
    return (
      <div className={shell}>
        <div className={`${panel} max-w-md space-y-4`}>
          <p className="text-sm text-white/70">
            {invoice.error?.message ||
              t('marketing.makePayment.genericError', 'Something went wrong.')}
          </p>
          <button
            type="button"
            onClick={() => invoice.refetch()}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors duration-200 ease-out hover:bg-white/5 hover:text-white"
          >
            {t('marketing.makePayment.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  const { amountBdt, companyName, gateways } = invoice.data;

  return (
    <div className={shell}>
      <div className="w-full max-w-4xl space-y-6">
        <Reveal className="space-y-2 text-center">
          <div className="bg-landing-cta/20 mx-auto flex h-11 w-11 items-center justify-center rounded-full">
            <Receipt className="text-landing-accent h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('marketing.makePayment.title', 'Payment Gateway')}
          </h1>
          <p className="text-sm text-white/60">
            {companyName ? `${companyName} · ` : ''}
            {t('marketing.makePayment.invoice', 'Invoice')} #{invoice.data.paymentId} ·{' '}
            <span className="text-white tabular-nums">{formatBdtWithSymbol(amountBdt)}</span>
          </p>
        </Reveal>

        {gateways.length === 0 ? (
          <div className={`${panel} mx-auto max-w-md text-center text-sm text-white/70`}>
            {t(
              'marketing.makePayment.noGateway',
              'Online payment is not available for this invoice. Please contact your ISP to pay.',
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gateways.map((g) => (
              <Reveal key={g.gateway} className={`${panel} flex flex-col gap-4`}>
                <div className="flex items-center gap-2">
                  <CreditCard className="text-landing-accent h-4 w-4" />
                  <h2 className="font-semibold">{g.label}</h2>
                </div>
                <dl className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/60">{t('marketing.makePayment.amount', 'Amount')}</dt>
                    <dd className="tabular-nums">{formatBdtWithSymbol(g.amountBdt)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/60">{t('marketing.makePayment.charge', 'Charge')}</dt>
                    <dd className="tabular-nums">
                      {formatBdtWithSymbol(g.chargeBdt)}{' '}
                      <span className="text-white/50">({g.chargePercent}%)</span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-white/10 pt-2 font-semibold">
                    <dt className="text-white/60">{t('marketing.makePayment.total', 'Total')}</dt>
                    <dd className="text-landing-accent tabular-nums">
                      {formatBdtWithSymbol(g.totalBdt)}
                    </dd>
                  </div>
                </dl>
                <Button
                  className="bg-landing-cta hover:bg-landing-cta-hover mt-auto w-full text-white duration-200 ease-out"
                  disabled={start.isPending}
                  onClick={() => pay(g.gateway)}
                >
                  {active === g.gateway && start.isPending
                    ? t('marketing.makePayment.opening', 'Opening payment…')
                    : t('marketing.makePayment.payWith', 'Pay with {gateway}', {
                        gateway: g.label,
                      })}
                </Button>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

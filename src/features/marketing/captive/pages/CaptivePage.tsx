'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/i18n/locale-context';
import { formatBdtWithSymbol } from '@/lib/format';
import { useCaptivePay, useCaptiveReconnect, useCaptiveSession } from '../hooks/use-captive';

const shell =
  'relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-landing-bg px-4 text-white';
const card =
  'relative z-10 w-full max-w-md space-y-6 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-md';

/** Captive paywall — marketing dark surface; session resolved from the MikroTik redirect (rid/ip/mac). */
export function CaptivePage() {
  const t = useTranslations();
  const params = useSearchParams();
  const locator = {
    rid: params.get('rid') ?? '',
    ip: params.get('ip') ?? '',
    mac: params.get('mac') ?? '',
  };

  const { data, isLoading, isError, error, refetch } = useCaptiveSession(locator);
  const pay = useCaptivePay(locator);
  const reconnect = useCaptiveReconnect(locator);

  if (isLoading) {
    return (
      <div className={shell}>
        <div className={card}>
          <p className="text-sm text-white/60">{t('marketing.captive.checking', 'Checking your connection…')}</p>
        </div>
      </div>
    );
  }

  const notFound = error?.status === 404 || (data && (!data.found || !data.customer));

  if (notFound) {
    return (
      <div className={shell}>
        <Reveal className={card}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <WifiOff className="h-5 w-5 text-white/70" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              {t('marketing.captive.notFoundTitle', "We couldn't identify your connection")}
            </h1>
          </div>
          <p className="text-sm text-white/60">
            {t(
              'marketing.captive.notFoundBody',
              "Make sure you are connected to your ISP's network, then reload this page. If it keeps happening, contact your ISP.",
            )}
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-white/15 px-4 py-2 text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              {t('marketing.captive.tryAgain', 'Try again')}
            </button>
            <Link href="/help" className="px-1 py-2 text-white/60 underline">
              {t('marketing.captive.help', 'Help')}
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  if (isError || !data?.customer) {
    return (
      <div className={shell}>
        <div className={card}>
          <p className="text-sm text-white/70">{error?.message || t('marketing.captive.genericError', 'Something went wrong.')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
          >
            {t('marketing.captive.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  const { customer, isp, canReconnect } = data;

  const startPayment = () =>
    pay.mutate(undefined, {
      onSuccess: (res) => {
        if (!res.payUrl) {
          toast.error(
            t('marketing.captive.payLinkUnavailable', 'The payment link is not available. Please contact your ISP.'),
          );
          return;
        }
        window.location.assign(res.payUrl);
      },
    });

  const startReconnect = () =>
    reconnect.mutate(undefined, {
      onSuccess: (res) => {
        if (res.status === 'success') toast.success(res.message || t('marketing.captive.reconnected', 'Reconnected'));
        else toast.message(res.message || t('marketing.captive.reconnectRequested', 'Reconnection requested'));
      },
    });

  return (
    <div className={shell}>
      <Reveal className={card}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-landing-cta/20">
            <Wifi className="h-5 w-5 text-landing-accent" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight">
              {customer.expired
                ? t('marketing.captive.sessionExpired', 'Session expired')
                : t('marketing.captive.yourConnection', 'Your connection')}
            </h1>
            <p className="truncate text-sm text-white/70">{customer.name}</p>
            <p className="truncate font-mono text-xs text-white/50">{customer.username}</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-white/60">{t('marketing.captive.package', 'Package')}</span>
            <span className="text-right">
              {customer.packageName || '—'}
              {customer.bandwidth ? <span className="ml-1 text-white/50">· {customer.bandwidth}</span> : null}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-xs text-white/50">
            <span>
              {customer.expired ? t('status.expired', 'Expired') : t('marketing.captive.expires', 'Expires')}
            </span>
            <span className="font-mono">{customer.expiresAt ?? '—'}</span>
          </div>
          <div className="mt-3 flex justify-between font-semibold">
            <span className="text-white/60">{t('marketing.captive.due', 'Due')}</span>
            <span className="tabular-nums text-landing-accent">{formatBdtWithSymbol(customer.dueBdt)}</span>
          </div>
        </div>

        {reconnect.data?.message ? (
          <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
            {reconnect.data.message}
          </p>
        ) : reconnect.error ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {reconnect.error.message}
          </p>
        ) : null}

        {canReconnect ? (
          <Button
            className="w-full bg-landing-cta text-white duration-200 ease-out hover:bg-landing-cta-hover"
            disabled={reconnect.isPending}
            onClick={startReconnect}
          >
            {reconnect.isPending
              ? t('marketing.captive.reconnecting', 'Reconnecting…')
              : t('marketing.captive.reconnectNow', 'Reconnect now')}
          </Button>
        ) : (
          <Button
            className="w-full bg-landing-cta text-white duration-200 ease-out hover:bg-landing-cta-hover"
            disabled={pay.isPending}
            onClick={startPayment}
          >
            {pay.isPending
              ? t('marketing.captive.openingPayment', 'Opening payment…')
              : t('marketing.captive.payNow', 'Pay now')}
          </Button>
        )}

        <p className="text-center text-xs text-white/60">
          {canReconnect ? (
            <button
              type="button"
              className="text-landing-accent underline underline-offset-2 disabled:opacity-50"
              disabled={pay.isPending}
              onClick={startPayment}
            >
              {t('marketing.captive.payBill', 'Pay a bill')}
            </button>
          ) : (
            <>
              {t('marketing.captive.alreadyPaid', 'Already paid?')}{' '}
              <button
                type="button"
                className="text-landing-accent underline underline-offset-2 disabled:opacity-50"
                disabled={reconnect.isPending}
                onClick={startReconnect}
              >
                {reconnect.isPending
                  ? t('marketing.captive.reconnecting', 'Reconnecting…')
                  : t('marketing.captive.reconnect', 'Reconnect')}
              </button>
            </>
          )}
          {' · '}
          <Link href="/help" className="text-white/60 underline">
            {t('marketing.captive.help', 'Help')}
          </Link>
        </p>

        {isp && (isp.name || isp.phone) ? (
          <p className="text-center text-xs text-white/60">
            {isp.name}
            {isp.name && isp.phone ? ' · ' : ''}
            {isp.phone ? (
              <a href={`tel:${isp.phone}`} className="font-mono text-white/60 underline">
                {isp.phone}
              </a>
            ) : null}
          </p>
        ) : null}
      </Reveal>
    </div>
  );
}

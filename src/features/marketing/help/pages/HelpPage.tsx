'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/i18n/locale-context';
import { formatCount, formatDate } from '@/lib/format';

const NOTICE_PAGE = { page: 1, perPage: 20 };

/**
 * There is no help-article backend. Signed-in customers (portal mode) see
 * their provider's published notices (GET /v1/news); the public page has no
 * data source and says so instead of listing invented guides.
 */
export function HelpPage({ portal = false }: { portal?: boolean }) {
  const t = useTranslations();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customer', 'news', NOTICE_PAGE],
    queryFn: () => customerService.getNews(NOTICE_PAGE),
    enabled: portal,
  });

  if (portal && isLoading) return <PageSkeleton variant="table" />;
  if (portal && isError) {
    return (
      <EmptyState variant="error"
        title={t('marketing.help.loadFailed', 'Failed to load help')}
        description={error?.message}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const notices = portal ? (data?.items ?? []) : [];

  const body = (
    <div className={portal ? '' : 'mx-auto max-w-2xl'}>
      {!portal && <p className="text-sm font-medium text-landing-accent">ISP Pay BD</p>}
      <h1 className={`font-semibold tracking-tight ${portal ? 'sr-only' : 'mt-2 text-3xl'}`}>
        {t('marketing.help.title', 'Help center')}
      </h1>
      {!portal && (
        <p className="mt-2 text-white/60">
          {t('marketing.help.subtitle', 'Billing, reconnect and support help from your provider')}
        </p>
      )}

      {portal ? (
        notices.length === 0 ? (
          <div className="mt-2">
            <EmptyState
              title={t('marketing.help.emptyTitle', 'No help articles yet')}
              description={t(
                'marketing.help.emptyDesc',
                'Your provider has not published any guides or notices. Open a support ticket and they will answer you directly.',
              )}
            />
            <p className="mt-4 text-center text-sm">
              <Link href="/customer/support/new" className="text-primary font-medium underline">
                {t('marketing.help.openTicket', 'Open a support ticket')}
              </Link>
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm tabular-nums text-muted-foreground">
              {notices.length === 1
                ? t('marketing.help.noticeCountOne', '1 notice from your provider')
                : t('marketing.help.noticeCountMany', '{n} notices from your provider', {
                    n: formatCount(notices.length),
                  })}
            </p>
            <ul className="mt-8 space-y-3">
              {notices.map((n) => (
                <li key={n.id} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-border/60">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-medium">{n.title || t('marketing.help.notice', 'Notice')}</h2>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
                  </div>
                  {n.details && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{n.details}</p>}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              {t('marketing.help.stillStuck', 'Still stuck?')}{' '}
              <Link href="/customer/support/new" className="text-primary font-medium underline">
                {t('marketing.help.openTicket', 'Open a support ticket')}
              </Link>
            </p>
          </>
        )
      ) : (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <p>
            {t(
              'marketing.help.publicNote',
              "Help guides are published by your internet provider inside the customer portal. Sign in to read your provider's notices and to open a support ticket.",
            )}
          </p>
          <p className="mt-4">
            <Link href="/login" className="font-medium text-white underline">
              {t('marketing.help.signIn', 'Sign in to the customer portal')}
            </Link>
          </p>
        </div>
      )}

      {!portal && (
        <p className="mt-10 text-center text-sm text-white/60">
          <Link href="/" className="underline">
            {t('marketing.help.home', 'Home')}
          </Link>
        </p>
      )}
    </div>
  );

  return (
    <div className={portal ? 'space-y-6' : 'min-h-dvh bg-landing-bg px-4 py-16 text-white'}>
      {portal ? body : <Reveal>{body}</Reveal>}
    </div>
  );
}

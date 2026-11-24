'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Package, Phone, Receipt } from 'lucide-react';
import { PageHero, PageContent } from '@/components/motion/PageHero';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ApiError } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatBdPhone, formatDate } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { useCustomerSubscription } from '../hooks/use-customer-subscription';
import { RenewSubscriptionCard } from '../components/RenewSubscriptionCard';
import { MultiMonthBillingCard } from '../components/MultiMonthBillingCard';
import { monthLabel } from '../components/BillingMonthsTable';
import { MONTH_NAMES } from '../lib/billing-months';

/** Admin › customer › Subscription: recharge / extend + multi-month billing manager (PHP customers/subscription.php). */
export function CustomerSubscriptionPage({ id }: { id: string }) {
  const t = useTranslations();
  const {
    data: sub,
    isLoading,
    isError,
    error,
    refetch,
    dataUpdatedAt,
  } = useCustomerSubscription(id);

  if (isLoading) return <PageSkeleton variant="form" rows={6} />;
  if (isError || !sub) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return (
      <EmptyState
        variant="error"
        title={
          forbidden
            ? t('admin.customerBilling.forbidden', 'You cannot manage this customer’s subscription')
            : t('admin.customerBilling.loadFailed', 'Could not load the subscription')
        }
        description={errorMessage(
          error,
          t('admin.customerBilling.notFound', 'The customer was not found.'),
        )}
        actionLabel={forbidden ? undefined : t('admin.customerBilling.retry', 'Retry')}
        onAction={forbidden ? undefined : () => refetch()}
      />
    );
  }

  const current = sub.currentMonthPayment;
  const expiry = sub.expiresAt ? formatDate(sub.expiresAt) : '—';

  return (
    <div className="w-full space-y-6">
      <PageHero className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('admin.customerBilling.backToCustomer', 'Back to customer')}
          render={<Link href={`/admin/customers/${id}`} />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {t('admin.customerBilling.pageTitle', 'Subscription: {name}', {
              name: sub.name || `#${id}`,
            })}
          </h1>
          <p className="text-muted-foreground font-mono text-sm">{sub.username || '—'}</p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">
        <Card>
          <CardContent className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
            <Fact
              icon={<Package className="h-4 w-4" />}
              label={t('admin.customerBilling.package', 'Package')}
            >
              {sub.packageName || '—'}
              {sub.packagePrice > 0 ? (
                <span className="text-muted-foreground">
                  {' '}
                  · <CurrencyDisplay amount={sub.packagePrice} />
                </span>
              ) : null}
            </Fact>
            <Fact
              icon={<CalendarDays className="h-4 w-4" />}
              label={t('admin.customerBilling.expires', 'Expires')}
            >
              {expiry} {sub.status ? <StatusBadge status={sub.status} className="ml-1" /> : null}
            </Fact>
            <Fact
              icon={<Receipt className="h-4 w-4" />}
              label={t('admin.customerBilling.thisMonthPayment', 'This month’s payment')}
            >
              {current ? (
                <>
                  <StatusBadge status={current.status === 'successful' ? 'paid' : 'due'} />{' '}
                  <CurrencyDisplay amount={current.amount} />
                </>
              ) : (
                <span className="text-muted-foreground">
                  {t('admin.customerBilling.noPaymentYet', 'Not recorded yet')}
                </span>
              )}
            </Fact>
            <Fact
              icon={<Phone className="h-4 w-4" />}
              label={t('admin.customerBilling.mobile', 'Mobile')}
            >
              {sub.phone ? (
                <a className="hover:underline" href={`tel:${sub.phone}`}>
                  {formatBdPhone(sub.phone)}
                </a>
              ) : (
                '—'
              )}
            </Fact>
          </CardContent>
        </Card>

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(380px,440px)_minmax(0,1fr)]">
          <RenewSubscriptionCard key={`renew-${dataUpdatedAt}`} sub={sub} />
          <MultiMonthBillingCard
            key={`batch-${dataUpdatedAt}`}
            customerId={id}
            price={sub.packagePrice}
            existing={sub.existing}
          />
        </div>

        {sub.history.length ? (
          <Card>
            <CardContent className="py-4">
              <h2 className="mb-3 text-sm font-semibold">
                {t('admin.customerBilling.history', 'Payment history')}
              </h2>
              <ul className="divide-border/60 divide-y text-sm">
                {sub.history.slice(0, 12).map((p) => {
                  const [y, m] = (p.period || '').split('-').map(Number);
                  const label =
                    y && m
                      ? monthLabel({ month: MONTH_NAMES[m - 1] ?? '', year: y })
                      : p.month || '—';
                  return (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2"
                    >
                      <span className="font-medium">{label}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground">{p.paidVia}</span>
                        <CurrencyDisplay amount={p.amount} />
                        {p.status === 'successful' && p.payAmount !== p.amount ? (
                          <span className="text-muted-foreground text-xs">
                            {t('admin.customerBilling.received', 'received ৳{amount}', {
                              amount: String(p.payAmount),
                            })}
                          </span>
                        ) : null}
                        <StatusBadge
                          status={p.status === 'successful' ? 'paid' : p.status || 'pending'}
                        />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </PageContent>
    </div>
  );
}

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

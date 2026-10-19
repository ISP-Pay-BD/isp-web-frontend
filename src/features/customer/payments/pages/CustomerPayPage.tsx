'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ChevronDown, CreditCard, Info, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  useCustomerSubscription,
  manualPaymentSchema,
  type ManualPaymentInput,
} from '@/features/customer/shared';
import { useRenewSubscription, openPaymentPage } from '@/features/customer/subscription/hooks/use-customer-subscription';
import { useCustomerPayments, useSubmitManualPayment } from '../hooks/use-customer-payments';
import { resolveBackendUrl } from '@/lib/api/adapters/customer.adapter';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Pay the bill. The main action starts the provider's online checkout (bKash / Nagad / card) through the same
 * renewal call as My Subscription, so the line reconnects automatically. Customers who already paid outside the
 * app can still submit a TrxID; staff verify it and it stays *pending* until then.
 */
export function CustomerPayPage() {
  const { t, te } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscription = useCustomerSubscription();
  const renew = useRenewSubscription();
  const payMutation = useSubmitManualPayment();
  const recent = useCustomerPayments({ page: 1, perPage: 10 });
  const monthlyFee = subscription.data?.currentPackage?.priceBdt ?? 0;
  const [manualOpen, setManualOpen] = useState(searchParams.get('manual') === '1');
  const [noGateway, setNoGateway] = useState(false);
  // The renew call creates an invoice every time, so a double tap must not send it twice. A timestamp (not a flag)
  // so the button works again if the customer comes back from the gateway with the browser's Back button.
  const lastCheckoutAt = useRef(0);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<ManualPaymentInput>({
    resolver: zodResolver(manualPaymentSchema),
    values: subscription.data ? { amount: monthlyFee, method: '', trxId: '', accountNumber: '' } : undefined,
    resetOptions: { keepDirtyValues: true },
  });

  const amount = watch('amount');
  const showManual = manualOpen || noGateway;

  // The renew call creates a new invoice every time. A pending payment with no TrxID is an unpaid invoice the
  // customer already has (a manual submission always carries a TrxID), so pay that one instead of piling up more.
  const openInvoice = recent.data?.items.find((p) => p.status === 'pending' && !p.trxId && p.amountBdt > 0);

  const payOnline = () => {
    if (openInvoice) {
      toast.info(t('customer.pay.opening', 'Opening the payment page…'));
      openPaymentPage(resolveBackendUrl(`/payment/make-payment/${openInvoice.id}`));
      return;
    }
    const packageId = subscription.data?.packageId;
    if (!packageId || Date.now() - lastCheckoutAt.current < 10_000) return;
    lastCheckoutAt.current = Date.now();
    renew.mutate(
      { packageId },
      {
        onSuccess: (checkout) => {
          if (checkout.paymentUrl) {
            toast.info(t('customer.pay.opening', 'Opening the payment page…'));
            openPaymentPage(checkout.paymentUrl);
            return;
          }
          lastCheckoutAt.current = 0;
          setNoGateway(true);
          toast.info(checkout.message || t('customer.pay.noGatewayToast', 'Online payment is not available right now.'));
        },
        onError: () => {
          lastCheckoutAt.current = 0;
        },
      },
    );
  };

  const onSubmit = async (values: ManualPaymentInput) => {
    try {
      await payMutation.mutateAsync({
        amount: Number(values.amount),
        method: values.method,
        trxId: values.trxId,
        accountNumber: values.accountNumber,
      });
      toast.success(
        t('customer.pay.submitted', 'Payment submitted for verification. It will show as pending until your provider confirms it.'),
      );
      router.push('/customer/payments');
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  const shellTitle = t('customer.pay.title', 'Pay your bill');

  if (subscription.isLoading) {
    return (
      <CustomerPageShell title={shellTitle} subtitle={t('customer.pay.loading', 'Loading your bill…')}>
        <CustomerLoadingSkeleton variant="form" />
      </CustomerPageShell>
    );
  }

  if (subscription.isError || !subscription.data) {
    return (
      <CustomerPageShell title={shellTitle}>
        <CustomerErrorState message={subscription.error?.message || undefined} onRetry={() => subscription.refetch()} />
      </CustomerPageShell>
    );
  }

  const pkg = subscription.data.currentPackage;
  const validTill = subscription.data.willExpire;

  return (
    <CustomerPageShell
      title={shellTitle}
      subtitle={t('customer.pay.subtitle', 'Pay online in one tap, or submit a payment you already made.')}
      breadcrumbs={[
        { label: t('customer.nav.home', 'Customer'), href: '/customer/dashboard' },
        { label: t('customer.nav.payments', 'Payments'), href: '/customer/payments' },
        { label: t('customer.pay.crumb', 'Pay now') },
      ]}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-medium">{pkg?.name || t('customer.pay.yourPlan', 'Your plan')}</p>
                <p className="text-foreground mt-1 font-mono text-3xl font-bold tabular-nums">{formatBdtWithSymbol(monthlyFee)}</p>
              </div>
              {validTill ? (
                <p className="text-muted-foreground text-sm">
                  {t('customer.pay.validTill', 'Valid till {date}', { date: formatDate(validTill) })}
                </p>
              ) : null}
            </div>

            <Button
              type="button"
              size="lg"
              className="h-12 w-full gap-2 text-base font-semibold"
              onClick={payOnline}
              disabled={renew.isPending || !subscription.data.packageId || (recent.isLoading && !recent.data)}
            >
              {renew.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
              {renew.isPending
                ? t('customer.pay.opening', 'Opening the payment page…')
                : t('customer.pay.online', 'Pay {amount} online', { amount: formatBdtWithSymbol(openInvoice?.amountBdt ?? monthlyFee) })}
            </Button>

            {openInvoice ? (
              <p className="text-muted-foreground text-sm">
                {t('customer.pay.openInvoice', 'You already have an unpaid invoice ({invoice}) — this pays that one.', {
                  invoice: openInvoice.invoice || `#${openInvoice.id}`,
                })}
              </p>
            ) : null}

            <p className="text-muted-foreground flex items-start gap-2 text-sm leading-relaxed">
              <ShieldCheck className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              {t(
                'customer.pay.onlineHint',
                'You will be taken to your provider’s secure payment page (bKash, Nagad or card). Your connection is restored automatically after payment.',
              )}
            </p>
          </CardContent>
        </Card>

        <div className="rounded-xl border">
          <button
            type="button"
            onClick={() => setManualOpen((open) => !open)}
            aria-expanded={showManual}
            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left"
          >
            <span>
              <span className="text-foreground block text-sm font-semibold">
                {t('customer.pay.paidElsewhere', 'Already paid outside the app?')}
              </span>
              <span className="text-muted-foreground block text-sm">
                {t('customer.pay.paidElsewhereAction', 'Submit your transaction ID (TrxID) for verification')}
              </span>
            </span>
            <ChevronDown className={cn('text-muted-foreground h-5 w-5 shrink-0 transition-transform', showManual && 'rotate-180')} />
          </button>

          {showManual ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 border-t p-4 sm:p-5">
              {noGateway ? (
                <div className="flex items-start gap-2.5 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-300">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {t(
                      'customer.pay.noGateway',
                      'Your provider has not enabled online payment yet. Pay by mobile wallet or bank, then submit the transaction ID here.',
                    )}
                  </span>
                </div>
              ) : null}

              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0 pb-3">
                  <CardTitle className="text-base font-bold">{t('customer.pay.amountPaid', 'Amount paid')}</CardTitle>
                  <CardDescription className="text-sm">
                    {t('customer.pay.amountHint', 'Pre-filled with your monthly fee — change it if you paid a different amount.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1.5 px-0">
                  <Label htmlFor="amount">{t('customer.pay.amountLabel', 'Amount (৳ BDT)')}</Label>
                  <div className="relative">
                    <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 font-bold">৳</span>
                    <Input
                      id="amount"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min={0}
                      {...register('amount', { valueAsNumber: true })}
                      className="h-11 pl-8 text-base font-bold"
                    />
                  </div>
                  {errors.amount && <p className="text-destructive text-sm">{te(errors.amount.message ?? '')}</p>}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="method">{t('customer.pay.paidVia', 'Paid via')}</Label>
                  <Input
                    id="method"
                    {...register('method')}
                    placeholder={t('customer.pay.methodPlaceholder', 'Mobile wallet or bank name')}
                    className="h-11"
                  />
                  {errors.method && <p className="text-destructive text-sm">{te(errors.method.message ?? '')}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="accountNumber">{t('customer.pay.sender', 'Sender account / phone (optional)')}</Label>
                    <Input id="accountNumber" inputMode="tel" {...register('accountNumber')} className="h-11 font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="trxId">{t('customer.pay.trxId', 'Transaction ID (TrxID)')}</Label>
                    <Input id="trxId" {...register('trxId')} className="h-11 font-mono uppercase" />
                    {errors.trxId && <p className="text-destructive text-sm">{te(errors.trxId.message ?? '')}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg bg-blue-500/10 p-3 text-sm text-blue-900 dark:text-blue-300">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>
                    {t(
                      'customer.pay.pendingNote',
                      'Submitted payments stay pending and do not extend your subscription until your provider verifies the transaction.',
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="outline" type="button" className="h-11 w-full sm:w-auto" render={<Link href="/customer/payments" />}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={payMutation.isPending} className="h-11 w-full gap-2 font-semibold sm:w-auto">
                  {payMutation.isPending
                    ? t('customer.pay.submitting', 'Submitting…')
                    : t('customer.pay.submit', 'Submit {amount} for verification', {
                        amount: formatBdtWithSymbol(Number.isFinite(amount) ? amount : 0),
                      })}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </CustomerPageShell>
  );
}

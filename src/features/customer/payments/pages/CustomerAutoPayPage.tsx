'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerPageShell, CustomerLoadingSkeleton, useCustomerSubscription } from '@/features/customer/shared';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import {
  useCustomerAutoPay,
  useUpdateCustomerAutoPay,
  type AutoPayInput,
  type AutoPayPreference,
} from '../hooks/use-customer-autopay';

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Renewal: the real expiry (GET /v1/customer/subscription/index) plus the
 * customer's auto-pay preference (GET/PUT /v1/customer/autopay). With auto-pay
 * on, the backend's autopay-reminders cron texts the bill and a pay link for
 * the chosen gateway before expiry — gateways need the customer to approve
 * each payment, so nothing is debited without them.
 */
export function CustomerAutoPayPage() {
  const t = useTranslations();
  const { data, isLoading, isError, error, refetch } = useCustomerSubscription();

  const title = t('customer.autoPay.title', 'Renewal');
  const breadcrumbs = [
    { label: t('customer.nav.home', 'Customer'), href: '/customer/dashboard' },
    { label: t('customer.nav.payments', 'Payments'), href: '/customer/payments' },
    { label: title },
  ];

  if (isLoading) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.autoPay.loading', 'Loading your subscription…')} breadcrumbs={breadcrumbs}>
        <CustomerLoadingSkeleton variant="form" />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title={title} breadcrumbs={breadcrumbs}>
        <EmptyState
          variant="error"
          title={t('customer.autoPay.loadError', 'Failed to load your subscription')}
          description={error?.message}
          actionLabel={t('common.retry', 'Retry')}
          onAction={() => refetch()}
        />
      </CustomerPageShell>
    );
  }

  const pkg = data.currentPackage;

  return (
    <CustomerPageShell
      title={title}
      subtitle={t('customer.autoPay.subtitle', 'How your subscription is renewed')}
      breadcrumbs={breadcrumbs}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="min-w-0 text-base">
              {pkg?.name || t('customer.autoPay.currentSubscription', 'Current subscription')}
            </CardTitle>
            {data.subscriptionStatus ? (
              <StatusBadge
                status={data.subscriptionStatus}
                label={
                  data.isActive
                    ? t('status.active', 'Active')
                    : t('customer.autoPay.statusInactive', titleCase(data.subscriptionStatus))
                }
              />
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <dl className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">{t('customer.autoPay.validUntil', 'Valid until')}</dt>
                <dd className="font-medium tabular-nums">{formatDate(data.willExpire)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">{t('customer.autoPay.lastRenewed', 'Last renewed')}</dt>
                <dd className="font-medium tabular-nums">{formatDate(data.lastRenewed)}</dd>
              </div>
              {pkg && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted-foreground">{t('customer.autoPay.monthlyFee', 'Monthly fee')}</dt>
                  <dd className="font-medium tabular-nums">{formatBdtWithSymbol(pkg.priceBdt)}</dd>
                </div>
              )}
            </dl>
            <p className="leading-relaxed text-muted-foreground">
              {t(
                'customer.autoPay.renewHint',
                'To renew, create a renewal invoice and pay it on your provider’s payment page before the expiry date above.',
              )}
            </p>
            <Button className="h-11 w-full sm:h-9 sm:w-auto" render={<Link href="/customer/subscription" />}>
              {t('customer.autoPay.renewAction', 'Renew from My Subscription')}
            </Button>
          </CardContent>
        </Card>
        <AutoPayPreferenceCard />
      </div>
    </CustomerPageShell>
  );
}

function AutoPayPreferenceCard() {
  const t = useTranslations();
  const autoPay = useCustomerAutoPay();

  return (
    <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
      <CardHeader>
        <CardTitle className="text-base">{t('customer.autoPay.prefTitle', 'Auto-pay preference')}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {t(
            'customer.autoPay.prefDesc',
            'With auto-pay on, we text you the bill and a one-tap pay link for your gateway before renewal. Nothing is charged without your approval.',
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {autoPay.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-28 rounded-lg" />
          </div>
        ) : autoPay.isError || !autoPay.data ? (
          <EmptyState
            variant="error"
            title={t('customer.autoPay.prefUnavailable', 'Auto-pay settings unavailable')}
            description={errorMessage(autoPay.error, t('customer.autoPay.prefLoadError', 'Could not load your auto-pay preference.'))}
            actionLabel={t('common.retry', 'Retry')}
            onAction={() => autoPay.refetch()}
          />
        ) : (
          <AutoPayForm pref={autoPay.data} />
        )}
      </CardContent>
    </Card>
  );
}

function AutoPayForm({ pref }: { pref: AutoPayPreference }) {
  const t = useTranslations();
  const save = useUpdateCustomerAutoPay();
  // Unsaved edits; null = show the stored preference.
  const [draft, setDraft] = useState<AutoPayInput | null>(null);
  const value: AutoPayInput = draft ?? {
    enabled: pref.enabled,
    preferredGateway: pref.preferredGateway,
    notifyDaysBefore: pref.notifyDaysBefore,
  };
  const edit = (patch: Partial<AutoPayInput>) => setDraft({ ...value, ...patch });

  const gatewayItems = Object.fromEntries(pref.gateways.map((g) => [g.slug, g.name]));
  const staleGateway = Boolean(value.preferredGateway) && !gatewayItems[value.preferredGateway as string];
  const noGateways = pref.gateways.length === 0;
  const daysValid =
    Number.isInteger(value.notifyDaysBefore) && value.notifyDaysBefore >= 0 && value.notifyDaysBefore <= pref.notifyDaysMax;
  const canSave = draft !== null && daysValid && (!value.enabled || (Boolean(value.preferredGateway) && !staleGateway));

  const submit = () =>
    save.mutate(value, {
      onSuccess: () => {
        setDraft(null);
        toast.success(t('customer.autoPay.saved', 'Auto-pay preference saved'));
      },
    });

  return (
    <form
      className="space-y-6 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSave) submit();
      }}
    >
      <div className="flex min-h-12 items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <Label htmlFor="autopay-enabled" className="text-sm leading-normal font-semibold">
            {t('customer.autoPay.toggle', 'Auto-pay')}
          </Label>
          <p className="text-sm text-muted-foreground">
            {noGateways
              ? t('customer.autoPay.noGatewayHint', 'Your provider has no online payment gateway enabled yet.')
              : t('customer.autoPay.useGatewayHint', 'Use my preferred gateway for renewals.')}
          </p>
        </div>
        <Switch
          id="autopay-enabled"
          checked={value.enabled}
          disabled={noGateways && !value.enabled}
          onCheckedChange={(checked) => edit({ enabled: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gateway" className="text-sm font-semibold">{t('customer.autoPay.gateway', 'Preferred gateway')}</Label>
        <Select
          value={value.preferredGateway}
          items={gatewayItems}
          disabled={noGateways}
          onValueChange={(v) => edit({ preferredGateway: v ? String(v) : null })}
        >
          <SelectTrigger id="gateway" className="w-full data-[size=default]:h-11" aria-invalid={staleGateway || undefined}>
            <SelectValue
              placeholder={
                noGateways
                  ? t('customer.autoPay.noGateways', 'No gateways available')
                  : t('customer.autoPay.chooseGateway', 'Choose a gateway')
              }
            />
          </SelectTrigger>
          <SelectContent>
            {pref.gateways.map((g) => (
              <SelectItem key={g.slug} value={g.slug}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {staleGateway && (
          <p className="text-sm text-destructive">
            {t('customer.autoPay.staleGateway', 'Your provider no longer offers this gateway. Choose another one.')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="autopay-days" className="text-sm leading-normal font-semibold">
          {t('customer.autoPay.daysLabel', 'Remind me this many days before expiry')}
        </Label>
        <Input
          id="autopay-days"
          type="number"
          inputMode="numeric"
          min={0}
          max={pref.notifyDaysMax}
          className="h-11 w-28 font-mono"
          value={Number.isNaN(value.notifyDaysBefore) ? '' : value.notifyDaysBefore}
          aria-invalid={!daysValid || undefined}
          onChange={(e) => edit({ notifyDaysBefore: e.target.value === '' ? NaN : Number(e.target.value) })}
        />
        {!daysValid && (
          <p className="text-sm text-destructive">
            {t('customer.autoPay.daysError', 'Enter 0 to {max} days.', { max: pref.notifyDaysMax })}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">
          {pref.updatedAt
            ? t('customer.autoPay.lastSaved', 'Last saved {date}', { date: formatDate(pref.updatedAt) })
            : t('customer.autoPay.notSaved', 'Not saved yet')}
        </span>
        <div className="flex gap-2">
          {draft !== null && (
            <Button
              type="button"
              variant="ghost"
              className="h-11 flex-1 sm:h-9 sm:flex-none"
              disabled={save.isPending}
              onClick={() => setDraft(null)}
            >
              {t('customer.autoPay.discard', 'Discard')}
            </Button>
          )}
          <Button type="submit" className="h-11 flex-1 sm:h-9 sm:flex-none" disabled={!canSave || save.isPending}>
            {save.isPending ? t('customer.autoPay.saving', 'Saving…') : t('customer.autoPay.save', 'Save preference')}
          </Button>
        </div>
      </div>
    </form>
  );
}

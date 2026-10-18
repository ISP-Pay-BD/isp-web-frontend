'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PlatformPageHeader, platformDate } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatBdt, formatCount } from '@/lib/format';
import { useAdminBilling, useUpdateAdminBilling } from '@/features/platform/shared/hooks/use-platform-catalog';
import { useTranslations } from '@/i18n/locale-context';
import { intervalUnit, planTypeLabel, statusLabel } from '../lib/labels';

export function AdminBillingModePage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';
  const { data, isLoading, isError, error, refetch } = useAdminBilling(id);
  const update = useUpdateAdminBilling(id);
  const [packageId, setPackageId] = useState('');
  const [confirm, setConfirm] = useState<null | { mode: 'fixed' | 'payg'; packageId?: number }>(null);

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return (
      <EmptyState variant="error"
        title={t('platform.admins.billing.loadFailed', 'Failed to load billing mode')}
        description={error instanceof Error ? error.message : undefined}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const fixedOptions = data.availablePackages.filter((p) => p.planType !== 'payg' && p.id !== data.package?.id);
  const paygAvailable = data.availablePackages.some((p) => p.planType === 'payg');
  const modeLabel = {
    fixed: t('platform.admins.billing.modeFixed', 'Fixed package'),
    payg: t('platform.admins.billing.modePayg', 'Pay-As-You-Go'),
    custom: t('platform.admins.billing.modeCustom', 'Custom package'),
    none: t('platform.admins.billing.modeNone', 'No package'),
  } as const;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.admins.billing.title', 'Tenant billing mode')}
        subtitle={`${data.organizationName ?? data.name} · ${data.email}`}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('common.crumb.admins', 'Admins'), href: '/platform/admins' },
          { label: t('platform.admins.list.billing', 'Billing') },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t('platform.admins.billing.currentPlan', 'Current plan')}</CardTitle>
            <Badge variant="outline">{modeLabel[data.mode]}</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <Label>{t('platform.admins.billing.package', 'Package')}</Label>
              <p className="mt-1 font-medium">
                {data.package
                  ? `${data.package.name} — ৳${formatBdt(data.package.priceBdt)} / ${intervalUnit(t, data.package.pricingType)}`
                  : t('platform.admins.billing.noPackageAssigned', 'No package assigned')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('platform.admins.billing.subscription', 'Subscription')}</Label>
                <p className="mt-1 capitalize">{data.subscriptionStatus ? statusLabel(t, data.subscriptionStatus) : '—'}</p>
              </div>
              <div>
                <Label>{data.mode === 'payg' ? t('platform.admins.billing.nextCharge', 'Next wallet charge') : t('platform.admins.billing.paidUntil', 'Paid until')}</Label>
                <p className="mt-1 font-mono text-xs">{platformDate(data.willExpire)}</p>
              </div>
              {data.trialEndsAt ? (
                <div>
                  <Label>{t('platform.admins.billing.trialEnds', 'Trial ends')}</Label>
                  <p className="mt-1 font-mono text-xs">{platformDate(data.trialEndsAt)}</p>
                </div>
              ) : null}
              <div>
                <Label>{t('platform.admins.billing.wallet', 'Wallet')}</Label>
                <p className="mt-1 font-medium tabular-nums">
                  {data.wallet ? `৳${formatBdt(data.wallet.balanceBdt)}` : t('platform.admins.billing.noWallet', 'No wallet yet')}
                </p>
              </div>
            </div>
            {data.paygEstimate ? (
              <div className="rounded-lg bg-muted/40 p-3 text-xs">
                <p className="font-medium">{t('platform.admins.billing.monthlyCharge', 'Monthly wallet charge at current usage')}</p>
                <p className="mt-1 text-muted-foreground">
                  {t('platform.admins.billing.estimate', '৳{base} base + {count} subscribers × ৳{rate} =', {
                    base: formatBdt(data.paygEstimate.baseFee),
                    count: formatCount(data.paygEstimate.customers),
                    rate: formatBdt(data.paygEstimate.perUserRate),
                  })}{' '}
                  <span className="font-semibold text-foreground">৳{formatBdt(data.paygEstimate.monthlyTotal)}</span>
                </p>
                <p className="mt-1 text-muted-foreground">{t('platform.admins.billing.minTopup', 'Minimum top-up ৳{amount}', { amount: formatBdt(data.paygEstimate.minTopup) })}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
          <CardHeader>
            <CardTitle className="text-base">{t('platform.admins.billing.change', 'Change billing')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              {t(
                'platform.admins.billing.changeHint',
                'The current paid period is kept. Pay-As-You-Go bills the tenant wallet every cycle; a fixed package renews by invoice.',
              )}
            </p>
            {data.mode !== 'payg' ? (
              <Button
                size="sm"
                variant="outline"
                disabled={!paygAvailable || update.isPending}
                onClick={() => setConfirm({ mode: 'payg' })}
              >
                {t('platform.admins.billing.switchPayg', 'Switch to Pay-As-You-Go')}
              </Button>
            ) : null}
            {!paygAvailable && data.mode !== 'payg' ? (
              <p className="text-xs text-muted-foreground">
                {t('platform.admins.billing.noPaygPlan', 'No active Pay-As-You-Go plan exists.')}{' '}
                <Link href="/platform/admins/packages" className="underline">
                  {t('platform.admins.billing.createOne', 'Create one')}
                </Link>
                .
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="billing-package">{t('platform.admins.billing.assignLabel', 'Assign a fixed or custom package')}</Label>
              <div className="flex gap-2">
                <select
                  id="billing-package"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">{t('platform.admins.billing.selectPackage', 'Select a package')}</option>
                  {fixedOptions.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name} — ৳{formatBdt(p.priceBdt)} ({planTypeLabel(t, p.planType)})
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  disabled={!packageId || update.isPending}
                  onClick={() => setConfirm({ mode: 'fixed', packageId: Number(packageId) })}
                >
                  {t('platform.admins.billing.assign', 'Assign')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.mode === 'payg' ? t('platform.admins.billing.confirmPayg', 'Switch this tenant to Pay-As-You-Go?') : t('platform.admins.billing.confirmAssign', 'Assign the selected package?')}
        description={t('platform.admins.billing.confirmDesc', 'This changes how the tenant is billed from the next renewal. The change is audit-logged.')}
        confirmLabel={update.isPending ? t('platform.admins.billing.saving', 'Saving…') : t('common.confirm', 'Confirm')}
        onConfirm={() =>
          confirm &&
          update.mutate(
            confirm.mode === 'payg' ? { mode: 'payg' } : { mode: 'fixed', package_id: confirm.packageId },
            {
              onSuccess: () => setPackageId(''),
              onSettled: () => setConfirm(null),
            },
          )
        }
      />
    </div>
  );
}

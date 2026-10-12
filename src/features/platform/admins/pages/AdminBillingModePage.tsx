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
import { formatBdt } from '@/lib/format';
import { useAdminBilling, useUpdateAdminBilling } from '@/features/platform/shared/hooks/use-platform-catalog';

const MODE_LABEL = { fixed: 'Fixed package', payg: 'Pay-As-You-Go', custom: 'Custom package', none: 'No package' } as const;

export function AdminBillingModePage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';
  const { data, isLoading, isError, error, refetch } = useAdminBilling(id);
  const update = useUpdateAdminBilling(id);
  const [packageId, setPackageId] = useState('');
  const [confirm, setConfirm] = useState<null | { mode: 'fixed' | 'payg'; packageId?: number }>(null);

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load billing mode"
        description={error instanceof Error ? error.message : undefined}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const fixedOptions = data.availablePackages.filter((p) => p.planType !== 'payg' && p.id !== data.package?.id);
  const paygAvailable = data.availablePackages.some((p) => p.planType === 'payg');

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Tenant billing mode"
        subtitle={`${data.organizationName ?? data.name} · ${data.email}`}
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Admins', href: '/platform/admins' },
          { label: 'Billing' },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Current plan</CardTitle>
            <Badge variant="outline">{MODE_LABEL[data.mode]}</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <Label>Package</Label>
              <p className="mt-1 font-medium">
                {data.package
                  ? `${data.package.name} — ৳${formatBdt(data.package.priceBdt)} / ${data.package.pricingType}`
                  : 'No package assigned'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Subscription</Label>
                <p className="mt-1 capitalize">{data.subscriptionStatus ?? '—'}</p>
              </div>
              <div>
                <Label>{data.mode === 'payg' ? 'Next wallet charge' : 'Paid until'}</Label>
                <p className="mt-1 font-mono text-xs">{platformDate(data.willExpire)}</p>
              </div>
              {data.trialEndsAt ? (
                <div>
                  <Label>Trial ends</Label>
                  <p className="mt-1 font-mono text-xs">{platformDate(data.trialEndsAt)}</p>
                </div>
              ) : null}
              <div>
                <Label>Wallet</Label>
                <p className="mt-1 font-medium tabular-nums">
                  {data.wallet ? `৳${formatBdt(data.wallet.balanceBdt)}` : 'No wallet yet'}
                </p>
              </div>
            </div>
            {data.paygEstimate ? (
              <div className="rounded-lg bg-muted/40 p-3 text-xs">
                <p className="font-medium">Monthly wallet charge at current usage</p>
                <p className="mt-1 text-muted-foreground">
                  ৳{formatBdt(data.paygEstimate.baseFee)} base + {data.paygEstimate.customers.toLocaleString()} subscribers × ৳
                  {formatBdt(data.paygEstimate.perUserRate)} ={' '}
                  <span className="font-semibold text-foreground">৳{formatBdt(data.paygEstimate.monthlyTotal)}</span>
                </p>
                <p className="mt-1 text-muted-foreground">Minimum top-up ৳{formatBdt(data.paygEstimate.minTopup)}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
          <CardHeader>
            <CardTitle className="text-base">Change billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              The current paid period is kept. Pay-As-You-Go bills the tenant wallet every cycle; a fixed package renews by
              invoice.
            </p>
            {data.mode !== 'payg' ? (
              <Button
                size="sm"
                variant="outline"
                disabled={!paygAvailable || update.isPending}
                onClick={() => setConfirm({ mode: 'payg' })}
              >
                Switch to Pay-As-You-Go
              </Button>
            ) : null}
            {!paygAvailable && data.mode !== 'payg' ? (
              <p className="text-xs text-muted-foreground">
                No active Pay-As-You-Go plan exists.{' '}
                <Link href="/platform/admins/packages" className="underline">
                  Create one
                </Link>
                .
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="billing-package">Assign a fixed or custom package</Label>
              <div className="flex gap-2">
                <select
                  id="billing-package"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select a package</option>
                  {fixedOptions.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name} — ৳{formatBdt(p.priceBdt)} ({p.planType})
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  disabled={!packageId || update.isPending}
                  onClick={() => setConfirm({ mode: 'fixed', packageId: Number(packageId) })}
                >
                  Assign
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.mode === 'payg' ? 'Switch this tenant to Pay-As-You-Go?' : 'Assign the selected package?'}
        description="This changes how the tenant is billed from the next renewal. The change is audit-logged."
        confirmLabel={update.isPending ? 'Saving…' : 'Confirm'}
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

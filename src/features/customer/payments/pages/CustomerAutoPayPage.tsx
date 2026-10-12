'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomerSubscription } from '@/features/customer/shared';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import {
  useCustomerAutoPay,
  useUpdateCustomerAutoPay,
  type AutoPayInput,
  type AutoPayPreference,
} from '../hooks/use-customer-autopay';

/**
 * Renewal: the real expiry (GET /v1/customer/subscription/index) plus the
 * customer's auto-pay preference (GET/PUT /v1/customer/autopay). With auto-pay
 * on, the backend's autopay-reminders cron texts the bill and a pay link for
 * the chosen gateway before expiry — gateways need the customer to approve
 * each payment, so nothing is debited without them.
 */
export function CustomerAutoPayPage() {
  const { data, isLoading, isError, error, refetch } = useCustomerSubscription();

  if (isLoading) return <PageSkeleton variant="detail" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load your subscription"
        description={error?.message}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const pkg = data.currentPackage;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Renewal"
        subtitle="How your subscription is renewed"
        breadcrumb={[
          { label: 'Dashboard', url: '/customer/dashboard' },
          { label: 'Payments', url: '/customer/payments' },
          { label: 'Renewal' },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{pkg?.name || 'Current subscription'}</CardTitle>
            <Badge variant="outline" className="capitalize">
              {data.subscriptionStatus || '—'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid until</span>
                <span className="font-mono">{formatDate(data.willExpire)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last renewed</span>
                <span className="font-mono">{formatDate(data.lastRenewed)}</span>
              </div>
              {pkg && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly fee</span>
                  <span className="font-mono">{formatBdtWithSymbol(pkg.priceBdt)}</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">
              To renew, create a renewal invoice and pay it on your provider&apos;s payment page before the expiry date
              above.
            </p>
            <Link href="/customer/subscription">
              <Button size="sm">Renew from My Subscription</Button>
            </Link>
          </CardContent>
        </Card>
        <AutoPayPreferenceCard />
      </div>
    </div>
  );
}

function AutoPayPreferenceCard() {
  const autoPay = useCustomerAutoPay();

  return (
    <Card className="border-border/60 shadow-sm ring-1 ring-border/60">
      <CardHeader>
        <CardTitle className="text-base">Auto-pay preference</CardTitle>
        <CardDescription>
          With auto-pay on, we text you the bill and a one-tap pay link for your gateway before renewal. Nothing is
          charged without your approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {autoPay.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        ) : autoPay.isError || !autoPay.data ? (
          <EmptyState
            title="Auto-pay settings unavailable"
            description={errorMessage(autoPay.error, 'Could not load your auto-pay preference.')}
            actionLabel="Retry"
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
        toast.success('Auto-pay preference saved');
      },
    });

  return (
    <form
      className="space-y-5 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSave) submit();
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <Label htmlFor="autopay-enabled" className="text-sm font-medium">
            Auto-pay
          </Label>
          <p className="text-muted-foreground text-xs">
            {noGateways ? 'Your provider has no online payment gateway enabled yet.' : 'Use my preferred gateway for renewals.'}
          </p>
        </div>
        <Switch
          id="autopay-enabled"
          checked={value.enabled}
          disabled={noGateways && !value.enabled}
          onCheckedChange={(checked) => edit({ enabled: checked })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Preferred gateway</Label>
        <Select
          value={value.preferredGateway}
          items={gatewayItems}
          disabled={noGateways}
          onValueChange={(v) => edit({ preferredGateway: v ? String(v) : null })}
        >
          <SelectTrigger className="w-full" aria-invalid={staleGateway || undefined}>
            <SelectValue placeholder={noGateways ? 'No gateways available' : 'Choose a gateway'} />
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
          <p className="text-destructive text-xs">Your provider no longer offers this gateway. Choose another one.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="autopay-days" className="text-xs font-semibold">
          Remind me this many days before expiry
        </Label>
        <Input
          id="autopay-days"
          type="number"
          inputMode="numeric"
          min={0}
          max={pref.notifyDaysMax}
          className="w-28 font-mono"
          value={Number.isNaN(value.notifyDaysBefore) ? '' : value.notifyDaysBefore}
          aria-invalid={!daysValid || undefined}
          onChange={(e) => edit({ notifyDaysBefore: e.target.value === '' ? NaN : Number(e.target.value) })}
        />
        {!daysValid && <p className="text-destructive text-xs">Enter 0 to {pref.notifyDaysMax} days.</p>}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-xs">
          {pref.updatedAt ? `Last saved ${formatDate(pref.updatedAt)}` : 'Not saved yet'}
        </span>
        <div className="flex gap-2">
          {draft !== null && (
            <Button type="button" size="sm" variant="ghost" disabled={save.isPending} onClick={() => setDraft(null)}>
              Discard
            </Button>
          )}
          <Button type="submit" size="sm" disabled={!canSave || save.isPending}>
            {save.isPending ? 'Saving…' : 'Save preference'}
          </Button>
        </div>
      </div>
    </form>
  );
}

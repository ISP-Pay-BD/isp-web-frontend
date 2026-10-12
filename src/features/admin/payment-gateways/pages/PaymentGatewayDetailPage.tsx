'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ApiError } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatDateTime } from '@/lib/format';
import { usePaymentGateway, useUpdatePaymentGateway, type PaymentGateway } from '../hooks/use-payment-gateways';

export function PaymentGatewayDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: gw, isLoading, isError, error, refetch } = usePaymentGateway(id);

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !gw) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <EmptyState
        title={notFound ? 'Gateway not found' : 'Failed to load gateway'}
        description={notFound ? 'This payment gateway is not supported.' : errorMessage(error)}
        actionLabel={notFound ? 'Back to gateways' : 'Retry'}
        onAction={() => (notFound ? router.push('/admin/payment-gateways') : refetch())}
      />
    );
  }

  // Keyed so the form re-initialises after a save returns fresh values.
  return <GatewayForm key={`${gw.id}:${gw.mode}:${gw.chargePercent}:${gw.enabled}:${gw.fields.map((f) => `${f.key}=${f.configured}`).join(',')}`} gw={gw} />;
}

function GatewayForm({ gw }: { gw: PaymentGateway }) {
  const update = useUpdatePaymentGateway();
  const [mode, setMode] = useState<'sandbox' | 'live'>(gw.mode);
  const [enabled, setEnabled] = useState(gw.enabled);
  const [charge, setCharge] = useState(String(gw.chargePercent));
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(gw.fields.map((f) => [f.key, f.secret ? '' : (f.value ?? '')])),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const readOnly = !gw.editable;

  const save = async () => {
    setFieldErrors({});
    const credentials: Record<string, string> = {};
    for (const f of gw.fields) {
      const v = (values[f.key] ?? '').trim();
      if (f.secret ? v !== '' : v !== (f.value ?? '')) credentials[f.key] = v;
    }
    try {
      await update.mutateAsync({
        id: gw.id,
        update: { mode, enabled, chargePercent: Number(charge), credentials },
      });
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(err.details).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]),
          ),
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={gw.name}
        subtitle="Merchant credentials, mode and gateway charge"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Payment Gateways', url: '/admin/payment-gateways' },
          { label: gw.name },
        ]}
        actions={
          readOnly ? undefined : (
            <Button onClick={save} disabled={update.isPending}>
              {update.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Save
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Configuration
              <Badge variant={gw.mode === 'live' ? 'default' : 'secondary'}>{gw.mode}</Badge>
              {gw.configured ? null : <Badge variant="outline">Incomplete</Badge>}
            </CardTitle>
            <CardDescription>
              {readOnly
                ? 'Read-only — only the ISP admin account can change gateway credentials.'
                : 'Secret values are never shown. Leave a secret empty to keep the saved value.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div>
                <Label>Enabled for customers</Label>
                <p className="text-xs text-muted-foreground">Requires every credential below.</p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} disabled={readOnly} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={mode} onValueChange={(v) => v && setMode(v as 'sandbox' | 'live')} disabled={readOnly}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gateway charge (%)</Label>
                <Input type="number" min={0} max={10} step="0.01" value={charge} onChange={(e) => setCharge(e.target.value)} disabled={readOnly} />
                {fieldErrors.charge_percent ? <p className="text-xs text-destructive">{fieldErrors.charge_percent}</p> : null}
              </div>
            </div>
            {gw.fields.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label className="flex items-center gap-2">
                  {f.label}
                  {f.configured ? <Badge variant="secondary" className="text-[10px]">saved</Badge> : <Badge variant="outline" className="text-[10px]">missing</Badge>}
                </Label>
                <Input
                  type={f.secret ? 'password' : 'text'}
                  autoComplete="off"
                  value={values[f.key] ?? ''}
                  placeholder={f.secret && f.configured ? `${f.masked ?? '••••••••'} (unchanged)` : ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  disabled={readOnly}
                  className="font-mono text-xs"
                />
                {fieldErrors[f.key] ? <p className="text-xs text-destructive">{fieldErrors[f.key]}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 h-fit">
          <CardHeader>
            <CardTitle className="text-base">Settlements</CardTitle>
            <CardDescription>From your payments ledger, last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatRow label="Transactions" value={String(gw.transactions30d)} />
            <StatRow label="Success rate" value={gw.successRatePct === null ? '—' : `${gw.successRatePct}%`} />
            <StatRow label="Volume" value={`৳${gw.volume30d.toLocaleString()}`} />
            <StatRow label="Today" value={`৳${gw.todayVolume.toLocaleString()}`} />
            <StatRow label="Last settlement" value={gw.lastSettlementAt ? formatDateTime(gw.lastSettlementAt) : '—'} />
            <div className="space-y-1 pt-2 border-t border-border/50">
              <Label className="text-xs">Callback URL</Label>
              <Input readOnly value={gw.callbackUrl} className="font-mono text-xs" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold text-foreground">{value}</span>
    </div>
  );
}

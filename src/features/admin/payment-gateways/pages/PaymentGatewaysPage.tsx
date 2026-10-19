'use client';

import { useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button, buttonVariants } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CreditCard, Link2, RefreshCw, Activity, ShieldCheck, Sliders, DollarSign, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime, formatBdtWithSymbol } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import { usePaymentGateways, useUpdatePaymentGateway } from '../hooks/use-payment-gateways';

export function PaymentGatewaysPage() {
  const t = useTranslations();
  const { data, isLoading, isError, error, isFetching, refetch } = usePaymentGateways();
  const update = useUpdatePaymentGateway();
  const list = useMemo(() => data?.items ?? [], [data]);

  const stats = useMemo(() => {
    const configured = list.filter((g) => g.configured).length;
    const active = list.filter((g) => g.enabled).length;
    const todayVolume = list.reduce((s, g) => s + g.todayVolume, 0);
    const rated = list.filter((g) => g.successRatePct !== null);
    const avgSuccess = rated.length ? Math.round(rated.reduce((s, g) => s + (g.successRatePct ?? 0), 0) / rated.length) : null;
    return { configured, active, todayVolume, avgSuccess };
  }, [list]);

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (isError || !data) {
    return (
      <EmptyState variant="error"
        title={t('admin.paymentGateways.list.loadFailed', 'Failed to load payment gateways')}
        description={errorMessage(error)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.paymentGateways.list.title', 'Payment Gateways & Merchant Settlements')}
        subtitle={t('admin.paymentGateways.list.subtitle', 'Online gateways your customers pay through — credentials, charges and the last 30 days of settlements.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.payment_gateways', 'Payment Gateways') },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            {t('admin.paymentGateways.list.refresh', 'Refresh')}
          </Button>
        }
      />

      {!data.editable ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" /> {t('admin.paymentGateways.list.readOnlyNote', 'Gateway credentials are managed by your ISP admin account; you can view them here.')}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={t('admin.paymentGateways.list.kpiConfigured', 'Configured')} value={`${stats.configured} / ${list.length}`} hint={t('admin.paymentGateways.list.kpiConfiguredHint', 'All credentials present')} icon={<CreditCard className="h-4 w-4" />} tone="text-purple-400 bg-purple-500/10 border-purple-500/20" />
        <Kpi label={t('admin.paymentGateways.list.kpiEnabled', 'Enabled')} value={String(stats.active)} hint={t('admin.paymentGateways.list.kpiEnabledHint', 'Offered to customers')} icon={<ShieldCheck className="h-4 w-4" />} tone="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" />
        <Kpi label={t('admin.paymentGateways.list.kpiToday', "Today's gateway volume")} value={`${formatBdtWithSymbol(stats.todayVolume)}`} hint={t('admin.paymentGateways.list.kpiTodayHint', 'Settled today')} icon={<DollarSign className="h-4 w-4" />} tone="text-blue-400 bg-blue-500/10 border-blue-500/20" />
        <Kpi
          label={t('admin.paymentGateways.list.kpiSuccess', 'Avg. success rate')}
          value={stats.avgSuccess === null ? '—' : `${stats.avgSuccess}%`}
          hint={t('admin.paymentGateways.list.kpiSuccessHint', 'Last 30 days')}
          icon={<Activity className="h-4 w-4" />}
          tone="text-amber-400 bg-amber-500/10 border-amber-500/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((gw) => (
          <Card
            key={gw.id}
            className={cn(
              'border border-border/70 bg-card/60 backdrop-blur-md shadow-sm hover:border-primary/50 hover:bg-card/90 transition duration-200 overflow-hidden',
              !gw.enabled && 'opacity-75',
            )}
          >
            <CardHeader className="p-5 border-b border-border/50 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-foreground">{gw.name}</CardTitle>
                  <Badge
                    variant="outline"
                    tone={gw.mode === 'live' ? 'success' : 'warning'} className="text-xs font-semibold uppercase"
                  >
                    {gw.mode === 'live' ? t('admin.paymentGateways.mode.live', 'Live') : t('admin.paymentGateways.mode.sandbox', 'Sandbox')}
                  </Badge>
                  {!gw.configured ? (
                    <Badge variant="outline" className="text-xs text-muted-foreground">{t('admin.paymentGateways.list.notConfigured', 'Not configured')}</Badge>
                  ) : null}
                </div>
                <CardDescription className="font-mono text-xs text-muted-foreground">
                  {gw.merchantId || t('admin.paymentGateways.list.noMerchantId', 'No merchant id saved')} · {t('admin.paymentGateways.list.charge', 'charge {pct}%', { pct: gw.chargePercent })}
                </CardDescription>
              </div>
              <Switch
                checked={gw.enabled}
                disabled={!data.editable || update.isPending || (!gw.enabled && !gw.configured)}
                onCheckedChange={(checked) => update.mutate({ id: gw.id, update: { enabled: checked } })}
                aria-label={t('admin.paymentGateways.list.enableAria', 'Enable {name}', { name: gw.name })}
              />
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{t('admin.paymentGateways.list.today', 'Today')}</p>
                  <p className="text-sm font-bold font-mono text-foreground">{formatBdtWithSymbol(gw.todayVolume)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{t('admin.paymentGateways.list.days30', '30 days')}</p>
                  <p className="text-sm font-bold font-mono text-foreground">{formatBdtWithSymbol(gw.volume30d)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{t('admin.paymentGateways.list.success', 'Success')}</p>
                  <p className="text-sm font-bold font-mono text-emerald-500">{gw.successRatePct === null ? '—' : `${gw.successRatePct}%`}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{t('admin.paymentGateways.list.lastSettlement', 'Last settlement:')}</span>
                <span className="font-mono text-foreground">{gw.lastSettlementAt ? formatDateTime(gw.lastSettlementAt) : '—'}</span>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                <Link2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate font-mono text-xs">{gw.callbackUrl}</span>
              </div>

              <div className="pt-2 border-t border-border/50 flex justify-end">
                <Link
                  href={`/admin/payment-gateways/${gw.id}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs h-8 gap-1.5 border-border/80 hover:bg-accent')}
                >
                  <Sliders className="h-3.5 w-3.5" /> {data.editable ? t('admin.paymentGateways.list.configure', 'Configure credentials') : t('admin.paymentGateways.list.viewConfig', 'View configuration')}
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, hint, icon, tone }: { label: string; value: string; hint: string; icon: ReactNode; tone: string }) {
  return (
    <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className={cn('p-2 rounded-lg border', tone)}>{icon}</div>
        </div>
        <div className="mt-2 text-2xl font-black font-mono text-foreground">{value}</div>
        <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

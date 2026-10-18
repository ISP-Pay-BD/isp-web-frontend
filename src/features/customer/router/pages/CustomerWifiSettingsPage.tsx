'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wifi, Lock, ArrowLeft, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  updateWifiSchema,
  WIFI_BANDS,
  type UpdateWifiInput,
} from '@/features/customer/shared';
import { useChangeWifi, useRouterTargets } from '../hooks/use-customer-router';
import { RouterActionResultPanel } from '../components/RouterActionResultPanel';
import { useLocale } from '@/i18n/locale-context';
import type { RouterActionResult } from '@/lib/api/adapters/customer.adapter';

export function CustomerWifiSettingsPage() {
  const { t, te } = useLocale();
  const targets = useRouterTargets();
  const changeWifi = useChangeWifi();
  const [result, setResult] = useState<RouterActionResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateWifiInput>({
    resolver: zodResolver(updateWifiSchema),
    // The backend never returns the current SSID/password, so the form starts empty.
    defaultValues: { ssid: '', password: '', band: 'both', targetId: undefined },
  });

  const targetId = watch('targetId');

  const onSubmit = (values: UpdateWifiInput) => {
    changeWifi.mutate(
      { ssid: values.ssid, password: values.password, band: values.band, targetId: values.targetId },
      {
        onSuccess: (res) => {
          setResult(res);
          if (res.status === 'success') reset({ ssid: '', password: '', band: values.band, targetId: values.targetId });
        },
      },
    );
  };

  const title = t('customer.wifi.title', 'Wi-Fi settings');
  const crumbs = [
    { label: t('customer.nav.home', 'Customer'), href: '/customer/dashboard' },
    { label: t('customer.router.crumb', 'Router'), href: '/customer/router' },
    { label: title },
  ];

  if (targets.isLoading) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.wifi.loading', 'Loading your router…')} breadcrumbs={crumbs}>
        <CustomerLoadingSkeleton variant="form" />
      </CustomerPageShell>
    );
  }

  if (targets.isError || !targets.data) {
    return (
      <CustomerPageShell title={title} breadcrumbs={crumbs}>
        <CustomerErrorState message={targets.error?.message || undefined} onRetry={() => targets.refetch()} />
      </CustomerPageShell>
    );
  }

  const list = targets.data;
  const selected = list.find((router) => router.id === targetId) ?? list[0];
  const isAuto = selected?.actions.changeWifi === 'auto';
  const myRouter = t('customer.router.myRouter', 'My router');

  const bandLabels: Record<(typeof WIFI_BANDS)[number], string> = {
    both: t('customer.wifi.bandBoth', 'Both bands'),
    '2g': t('customer.wifi.band2g', '2.4 GHz only'),
    '5g': t('customer.wifi.band5g', '5 GHz only'),
  };

  return (
    <CustomerPageShell
      title={title}
      subtitle={t('customer.wifi.subtitle', 'Change your wireless network name (SSID) and password.')}
      breadcrumbs={crumbs}
      actions={
        <Button variant="outline" className="h-11 w-full gap-2 sm:w-auto" render={<Link href="/customer/router" />}>
          <ArrowLeft className="h-4 w-4" />
          {t('customer.wifi.back', 'Back to router tools')}
        </Button>
      }
    >
      <div className="mx-auto max-w-xl space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Wifi className="text-primary h-5 w-5" />
                {t('customer.wifi.cardTitle', 'Wireless network')}
              </CardTitle>
              <CardDescription className="text-sm">
                {isAuto
                  ? t('customer.wifi.autoHint', 'The change is sent to your router remotely.')
                  : t('customer.wifi.manualHint', 'Your router cannot be changed remotely — you will get step-by-step instructions instead.')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {list.length > 1 && (
                <div className="space-y-1.5">
                  <Label htmlFor="router">{t('customer.wifi.router', 'Router')}</Label>
                  <Select
                    items={Object.fromEntries(list.map((router) => [router.id, router.label || myRouter]))}
                    value={selected?.id ?? ''}
                    onValueChange={(val) => setValue('targetId', val ? String(val) : undefined)}
                  >
                    <SelectTrigger id="router" className="w-full data-[size=default]:h-11">
                      <SelectValue placeholder={t('customer.wifi.selectRouter', 'Select router')} />
                    </SelectTrigger>
                    <SelectContent>
                      {list.map((router) => (
                        <SelectItem key={router.id} value={router.id}>
                          {router.label || myRouter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="ssid">{t('customer.wifi.ssid', 'Wi-Fi network name (SSID)')}</Label>
                <Input id="ssid" autoComplete="off" autoCapitalize="none" className="h-11" {...register('ssid')} />
                {errors.ssid && <p className="text-destructive text-sm">{te(errors.ssid.message ?? '')}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t('customer.wifi.password', 'New Wi-Fi password')}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('customer.wifi.passwordPlaceholder', 'At least 8 characters')}
                  className="h-11"
                  {...register('password')}
                />
                {errors.password && <p className="text-destructive text-sm">{te(errors.password.message ?? '')}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="band">{t('customer.wifi.band', 'Band')}</Label>
                <Select
                  items={bandLabels}
                  value={watch('band')}
                  onValueChange={(val) => val && setValue('band', val as UpdateWifiInput['band'])}
                >
                  <SelectTrigger id="band" className="w-full data-[size=default]:h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WIFI_BANDS.map((band) => (
                      <SelectItem key={band} value={band}>
                        {bandLabels[band]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-xl border p-3.5 text-sm">
                <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <p>{t('customer.wifi.reconnectNote', 'After a successful change, devices on your Wi-Fi must reconnect with the new password.')}</p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                <Button variant="ghost" type="button" className="h-11 w-full sm:w-auto" render={<Link href="/customer/router" />}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={changeWifi.isPending} className="h-11 w-full gap-2 font-semibold sm:w-auto">
                  {changeWifi.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {changeWifi.isPending ? t('customer.wifi.sending', 'Sending…') : t('customer.wifi.save', 'Save Wi-Fi settings')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {result && <RouterActionResultPanel title={t('customer.wifi.resultTitle', 'Wi-Fi change')} result={result} />}
      </div>
    </CustomerPageShell>
  );
}

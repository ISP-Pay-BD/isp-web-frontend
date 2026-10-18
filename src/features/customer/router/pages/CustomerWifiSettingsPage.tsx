'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wifi, Lock, ArrowLeft, Info } from 'lucide-react';
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
import type { RouterActionResult } from '@/lib/api/adapters/customer.adapter';

/** Labels for the backend's `band` values (both | 2g | 5g). */
const BAND_LABELS: Record<(typeof WIFI_BANDS)[number], string> = {
  both: 'Both bands',
  '2g': '2.4 GHz only',
  '5g': '5 GHz only',
};

export function CustomerWifiSettingsPage() {
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

  if (targets.isLoading) {
    return (
      <CustomerPageShell title="WiFi Settings" subtitle="Loading your router...">
        <CustomerLoadingSkeleton variant="form" />
      </CustomerPageShell>
    );
  }

  if (targets.isError || !targets.data) {
    return (
      <CustomerPageShell title="WiFi Settings" subtitle="Wireless network settings">
        <CustomerErrorState message={targets.error?.message || undefined} onRetry={() => targets.refetch()} />
      </CustomerPageShell>
    );
  }

  const list = targets.data;
  const selected = list.find((t) => t.id === targetId) ?? list[0];
  const isAuto = selected?.actions.changeWifi === 'auto';

  return (
    <CustomerPageShell
      title="WiFi Settings"
      subtitle="Change your wireless network name (SSID) and password."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Router', href: '/customer/router' },
        { label: 'WiFi Settings' },
      ]}
      actions={
        <Link href="/customer/router">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Router Tools
          </Button>
        </Link>
      }
    >
      <div className="max-w-xl mx-auto space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                Wireless Network Configuration
              </CardTitle>
              <CardDescription className="text-xs">
                {isAuto
                  ? 'The change is sent to your router remotely.'
                  : 'Your router cannot be changed remotely — you will get step-by-step instructions instead.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {list.length > 1 && (
                <div className="space-y-1.5">
                  <Label>Router</Label>
                  <Select
                    items={Object.fromEntries(list.map((t) => [t.id, t.label || 'My router']))}
                    value={selected?.id ?? ''}
                    onValueChange={(val) => setValue('targetId', val ? String(val) : undefined)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select router" />
                    </SelectTrigger>
                    <SelectContent>
                      {list.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.label || 'My router'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="ssid">WiFi Network Name (SSID)</Label>
                <Input id="ssid" autoComplete="off" {...register('ssid')} />
                {errors.ssid && <p className="text-xs text-destructive">{errors.ssid.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">New WiFi Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  {...register('password')}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Band</Label>
                <Select
                  items={BAND_LABELS}
                  value={watch('band')}
                  onValueChange={(val) => val && setValue('band', val as UpdateWifiInput['band'])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WIFI_BANDS.map((band) => (
                      <SelectItem key={band} value={band}>
                        {BAND_LABELS[band]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3.5 rounded-xl border bg-muted/40 text-xs flex items-start gap-2 text-muted-foreground">
                <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p>After a successful change, devices on your WiFi must reconnect with the new password.</p>
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <Link href="/customer/router">
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={changeWifi.isPending} className="font-bold gap-2 shadow-sm">
                  <Lock className="h-4 w-4" />
                  {changeWifi.isPending ? 'Sending…' : 'Save WiFi Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {result && <RouterActionResultPanel title="WiFi change" result={result} />}
      </div>
    </CustomerPageShell>
  );
}

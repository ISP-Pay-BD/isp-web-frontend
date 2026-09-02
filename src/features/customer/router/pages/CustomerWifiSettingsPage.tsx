'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Wifi,
  Lock,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerPageShell } from '@/features/customer/shared';
import { useCustomerRouter } from '../hooks/use-customer-router';
import { updateWifiSchema, type UpdateWifiInput } from '@/features/customer/shared';
import { toast } from 'sonner';

export function CustomerWifiSettingsPage() {
  const router = useRouter();
  const { data, updateWifiMutation } = useCustomerRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateWifiInput>({
    resolver: zodResolver(updateWifiSchema),
    defaultValues: {
      ssid: data?.router?.wifiSsid ?? 'Rahim-Home-5G',
      password: '',
      securityMode: 'WPA2-PSK [AES]',
      hideSsid: false,
    },
  });

  const onSubmit = async (values: UpdateWifiInput) => {
    try {
      await updateWifiMutation.mutateAsync(values);
      toast.success('WiFi settings updated successfully! Please re-connect with your new password.');
      router.push('/customer/router');
    } catch {
      toast.error('Failed to update WiFi settings. Please try again.');
    }
  };

  return (
    <CustomerPageShell
      title="WiFi Settings"
      subtitle="Modify your wireless network broadcast name (SSID) and security passphrase."
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
      <div className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                Wireless Network Configuration
              </CardTitle>
              <CardDescription className="text-xs">
                Changes will be provisioned directly to your connected ONT / ONU gateway router.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ssid">WiFi Network Name (SSID)</Label>
                <Input
                  id="ssid"
                  placeholder="e.g. Rahim-Home-5G"
                  {...register('ssid')}
                />
                {errors.ssid && (
                  <p className="text-xs text-destructive">{errors.ssid.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">New WiFi Passphrase (WPA2)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters (letters, numbers)"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
                <span className="text-[11px] text-muted-foreground block">
                  Must be at least 8 characters. Avoid simple patterns like 12345678.
                </span>
              </div>

              <div className="p-3.5 rounded-xl border bg-muted/40 text-xs space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Security: WPA2-PSK [AES] (Recommended)
                </div>
                <p>
                  After saving, all currently connected phones, tablets, and smart TVs will be disconnected and will need to enter the new password.
                </p>
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <Link href="/customer/router">
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={updateWifiMutation.isPending}
                  className="font-bold gap-2 shadow-sm"
                >
                  <Lock className="h-4 w-4" />
                  {updateWifiMutation.isPending ? 'Saving to Router...' : 'Save & Restart WiFi'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </CustomerPageShell>
  );
}

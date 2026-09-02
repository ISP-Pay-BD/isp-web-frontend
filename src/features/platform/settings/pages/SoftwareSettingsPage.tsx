'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import type { PlatformSoftwareSettings } from '@/data/platform/contacts.data';

export function SoftwareSettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'settings'],
    queryFn: () => mockFetch('platform.settings'),
  });

  const form = useForm<PlatformSoftwareSettings>();

  useEffect(() => {
    if (data) form.reset(data);
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: (values: PlatformSoftwareSettings) => mockFetch('platform.settings.update', values),
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['platform', 'settings'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <PageSkeleton rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load settings"
        description="Could not retrieve software configuration."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Software Settings"
        subtitle="Global platform configuration — domain, support contacts, and auth policies"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Settings' },
        ]}
      />

      <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">General</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appName">Application Name</Label>
              <Input id="appName" {...form.register('appName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseDomain">Base Domain</Label>
              <Input id="baseDomain" {...form.register('baseDomain')} className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input id="supportEmail" type="email" {...form.register('supportEmail')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input id="supportPhone" {...form.register('supportPhone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryBrandColor">Primary Brand Color</Label>
              <div className="flex gap-2">
                <Input type="color" {...form.register('primaryBrandColor')} className="h-9 w-14 p-1" />
                <Input {...form.register('primaryBrandColor')} className="font-mono text-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeoutMinutes">Session Timeout (minutes)</Label>
              <Input id="sessionTimeoutMinutes" type="number" {...form.register('sessionTimeoutMinutes', { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Billing & Registration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="yearlyDiscountMonths">Yearly Free Months</Label>
              <Input id="yearlyDiscountMonths" type="number" {...form.register('yearlyDiscountMonths', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearlyDiscountPercent">Yearly Discount %</Label>
              <Input id="yearlyDiscountPercent" type="number" {...form.register('yearlyDiscountPercent', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notificationWebhookUrl">Notification Webhook URL</Label>
              <Input id="notificationWebhookUrl" {...form.register('notificationWebhookUrl')} className="font-mono text-xs" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-4 sm:col-span-2">
              <div>
                <div className="font-medium text-sm">Allow Self Registration</div>
                <div className="text-xs text-muted-foreground">Let new ISPs sign up from the landing page</div>
              </div>
              <Controller
                name="allowSelfRegistration"
                control={form.control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending} className="bg-primary hover:bg-primary/90">
            <Save className="mr-1.5 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}

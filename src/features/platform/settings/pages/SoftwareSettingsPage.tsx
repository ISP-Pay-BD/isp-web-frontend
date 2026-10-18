'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformService } from '@/lib/api/services/platform.service';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import type { PlatformSoftwareSettings } from '@/features/platform/types';

type SettingsForm = Omit<PlatformSoftwareSettings, 'maintenanceMode' | 'maintenanceAllowIps' | 'baseDomain'>;

const FIELD_MAP: Record<string, keyof SettingsForm> = {
  app_name: 'appName',
  support_email: 'supportEmail',
  support_phone: 'supportPhone',
  primary_brand_color: 'primaryBrandColor',
  session_timeout_minutes: 'sessionTimeoutMinutes',
  yearly_discount_months: 'yearlyDiscountMonths',
  yearly_discount_percent: 'yearlyDiscountPercent',
  allow_self_registration: 'allowSelfRegistration',
  notification_webhook_url: 'notificationWebhookUrl',
  privacy_policy: 'privacyPolicy',
  terms_of_service: 'termsOfService',
};

/** Matches the API limit (settings.value is TEXT; Bangla is 3 bytes per character). */
const LEGAL_MAX_CHARS = 20000;

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-destructive">{msg}</p> : null;
}

export function SoftwareSettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'settings'],
    queryFn: () => platformService.getSoftwareSettings(),
  });

  const form = useForm<SettingsForm>();

  useEffect(() => {
    if (data) form.reset(data);
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: (v: SettingsForm) =>
      platformService.updateSoftwareSettings({
        app_name: v.appName,
        support_email: v.supportEmail,
        support_phone: v.supportPhone,
        primary_brand_color: v.primaryBrandColor,
        session_timeout_minutes: Number(v.sessionTimeoutMinutes) || 0,
        yearly_discount_months: Number(v.yearlyDiscountMonths) || 0,
        yearly_discount_percent: Number(v.yearlyDiscountPercent) || 0,
        allow_self_registration: Boolean(v.allowSelfRegistration),
        notification_webhook_url: v.notificationWebhookUrl,
        privacy_policy: v.privacyPolicy,
        terms_of_service: v.termsOfService,
      }),
    onSuccess: (saved) => {
      toast.success('Settings saved');
      queryClient.setQueryData(['platform', 'settings'], saved);
      void queryClient.invalidateQueries({ queryKey: ['platform', 'admins', 'packages'] });
    },
    onError: (err) =>
      handleApiError(err, (field, e) => {
        const key = FIELD_MAP[String(field)];
        if (key) form.setError(key, e);
      }),
  });

  if (isLoading) return <PageSkeleton variant="form" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load settings"
        description={error instanceof Error ? error.message : 'Could not retrieve software configuration.'}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const errors = form.formState.errors;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Software Settings"
        subtitle="Platform branding, support contacts, pricing display and registration policy"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Settings' },
        ]}
        actions={
          <Link href="/platform/maintenance">
            <Button variant="outline" size="sm">
              Maintenance mode
            </Button>
          </Link>
        }
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
              <Err msg={errors.appName?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseDomain">Tenant Base Domain</Label>
              <Input id="baseDomain" value={data.baseDomain} readOnly disabled className="font-mono" />
              <p className="text-[11px] text-muted-foreground">Set on the server (app.tenantBaseDomain).</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input id="supportEmail" type="email" {...form.register('supportEmail')} />
              <Err msg={errors.supportEmail?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input id="supportPhone" {...form.register('supportPhone')} />
              <Err msg={errors.supportPhone?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryBrandColor">Primary Brand Color</Label>
              <div className="flex gap-2">
                <Input type="color" {...form.register('primaryBrandColor')} className="h-9 w-14 p-1" />
                <Input id="primaryBrandColor" {...form.register('primaryBrandColor')} className="font-mono text-xs" />
              </div>
              <Err msg={errors.primaryBrandColor?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeoutMinutes">Session Timeout (minutes, 0 = default)</Label>
              <Input id="sessionTimeoutMinutes" type="number" min={0} {...form.register('sessionTimeoutMinutes')} />
              <Err msg={errors.sessionTimeoutMinutes?.message} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Billing & Registration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="yearlyDiscountMonths">Yearly Free Months (0–11)</Label>
              <Input id="yearlyDiscountMonths" type="number" min={0} max={11} {...form.register('yearlyDiscountMonths')} />
              <Err msg={errors.yearlyDiscountMonths?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearlyDiscountPercent">Yearly Discount Badge % (0–99)</Label>
              <Input id="yearlyDiscountPercent" type="number" min={0} max={99} {...form.register('yearlyDiscountPercent')} />
              <Err msg={errors.yearlyDiscountPercent?.message} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notificationWebhookUrl">Notification Webhook URL</Label>
              <Input id="notificationWebhookUrl" {...form.register('notificationWebhookUrl')} className="font-mono text-xs" />
              <Err msg={errors.notificationWebhookUrl?.message} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-4 sm:col-span-2">
              <div>
                <div className="font-medium text-sm">Allow Self Registration</div>
                <div className="text-xs text-muted-foreground">Let new ISPs sign up from the public /register page</div>
              </div>
              <Controller
                name="allowSelfRegistration"
                control={form.control}
                render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Legal pages</CardTitle>
            <p className="text-xs text-muted-foreground">
              Shown at /privacy and /terms and linked from the site footer once they have text. Leave a box empty to keep
              that page unpublished. Blank lines separate paragraphs; start a line with # for a heading or - for a bullet.
            </p>
          </CardHeader>
          <CardContent className="grid gap-5">
            {(
              [
                { id: 'privacyPolicy', label: 'Privacy Policy', href: '/privacy' },
                { id: 'termsOfService', label: 'Terms of Service', href: '/terms' },
              ] as const
            ).map((doc) => (
              <div key={doc.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor={doc.id}>{doc.label}</Label>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {(form.watch(doc.id) ?? '').length.toLocaleString()} / {LEGAL_MAX_CHARS.toLocaleString()}
                  </span>
                </div>
                <Textarea
                  id={doc.id}
                  rows={8}
                  maxLength={LEGAL_MAX_CHARS}
                  placeholder={`Write your ${doc.label.toLowerCase()} here`}
                  {...form.register(doc.id)}
                />
                <Err msg={errors[doc.id]?.message} />
                {(data[doc.id] ?? '').trim() ? (
                  <Link href={doc.href} target="_blank" className="text-xs text-primary hover:underline">
                    View published page ({doc.href})
                  </Link>
                ) : null}
              </div>
            ))}
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

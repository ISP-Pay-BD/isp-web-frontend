'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { Can } from '@/components/shared/Can';
import { toast } from 'sonner';
import { Globe, Server, Zap, Copy, RefreshCw, ShieldCheck, Save } from 'lucide-react';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatDateTime } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { waStatusLabel } from '../components/wa-labels';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useRestartWahaSession, useSaveWhatsAppSettings, useWhatsAppSettings } from '../hooks/use-whatsapp';
import { metaFormFrom, type WaMetaForm } from '../types';

type ToggleKey = keyof Pick<WaMetaForm, 'utilityEnabled' | 'authenticationEnabled' | 'marketingEnabled' | 'aiEnabled'>;

export function WhatsAppSettingsPage() {
  const t = useTranslations();
  const settings = useWhatsAppSettings();
  const saveSettings = useSaveWhatsAppSettings();
  const restartWaha = useRestartWahaSession();
  // Unsaved edits only — the form value is server data + these overrides.
  const [draft, setDraft] = useState<Partial<WaMetaForm>>({});

  const form = useMemo<WaMetaForm>(() => ({ ...metaFormFrom(settings.data?.meta ?? null), ...draft }), [settings.data, draft]);
  const set = <K extends keyof WaMetaForm>(key: K, value: WaMetaForm[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const toggles: Array<{ key: ToggleKey; label: string; desc: string }> = [
    {
      key: 'utilityEnabled',
      label: t('admin.whatsapp.settings.toggleUtility', 'Utility Alerts (bills, receipts, expiry)'),
      desc: t('admin.whatsapp.settings.toggleUtilityDesc', 'Sends approved UTILITY templates when billing events fire'),
    },
    {
      key: 'authenticationEnabled',
      label: t('admin.whatsapp.settings.toggleOtp', 'OTP over WhatsApp'),
      desc: t('admin.whatsapp.settings.toggleOtpDesc', 'Sends login / verification codes with AUTHENTICATION templates'),
    },
    {
      key: 'marketingEnabled',
      label: t('admin.whatsapp.settings.toggleMarketing', 'Marketing Campaigns'),
      desc: t('admin.whatsapp.settings.toggleMarketingDesc', 'Allows campaigns to opted-in numbers'),
    },
    {
      key: 'aiEnabled',
      label: t('admin.whatsapp.settings.toggleAi', 'AI Customer Support Auto-Responder'),
      desc: t('admin.whatsapp.settings.toggleAiDesc', 'The AI assistant answers incoming customer messages'),
    },
  ];
  const otpOptions: Record<string, string> = {
    sms: t('admin.whatsapp.settings.otpSms', 'SMS only'),
    whatsapp: t('admin.whatsapp.settings.otpWhatsapp', 'WhatsApp only'),
    whatsapp_then_sms: t('admin.whatsapp.settings.otpWhatsappSms', 'WhatsApp then SMS fallback'),
    sms_then_whatsapp: t('admin.whatsapp.settings.otpSmsWhatsapp', 'SMS then WhatsApp fallback'),
  };
  const notConfigured = t('admin.whatsapp.settings.notConfigured', 'Not configured');
  const notEnabled = t('admin.whatsapp.settings.notEnabled', 'Not enabled');
  const activeLabel = t('status.active', 'Active');
  const inactiveLabel = t('status.inactive', 'Inactive');

  if (settings.isLoading) return <PageSkeleton variant="form" />;
  if (settings.isError || !settings.data) {
    return (
      <EmptyState variant="error"
        title={t('admin.whatsapp.settings.loadFailed', 'Failed to load settings')}
        description={errorMessage(settings.error, t('admin.whatsapp.settings.loadFailedHint', 'Could not fetch WhatsApp configuration.'))}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => settings.refetch()}
      />
    );
  }

  const cfg = settings.data;
  const canEdit = cfg.canUpdate;
  const dirty = Object.keys(draft).length > 0;

  const handleSave = () => {
    if (!form.phoneNumberId.trim()) {
      toast.error(t('admin.whatsapp.settings.phoneIdRequired', 'Phone Number ID is required'));
      return;
    }
    saveSettings.mutate(form, {
      onSuccess: () => {
        setDraft({});
        toast.success(t('admin.whatsapp.settings.saved', 'WhatsApp settings saved'));
      },
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(t('admin.customers.list.copied', '{label} copied to clipboard', { label })),
      () => toast.error(t('admin.whatsapp.settings.copyFailed', 'Could not copy to clipboard')),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.whatsapp.settings.title', 'WhatsApp Gateway & Bot Settings')}
        subtitle={t('admin.whatsapp.settings.subtitle', 'Meta Cloud API credentials, WAHA session and automated message categories')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: t('nav.wa-settings', 'Settings') },
        ]}
        actions={
          canEdit ? (
            <Can menu="whatsapp_business" action="update">
              <Button onClick={handleSave} disabled={saveSettings.isPending || !dirty} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="h-4 w-4" />
                {saveSettings.isPending ? t('admin.whatsapp.settings.saving', 'Saving...') : t('admin.whatsapp.settings.save', 'Save Configuration')}
              </Button>
            </Can>
          ) : undefined
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Meta Cloud API', value: cfg.meta ? (cfg.meta.isActive ? activeLabel : inactiveLabel) : cfg.canMeta ? notConfigured : notEnabled },
          {
            label: t('admin.whatsapp.settings.kpiWaha', 'WAHA Session'),
            value: cfg.waha ? `${waStatusLabel(t, cfg.waha.sessionStatus)} (${cfg.waha.session || '—'})` : cfg.canWaha ? notConfigured : notEnabled,
          },
          { label: t('admin.whatsapp.settings.kpiCategories', 'Active Categories'), value: [form.utilityEnabled, form.authenticationEnabled, form.marketingEnabled].filter(Boolean).length },
          { label: t('admin.whatsapp.settings.kpiAi', 'AI Auto-Responder'), value: form.aiEnabled ? t('status.enabled', 'Enabled') : t('status.disabled', 'Disabled') },
        ]}
      />

      {!canEdit && (
        <p className="text-xs text-muted-foreground rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
          {t('admin.whatsapp.settings.readOnly', 'Meta settings for this account are managed by the platform owner — fields are read-only.')}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                {t('admin.whatsapp.settings.metaTitle', 'Meta Cloud API Platform')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  disabled={!canEdit}
                  onCheckedChange={(c) => set('isActive', c)}
                  aria-label={t('admin.whatsapp.settings.metaToggle', 'Enable Meta Cloud API')}
                />
                <Badge variant="secondary" tone={form.isActive ? 'success' : 'neutral'}>
                  {form.isActive ? t('status.enabled', 'Enabled') : t('status.disabled', 'Disabled')}
                </Badge>
              </div>
            </div>
            <CardDescription>{t('admin.whatsapp.settings.metaDesc', 'Official WhatsApp Business Platform credentials & webhook')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone-number-id" className="text-xs font-semibold">{t('admin.whatsapp.settings.phoneNumberId', 'Phone Number ID')}</Label>
                <Input id="phone-number-id" value={form.phoneNumberId} readOnly={!canEdit} onChange={(e) => set('phoneNumberId', e.target.value)} className="font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="display-phone" className="text-xs font-semibold">{t('admin.whatsapp.settings.displayPhone', 'Display Phone')}</Label>
                <Input id="display-phone" value={form.displayPhone} readOnly={!canEdit} onChange={(e) => set('displayPhone', e.target.value)} className="font-mono text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp-business-account-wa" className="text-xs font-semibold">WhatsApp Business Account (WABA) ID</Label>
              <Input id="whatsapp-business-account-wa" value={form.wabaId} readOnly={!canEdit} onChange={(e) => set('wabaId', e.target.value)} className="font-mono text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="webhook-callback-url" className="text-xs font-semibold">{t('admin.whatsapp.settings.webhookUrl', 'Webhook Callback URL')}</Label>
              <div className="flex gap-2">
                <Input id="webhook-callback-url" value={cfg.webhookUrl} readOnly className="font-mono text-xs bg-muted/20 flex-1" />
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" disabled={!cfg.webhookUrl} onClick={() => copyToClipboard(cfg.webhookUrl, 'Webhook URL')} title={t('admin.whatsapp.settings.copyWebhook', 'Copy Webhook URL')} aria-label={t('admin.whatsapp.settings.copyWebhook', 'Copy Webhook URL')}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="webhook-verification-token" className="text-xs font-semibold">{t('admin.whatsapp.settings.verifyToken', 'Webhook Verification Token')}</Label>
              <div className="flex gap-2">
                <Input id="webhook-verification-token" value={form.verifyToken} readOnly={!canEdit} onChange={(e) => set('verifyToken', e.target.value)} className="font-mono text-xs flex-1" />
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" disabled={!form.verifyToken} onClick={() => copyToClipboard(form.verifyToken, t('admin.whatsapp.settings.verifyTokenShort', 'Verify token'))} title={t('admin.whatsapp.settings.copyVerify', 'Copy Verify Token')} aria-label={t('admin.whatsapp.settings.copyVerify', 'Copy Verify Token')}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {canEdit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="access-token" className="text-xs font-semibold">{t('admin.whatsapp.settings.accessToken', 'Access Token')}</Label>
                  <Input id="access-token"
                    type="password"
                    value={form.accessToken}
                    onChange={(e) => set('accessToken', e.target.value)}
                    placeholder={
                      cfg.meta?.hasAccessToken
                        ? t('admin.whatsapp.settings.tokenSaved', 'Saved ({last4}) — leave blank to keep', { last4: cfg.meta.accessTokenMasked.slice(-4) })
                        : t('admin.whatsapp.settings.tokenPlaceholder', 'Permanent system-user token')
                    }
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="app-secret" className="text-xs font-semibold">{t('admin.whatsapp.settings.appSecret', 'App Secret')}</Label>
                  <Input id="app-secret"
                    type="password"
                    value={form.appSecret}
                    onChange={(e) => set('appSecret', e.target.value)}
                    placeholder={
                      cfg.meta?.hasAppSecret
                        ? t('admin.whatsapp.settings.secretSaved', 'Saved — leave blank to keep')
                        : t('admin.whatsapp.settings.secretPlaceholder', 'Meta app secret')
                    }
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border border-border/50">
              <ShieldCheck className={`h-4 w-4 ${cfg.meta?.hasAccessToken ? 'text-emerald-500' : 'text-muted-foreground'}`} />
              <span className="font-medium">
                {cfg.meta?.hasAccessToken
                  ? t('admin.whatsapp.settings.tokenOn', 'Access token: configured')
                  : t('admin.whatsapp.settings.tokenOff', 'Access token: not configured')}
                {cfg.meta?.updatedAt ? ` · ${t('admin.whatsapp.settings.tokenUpdated', 'updated {date}', { date: formatDateTime(cfg.meta.updatedAt) })}` : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                {t('admin.whatsapp.settings.wahaTitle', 'Self-Hosted WAHA Bridge')}
              </CardTitle>
              {cfg.waha && (
                <Badge
                  variant={cfg.waha.sessionStatus === 'WORKING' ? 'default' : 'secondary'}
                  tone={cfg.waha.sessionStatus === 'WORKING' ? 'success' : undefined}
                >
                  {waStatusLabel(t, cfg.waha.sessionStatus)}
                </Badge>
              )}
            </div>
            <CardDescription>{t('admin.whatsapp.settings.wahaDesc', 'WhatsApp HTTP API session for two-way chat')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {!cfg.waha ? (
              <EmptyState
                title={cfg.canWaha ? t('admin.whatsapp.settings.wahaNotConfigured', 'WAHA not configured') : t('admin.whatsapp.settings.wahaNotEnabled', 'WAHA not enabled')}
                description={
                  cfg.canWaha
                    ? t('admin.whatsapp.settings.wahaNotConfiguredHint', 'WAHA server details are set by the platform owner.')
                    : t('admin.whatsapp.settings.wahaNotEnabledHint', 'Ask the platform owner to enable WAHA for this account.')
                }
                className="py-8"
              />
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="waha-server-rest-endpoint" className="text-xs font-semibold">{t('admin.whatsapp.settings.wahaEndpoint', 'WAHA Server REST Endpoint')}</Label>
                  <Input id="waha-server-rest-endpoint" value={cfg.waha.baseUrl || t('admin.whatsapp.settings.defaultServer', 'Platform default server')} readOnly className="font-mono text-xs bg-muted/20" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="session-name" className="text-xs font-semibold">{t('admin.whatsapp.settings.sessionName', 'Session Name')}</Label>
                    <Input id="session-name" value={cfg.waha.session} readOnly className="font-mono text-xs bg-muted/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="api-key" className="text-xs font-semibold">{t('admin.whatsapp.settings.apiKey', 'API Key')}</Label>
                    <Input id="api-key" value={cfg.waha.hasApiKey ? t('admin.whatsapp.settings.configured', 'Configured') : t('admin.whatsapp.settings.notSet', 'Not set')} readOnly className="font-mono text-xs bg-muted/20" />
                  </div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg border border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{t('admin.whatsapp.settings.sessionControl', 'Session Control')}</span>
                    <span className="font-medium">{cfg.waha.isActive ? activeLabel : inactiveLabel}</span>
                  </div>
                  <Can menu="whatsapp_business" action="update">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 gap-1.5"
                      disabled={restartWaha.isPending}
                      onClick={() => restartWaha.mutate(undefined, { onSuccess: () => toast.success(t('admin.whatsapp.settings.sessionStarted', 'WAHA session (re)started')) })}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${restartWaha.isPending ? 'animate-spin' : ''}`} />
                      {t('admin.whatsapp.settings.sessionRestart', 'Start / Restart Session')}
                    </Button>
                  </Can>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            {t('admin.whatsapp.settings.categoriesTitle', 'Message Categories & AI Bot')}
          </CardTitle>
          <CardDescription>{t('admin.whatsapp.settings.categoriesDesc', 'Which automatic WhatsApp messages this account may send')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-border/40 border border-border/50 rounded-xl overflow-hidden bg-muted/10">
            {toggles.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3.5 hover:bg-muted/20 transition-colors">
                <div className="space-y-0.5 max-w-xl">
                  <span className="text-xs font-semibold text-foreground block">{item.label}</span>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={form[item.key]} disabled={!canEdit} onCheckedChange={(checked) => set(item.key, checked)} aria-label={item.label} />
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">{t('admin.whatsapp.settings.otpChannel', 'OTP delivery channel')}</span>
                <p className="text-xs text-muted-foreground">{t('admin.whatsapp.settings.otpChannelDesc', 'Where one-time codes are sent first')}</p>
              </div>
              <Select value={form.otpChannel} disabled={!canEdit} onValueChange={(v) => v && set('otpChannel', v)} items={otpOptions}>
                <SelectTrigger aria-label={t('admin.whatsapp.settings.otpChannelAria', 'OTP channel')} className="h-8 w-[260px] max-w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(otpOptions).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

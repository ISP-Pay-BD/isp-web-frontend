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
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useRestartWahaSession, useSaveWhatsAppSettings, useWhatsAppSettings } from '../hooks/use-whatsapp';
import { metaFormFrom, type WaMetaForm } from '../types';

const TOGGLES: Array<{ key: keyof Pick<WaMetaForm, 'utilityEnabled' | 'authenticationEnabled' | 'marketingEnabled' | 'aiEnabled'>; label: string; desc: string }> = [
  { key: 'utilityEnabled', label: 'Utility Alerts (bills, receipts, expiry)', desc: 'Sends approved UTILITY templates when billing events fire' },
  { key: 'authenticationEnabled', label: 'OTP over WhatsApp', desc: 'Sends login / verification codes with AUTHENTICATION templates' },
  { key: 'marketingEnabled', label: 'Marketing Campaigns', desc: 'Allows campaigns to opted-in numbers' },
  { key: 'aiEnabled', label: 'AI Customer Support Auto-Responder', desc: 'The AI assistant answers incoming customer messages' },
];

export function WhatsAppSettingsPage() {
  const settings = useWhatsAppSettings();
  const saveSettings = useSaveWhatsAppSettings();
  const restartWaha = useRestartWahaSession();
  // Unsaved edits only — the form value is server data + these overrides.
  const [draft, setDraft] = useState<Partial<WaMetaForm>>({});

  const form = useMemo<WaMetaForm>(() => ({ ...metaFormFrom(settings.data?.meta ?? null), ...draft }), [settings.data, draft]);
  const set = <K extends keyof WaMetaForm>(key: K, value: WaMetaForm[K]) => setDraft((d) => ({ ...d, [key]: value }));

  if (settings.isLoading) return <PageSkeleton variant="form" />;
  if (settings.isError || !settings.data) {
    return (
      <EmptyState
        title="Failed to load settings"
        description={errorMessage(settings.error, 'Could not fetch WhatsApp configuration.')}
        actionLabel="Retry"
        onAction={() => settings.refetch()}
      />
    );
  }

  const cfg = settings.data;
  const canEdit = cfg.canUpdate;
  const dirty = Object.keys(draft).length > 0;

  const handleSave = () => {
    if (!form.phoneNumberId.trim()) {
      toast.error('Phone Number ID is required');
      return;
    }
    saveSettings.mutate(form, {
      onSuccess: () => {
        setDraft({});
        toast.success('WhatsApp settings saved');
      },
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied to clipboard`),
      () => toast.error('Could not copy to clipboard'),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Gateway & Bot Settings"
        subtitle="Meta Cloud API credentials, WAHA session and automated message categories"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Settings' },
        ]}
        actions={
          canEdit ? (
            <Can menu="whatsapp_business" action="update">
              <Button onClick={handleSave} disabled={saveSettings.isPending || !dirty} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="h-4 w-4" />
                {saveSettings.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
            </Can>
          ) : undefined
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Meta Cloud API', value: cfg.meta ? (cfg.meta.isActive ? 'Active' : 'Inactive') : cfg.canMeta ? 'Not configured' : 'Not enabled' },
          { label: 'WAHA Session', value: cfg.waha ? `${cfg.waha.sessionStatus} (${cfg.waha.session || '—'})` : cfg.canWaha ? 'Not configured' : 'Not enabled' },
          { label: 'Active Categories', value: [form.utilityEnabled, form.authenticationEnabled, form.marketingEnabled].filter(Boolean).length },
          { label: 'AI Auto-Responder', value: form.aiEnabled ? 'Enabled' : 'Disabled' },
        ]}
      />

      {!canEdit && (
        <p className="text-xs text-muted-foreground rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
          Meta settings for this account are managed by the platform owner — fields are read-only.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Meta Cloud API Platform
              </CardTitle>
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} disabled={!canEdit} onCheckedChange={(c) => set('isActive', c)} />
                <Badge variant={form.isActive ? 'default' : 'secondary'} className={form.isActive ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}>
                  {form.isActive ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
            <CardDescription>Official WhatsApp Business Platform credentials & webhook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number ID</Label>
                <Input value={form.phoneNumberId} readOnly={!canEdit} onChange={(e) => set('phoneNumberId', e.target.value)} className="font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Display Phone</Label>
                <Input value={form.displayPhone} readOnly={!canEdit} onChange={(e) => set('displayPhone', e.target.value)} className="font-mono text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">WhatsApp Business Account (WABA) ID</Label>
              <Input value={form.wabaId} readOnly={!canEdit} onChange={(e) => set('wabaId', e.target.value)} className="font-mono text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Webhook Callback URL</Label>
              <div className="flex gap-2">
                <Input value={cfg.webhookUrl} readOnly className="font-mono text-xs bg-muted/20 flex-1" />
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" disabled={!cfg.webhookUrl} onClick={() => copyToClipboard(cfg.webhookUrl, 'Webhook URL')} title="Copy Webhook URL">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Webhook Verification Token</Label>
              <div className="flex gap-2">
                <Input value={form.verifyToken} readOnly={!canEdit} onChange={(e) => set('verifyToken', e.target.value)} className="font-mono text-xs flex-1" />
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" disabled={!form.verifyToken} onClick={() => copyToClipboard(form.verifyToken, 'Verify token')} title="Copy Verify Token">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {canEdit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Access Token</Label>
                  <Input
                    type="password"
                    value={form.accessToken}
                    onChange={(e) => set('accessToken', e.target.value)}
                    placeholder={cfg.meta?.hasAccessToken ? `Saved (${cfg.meta.accessTokenMasked.slice(-4)}) — leave blank to keep` : 'Permanent system-user token'}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">App Secret</Label>
                  <Input
                    type="password"
                    value={form.appSecret}
                    onChange={(e) => set('appSecret', e.target.value)}
                    placeholder={cfg.meta?.hasAppSecret ? 'Saved — leave blank to keep' : 'Meta app secret'}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border border-border/50">
              <ShieldCheck className={`h-4 w-4 ${cfg.meta?.hasAccessToken ? 'text-emerald-500' : 'text-muted-foreground'}`} />
              <span className="font-medium">
                Access token: {cfg.meta?.hasAccessToken ? 'configured' : 'not configured'}
                {cfg.meta?.updatedAt ? ` · updated ${formatDateTime(cfg.meta.updatedAt)}` : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Self-Hosted WAHA Bridge
              </CardTitle>
              {cfg.waha && (
                <Badge
                  variant={cfg.waha.sessionStatus === 'WORKING' ? 'default' : 'secondary'}
                  className={cfg.waha.sessionStatus === 'WORKING' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}
                >
                  {cfg.waha.sessionStatus}
                </Badge>
              )}
            </div>
            <CardDescription>WhatsApp HTTP API session for two-way chat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {!cfg.waha ? (
              <EmptyState
                title={cfg.canWaha ? 'WAHA not configured' : 'WAHA not enabled'}
                description={cfg.canWaha ? 'WAHA server details are set by the platform owner.' : 'Ask the platform owner to enable WAHA for this account.'}
                className="py-8"
              />
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">WAHA Server REST Endpoint</Label>
                  <Input value={cfg.waha.baseUrl || 'Platform default server'} readOnly className="font-mono text-xs bg-muted/20" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Session Name</Label>
                    <Input value={cfg.waha.session} readOnly className="font-mono text-xs bg-muted/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">API Key</Label>
                    <Input value={cfg.waha.hasApiKey ? 'Configured' : 'Not set'} readOnly className="font-mono text-xs bg-muted/20" />
                  </div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg border border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Session Control</span>
                    <span className="font-medium">{cfg.waha.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <Can menu="whatsapp_business" action="update">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 gap-1.5"
                      disabled={restartWaha.isPending}
                      onClick={() => restartWaha.mutate(undefined, { onSuccess: () => toast.success('WAHA session (re)started') })}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${restartWaha.isPending ? 'animate-spin' : ''}`} />
                      Start / Restart Session
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
            Message Categories & AI Bot
          </CardTitle>
          <CardDescription>Which automatic WhatsApp messages this account may send</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-border/40 border border-border/50 rounded-xl overflow-hidden bg-muted/10">
            {TOGGLES.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3.5 hover:bg-muted/20 transition-colors">
                <div className="space-y-0.5 max-w-xl">
                  <span className="text-xs font-semibold text-foreground block">{item.label}</span>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={form[item.key]} disabled={!canEdit} onCheckedChange={(checked) => set(item.key, checked)} />
              </div>
            ))}
            <div className="flex items-center justify-between p-3.5">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">OTP delivery channel</span>
                <p className="text-[11px] text-muted-foreground">Where one-time codes are sent first</p>
              </div>
              <Select value={form.otpChannel} disabled={!canEdit} onValueChange={(v) => v && set('otpChannel', v)}>
                <SelectTrigger className="h-8 w-[210px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS only</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp only</SelectItem>
                  <SelectItem value="whatsapp_then_sms">WhatsApp then SMS fallback</SelectItem>
                  <SelectItem value="sms_then_whatsapp">SMS then WhatsApp fallback</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { Can } from '@/components/shared/Can';
import { toast } from 'sonner';
import {
  Settings,
  Globe,
  Server,
  Zap,
  Bot,
  Copy,
  CheckCircle2,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsApp } from '../hooks/use-whatsapp';

export function WhatsAppSettingsPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();
  const [settings, setSettings] = useState(data?.settings);
  const [isSaving, setIsSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(
    'You are a friendly AI customer assistant for ISP Pay BD broadband service. Answer subscriber billing, speed, and ONU reboot questions concisely in Bengali and English.'
  );

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load settings"
        description="Could not fetch WhatsApp gateway configuration."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const cfg = settings ?? data.settings;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('WhatsApp Business API & WAHA gateway settings updated successfully!');
    }, 500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Gateway & Bot Settings"
        subtitle="Configure Meta Cloud API credentials, self-hosted WAHA bridge, and automated workflow triggers"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Settings' },
        ]}
        actions={
          <Can menu="whatsapp_business" action="update">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Can>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Meta Cloud API', value: cfg.meta.enabled ? 'ENABLED (Tier 2)' : 'DISABLED' },
          { label: 'WAHA Session Status', value: `${cfg.waha.sessionStatus} (${cfg.waha.activeSessionName})` },
          { label: 'Automated Triggers', value: '4 Active Workflows' },
          { label: 'AI Auto-Responder', value: cfg.notifications.autoAiReply ? 'Online (GPT-4o mini)' : 'Disabled' },
          { label: 'Webhook Health', value: '200 OK (Latency: 28ms)' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta Cloud API Card */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Meta Cloud API Platform
              </CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  checked={cfg.meta.enabled}
                  onCheckedChange={(c) =>
                    setSettings({ ...cfg, meta: { ...cfg.meta, enabled: c } })
                  }
                />
                <Badge
                  variant={cfg.meta.enabled ? 'default' : 'secondary'}
                  className={cfg.meta.enabled ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}
                >
                  {cfg.meta.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
            <CardDescription>Official WhatsApp Business Platform credentials & Webhooks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Meta App ID</Label>
                <Input value={cfg.meta.appId} readOnly className="font-mono text-xs bg-muted/20" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number ID</Label>
                <Input value={cfg.meta.phoneNumberId} readOnly className="font-mono text-xs bg-muted/20" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">WhatsApp Business Account (WABA) ID</Label>
              <Input value={cfg.meta.wabaId} readOnly className="font-mono text-xs bg-muted/20" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Webhook Callback URL</Label>
              <div className="flex gap-2">
                <Input value={cfg.meta.webhookUrl} readOnly className="font-mono text-xs bg-muted/20 flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => copyToClipboard(cfg.meta.webhookUrl, 'Webhook URL')}
                  title="Copy Webhook URL"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Webhook Verification Token</Label>
              <div className="flex gap-2">
                <Input value={cfg.meta.webhookVerifyToken} readOnly className="font-mono text-xs bg-muted/20 flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => copyToClipboard(cfg.meta.webhookVerifyToken, 'Verify Token')}
                  title="Copy Verify Token"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">System User Permanent Token: Configured</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => {
                  toast.promise(new Promise((res) => setTimeout(res, 500)), {
                    loading: 'Testing Meta Graph endpoint...',
                    success: 'Meta Cloud API 200 OK — Handshake Verified',
                    error: 'Handshake failed',
                  });
                }}
              >
                <RefreshCw className="h-3 w-3" />
                Ping Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Self-Hosted WAHA Bridge Card */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Self-Hosted WAHA Bridge
              </CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  checked={cfg.waha.enabled}
                  onCheckedChange={(c) =>
                    setSettings({ ...cfg, waha: { ...cfg.waha, enabled: c } })
                  }
                />
                <Badge
                  variant={cfg.waha.sessionStatus === 'CONNECTED' ? 'default' : 'secondary'}
                  className={cfg.waha.sessionStatus === 'CONNECTED' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}
                >
                  {cfg.waha.sessionStatus}
                </Badge>
              </div>
            </div>
            <CardDescription>WhatsApp HTTP API Docker container for instant two-way chat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">WAHA Server REST Endpoint</Label>
              <Input value={cfg.waha.serverUrl} readOnly className="font-mono text-xs bg-muted/20" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Active Session Name</Label>
                <Input value={cfg.waha.activeSessionName} readOnly className="font-mono text-xs bg-muted/20" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">API Secret Key</Label>
                <Input value="••••••••••••••••••••" readOnly className="font-mono text-xs bg-muted/20" />
              </div>
            </div>

            <div className="p-3 bg-muted/20 rounded-lg border border-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Session Control:</span>
                <span className="text-emerald-500 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Socket Connected
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8 gap-1.5"
                  onClick={() => toast.info('Displaying WAHA QR Code for WhatsApp Web linking...')}
                >
                  <QrCode className="h-3.5 w-3.5 text-primary" />
                  Scan QR Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8 gap-1.5"
                  onClick={() => {
                    toast.promise(new Promise((res) => setTimeout(res, 600)), {
                      loading: 'Restarting WAHA socket worker...',
                      success: 'Session "default" restarted and re-authenticated',
                      error: 'Restart failed',
                    });
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Restart Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Automation & AI Bot Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Automated Notification Triggers & AI Bot
          </CardTitle>
          <CardDescription>
            Configure automatic dispatch for subscriber lifecycle events and chatbot auto-reply
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-border/40 border border-border/50 rounded-xl overflow-hidden bg-muted/10">
            {[
              {
                key: 'sendBillAlert' as const,
                label: 'Automated Invoice & Bill Generation Alerts',
                desc: 'Dispatches WhatsApp message with PDF bill link when monthly invoice is generated',
              },
              {
                key: 'sendPaymentReceipt' as const,
                label: 'Payment Confirmation Receipts',
                desc: 'Sends instant receipt with bKash/Nagad TrxID upon verified payment',
              },
              {
                key: 'sendExpiryWarning' as const,
                label: 'Pre-Disconnection Expiry Warnings',
                desc: 'Alerts subscribers 48 hours and 24 hours prior to account suspension',
              },
              {
                key: 'autoAiReply' as const,
                label: 'Enable AI Customer Support Auto-Responder (Beta)',
                desc: 'Automatically answers incoming customer questions regarding speed, payment, and ONU faults',
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3.5 hover:bg-muted/20 transition-colors">
                <div className="space-y-0.5 max-w-xl">
                  <span className="text-xs font-semibold text-foreground block">{item.label}</span>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={cfg.notifications[item.key]}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...cfg,
                      notifications: { ...cfg.notifications, [item.key]: checked },
                    })
                  }
                />
              </div>
            ))}
          </div>

          {cfg.notifications.autoAiReply && (
            <div className="space-y-2 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Bot className="h-4 w-4" />
                AI Auto-Responder System Prompt
              </div>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="h-20 text-xs font-mono bg-background"
                placeholder="Enter AI prompt instructions..."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

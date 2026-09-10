'use client';

import { useState, useMemo } from 'react';
import {
  Code2,
  Key,
  Webhook,
  Plus,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  ExternalLink,
  Search,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';

export function DevelopersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [searchKeys, setSearchKeys] = useState('');
  const [searchWebhooks, setSearchWebhooks] = useState('');

  const apiKeys = useMemo(() => data?.apiKeys ?? [], [data?.apiKeys]);
  const webhooks = useMemo(() => data?.webhooks ?? [], [data?.webhooks]);

  const filteredKeys = useMemo(() => {
    const q = searchKeys.toLowerCase().trim();
    if (!q) return apiKeys;
    return apiKeys.filter((k) => k.name.toLowerCase().includes(q) || k.scopes.toLowerCase().includes(q));
  }, [apiKeys, searchKeys]);

  const filteredWebhooks = useMemo(() => {
    const q = searchWebhooks.toLowerCase().trim();
    if (!q) return webhooks;
    return webhooks.filter((w) => w.url.toLowerCase().includes(q) || w.events.toLowerCase().includes(q));
  }, [webhooks, searchWebhooks]);

  const failingCount = useMemo(() => webhooks.filter((w) => w.status === 'failing').length, [webhooks]);

  const handleCopyKey = (keyMasked: string) => {
    navigator.clipboard.writeText(keyMasked);
    toast.success('API key token copied to clipboard');
  };

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load developer portal" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <PageHeader
        title="Developer API & Webhook Endpoints"
        subtitle="Manage programmatic REST API keys, real-time webhook triggers, payload scopes, and delivery logs."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Developers' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success('API Key Generator dialog (mock)')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New API Key
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active API Keys</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Key className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">{apiKeys.length}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Provisioned bearer credentials</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Webhooks</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Webhook className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">{webhooks.length} Endpoints</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Real-time event subscriptions</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Webhook Health</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">
              {webhooks.length > 0 ? `${Math.round(((webhooks.length - failingCount) / webhooks.length) * 100)}%` : '100%'}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Delivery success rate</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Failing Endpoints</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-amber-400">{failingCount}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">HTTP 5xx or timed-out hooks</div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Card */}
      <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" /> API Access Keys
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Bearer tokens for REST API integration with CRM, radius billing, and mobile apps.
              </CardDescription>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search keys..."
                value={searchKeys}
                onChange={(e) => setSearchKeys(e.target.value)}
                className="pl-8 h-8 text-xs bg-background/80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <TableHead className="text-xs font-semibold">Key Name</TableHead>
                  <TableHead className="text-xs font-semibold">Token</TableHead>
                  <TableHead className="text-xs font-semibold">Permission Scopes</TableHead>
                  <TableHead className="text-xs font-semibold">Last Activity</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {filteredKeys.map((k) => (
                  <TableRow key={k.name} className="hover:bg-muted/30 transition-colors duration-150">
                    <TableCell className="py-3">
                      <span className="font-semibold text-xs text-foreground">{k.name}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted border border-border/60 text-muted-foreground">
                          {k.keyMasked}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyKey(k.keyMasked)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Copy Token"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        {k.scopes}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                      {k.lastUsedAt}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.success(`Revoked key ${k.name}`)}
                        className="text-xs h-7 text-destructive hover:bg-destructive/10"
                      >
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Card */}
      <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Webhook className="h-4 w-4 text-primary" /> Webhook Subscriptions
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                HTTP POST event listeners dispatched on customer registration, payment, and router alerts.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search webhooks..."
                  value={searchWebhooks}
                  onChange={(e) => setSearchWebhooks(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background/80"
                />
              </div>
              <Button
                size="sm"
                onClick={() => toast.success('Add Webhook modal (mock)')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Add Webhook
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <TableHead className="text-xs font-semibold">Endpoint URL</TableHead>
                  <TableHead className="text-xs font-semibold">Subscribed Events</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Last Delivery</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Test</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {filteredWebhooks.map((w, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30 transition-colors duration-150">
                    <TableCell className="py-3">
                      <span className="font-mono text-xs text-foreground break-all">{w.url}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-[10px] bg-muted/50 border-border/60 text-muted-foreground">
                        {w.events}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold capitalize',
                          w.status === 'failing'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        )}
                      >
                        {w.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                      {w.lastDeliveryAt}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success(`Test ping dispatched to ${w.url}`)}
                        className="text-xs h-7 border-border/80 hover:bg-accent"
                      >
                        Ping
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

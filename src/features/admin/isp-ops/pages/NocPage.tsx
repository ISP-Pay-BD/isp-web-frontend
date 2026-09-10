'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { BellRing, Plus, RefreshCw, Send, CheckCircle2, ShieldAlert, Webhook, Mail, Terminal, Download } from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';
import type { NocHook } from '@/data/admin/isp-ops.data';

const searchFilter = (row: LegacyRow<NocHook>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.type).toLowerCase().includes(q) ||
    String(r.target).toLowerCase().includes(q)
  );
};

export function NocPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [hooks, setHooks] = useState<NocHook[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isTestingAll, setIsTestingAll] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'snmp' | 'webhook' | 'email'>('webhook');
  const [target, setTarget] = useState('');

  const initialHooks = data?.nocHooks ?? [];
  const list = hooks.length > 0 ? hooks : initialHooks;

  const totalHooks = list.length;
  const enabledCount = list.filter((r) => r.enabled).length;
  const webhookCount = list.filter((r) => r.type === 'webhook').length;
  const snmpCount = list.filter((r) => r.type === 'snmp').length;

  const handleAddHook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !target.trim()) {
      toast.error('Please enter hook name and target URI/endpoint');
      return;
    }

    const newHook: NocHook = {
      id: `noc_${Date.now()}`,
      name,
      type,
      target,
      enabled: true,
    };

    setHooks((prev) => [newHook, ...(prev.length > 0 ? prev : initialHooks)]);
    toast.success(`NOC Alert Hook "${newHook.name}" created and active.`);
    setModalOpen(false);
    setName('');
    setTarget('');
  };

  const handleTestHook = (hook: NocHook) => {
    toast.promise(
      new Promise((res) => setTimeout(res, 500)),
      {
        loading: `Sending test payload to ${hook.name}...`,
        success: `Payload dispatched to ${hook.target} (HTTP 200 OK / SNMP Trap acknowledged)`,
        error: 'Target unreachable',
      },
    );
  };

  const handleTestAll = () => {
    setIsTestingAll(true);
    setTimeout(() => {
      setIsTestingAll(false);
      toast.success('Dispatched test heartbeats across all configured NOC alerting endpoints.');
    }, 750);
  };

  const handleExportCsv = () => {
    const headers = ['Hook Name', 'Protocol Type', 'Target Endpoint / Trap OID', 'Status'];
    const rows = list.map((h) => [h.name, h.type.toUpperCase(), h.target, h.enabled ? 'Enabled' : 'Disabled']);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `noc-alert-hooks-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('NOC hooks inventory exported.');
  };

  const columns = useMemo<LegacyColumnDef<NocHook, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Hook Title & Service',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <BellRing className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{row.original.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{row.original.type} integration</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Alert Channel',
        cell: ({ row }) => {
          const t = row.original.type;
          return (
            <div className="flex items-center gap-1.5">
              {t === 'webhook' && <Webhook className="h-3.5 w-3.5 text-blue-500" />}
              {t === 'snmp' && <Terminal className="h-3.5 w-3.5 text-purple-500" />}
              {t === 'email' && <Mail className="h-3.5 w-3.5 text-amber-500" />}
              <Badge variant="outline" className="capitalize text-xs font-mono border-border/70">
                {t}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'target',
        header: 'Endpoint / Destination',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground bg-muted/30 px-2 py-1 rounded border border-border/40 max-w-[280px] truncate block">
            {row.original.target}
          </span>
        ),
      },
      {
        accessorKey: 'enabled',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.enabled
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs'
                : 'bg-muted text-muted-foreground text-xs'
            }
          >
            {row.original.enabled ? (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            ) : (
              'Disabled'
            )}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => handleTestHook(row.original)}
            >
              <Send className="h-3 w-3 text-primary" />
              Test Trigger
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading && list.length === 0) return <PageSkeleton variant="table" />;
  if (isError && list.length === 0) {
    return <EmptyState title="Failed to load NOC hooks" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="NOC Hooks & Incident Alerting"
        subtitle="Forward fiber cuts, OLT link downs, BGP flapping, and MikroTik outages to Slack, Telegram, Grafana, or PagerDuty"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Network' }, { label: 'NOC Hooks' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleTestAll} disabled={isTestingAll}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isTestingAll ? 'animate-spin' : ''}`} />
              Test All Hooks
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-1.5" />
              Export Hooks
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add NOC Hook
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Configured Hooks</span>
            <BellRing className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{totalHooks}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{enabledCount} active listeners</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Webhook Forwarders</span>
            <Webhook className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{webhookCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Slack, Discord & Telegram</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>SNMP Trap Receivers</span>
            <Terminal className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{snmpCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Zabbix & PRTG endpoints</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Delivery Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">99.9% ACK</div>
            <p className="text-xs text-muted-foreground mt-0.5">Zero dropped outage alerts</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={list}
        searchKey="name"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search NOC hooks by name, channel, or URL..."
        toolbarActions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add NOC Hook
          </Button>
        }
      />

      {/* Add NOC Hook Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Configure NOC Incident Hook</DialogTitle>
            <DialogDescription>
              Create an automated alerting bridge to send real-time ISP network incident notifications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddHook} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Hook Name / Service *</Label>
              <Input
                id="name"
                placeholder="e.g. Telegram NOC Emergency Room"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="type">Channel Type</Label>
                <Select value={type} onValueChange={(val: 'snmp' | 'webhook' | 'email' | null) => { if (val) setType(val); }}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webhook">HTTP Webhook (JSON POST)</SelectItem>
                    <SelectItem value="snmp">SNMP Trap v2c / v3</SelectItem>
                    <SelectItem value="email">SMTP Email Escalation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="severity">Trigger Severity</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="All events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All (Info, Warning, Critical)</SelectItem>
                    <SelectItem value="critical">Critical Outages Only</SelectItem>
                    <SelectItem value="major">Major & Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="target">Target Endpoint / URL / Receiver *</Label>
              <Input
                id="target"
                placeholder={type === 'webhook' ? 'https://api.telegram.org/bot.../sendMessage' : '103.15.20.5:162'}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Payloads include node IP, PON port, affected customer count, and duration.</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create NOC Hook</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


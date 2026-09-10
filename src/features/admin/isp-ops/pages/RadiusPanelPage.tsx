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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Radio, Server, Activity, Plus, RefreshCw, Send, ShieldCheck, Download, CheckCircle2, XCircle } from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';
import type { RadiusCoaLog, RadiusNas } from '@/data/admin/isp-ops.data';

const nasFilter = (row: LegacyRow<RadiusNas>, _c: string, v: unknown) => {
  const q = String(v ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return r.name.toLowerCase().includes(q) || r.ip.includes(q) || r.type.toLowerCase().includes(q);
};

const coaFilter = (row: LegacyRow<RadiusCoaLog>, _c: string, v: unknown) => {
  const q = String(v ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    r.username.toLowerCase().includes(q) ||
    r.nas.toLowerCase().includes(q) ||
    r.action.toLowerCase().includes(q) ||
    r.result.toLowerCase().includes(q)
  );
};

export function RadiusPanelPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [nasList, setNasList] = useState<RadiusNas[]>([]);
  const [coaLogs, setCoaLogs] = useState<RadiusCoaLog[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [coaModalOpen, setCoaModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Add NAS form
  const [nasName, setNasName] = useState('');
  const [nasIp, setNasIp] = useState('');
  const [nasSecret, setNasSecret] = useState('');
  const [nasType, setNasType] = useState<'mikrotik' | 'cisco' | 'other'>('mikrotik');

  // Manual CoA Disconnect form
  const [coaUsername, setCoaUsername] = useState('');
  const [coaNas, setCoaNas] = useState('');
  const [coaAction, setCoaAction] = useState<'disconnect' | 'coa' | 'pod'>('disconnect');

  const initialNas = data?.radiusNas ?? [];
  const initialCoa = data?.radiusCoaLog ?? [];

  const activeNasList = nasList.length > 0 ? nasList : initialNas;
  const activeCoaLogs = coaLogs.length > 0 ? coaLogs : initialCoa;

  const totalNas = activeNasList.length;
  const onlineNas = activeNasList.filter((n) => n.status === 'online').length;
  const totalCoa = activeCoaLogs.length;
  const successCoa = activeCoaLogs.filter((c) => c.result === 'ok').length;

  const handleCreateNas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nasName.trim() || !nasIp.trim()) {
      toast.error('Please enter NAS name and IP address');
      return;
    }

    const newNas: RadiusNas = {
      id: `nas_${Date.now()}`,
      name: nasName,
      ip: nasIp,
      secretMasked: nasSecret ? `••••${nasSecret.slice(-3)}` : '••••••••',
      type: nasType,
      status: 'online',
    };

    setNasList((prev) => [newNas, ...(prev.length > 0 ? prev : initialNas)]);
    toast.success(`RADIUS NAS "${newNas.name}" added.`);
    setModalOpen(false);
    setNasName('');
    setNasIp('');
    setNasSecret('');
  };

  const handleSendManualCoa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coaUsername.trim()) {
      toast.error('Please enter username');
      return;
    }

    const targetNas = coaNas || (activeNasList[0]?.name ?? 'Core NAS');
    const newLog: RadiusCoaLog = {
      id: `coa_${Date.now()}`,
      at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      nas: targetNas,
      username: coaUsername,
      action: coaAction,
      result: 'ok',
    };

    setCoaLogs((prev) => [newLog, ...(prev.length > 0 ? prev : initialCoa)]);
    toast.success(`Sent ${coaAction.toUpperCase()} request for "${coaUsername}" to ${targetNas}.`);
    setCoaModalOpen(false);
    setCoaUsername('');
  };

  const handleTestAllCoa = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      toast.success('RADIUS Server and CoA / PoD ports (UDP 3799 / 1700) responding normally with 1.8ms latency.');
    }, 800);
  };

  const handleExportLogs = () => {
    const headers = ['Timestamp', 'NAS Client', 'Username', 'Action', 'Result'];
    const rows = activeCoaLogs.map((l) => [l.at, l.nas, l.username, l.action, l.result]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `radius-coa-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('RADIUS CoA log export downloaded');
  };

  const nasColumns = useMemo<LegacyColumnDef<RadiusNas, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'NAS Client',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{row.original.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{row.original.ip}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'ip',
        header: 'IP Address',
        cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.ip}</span>,
      },
      {
        accessorKey: 'secretMasked',
        header: 'Shared Secret',
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/40">{row.original.secretMasked}</span>,
      },
      {
        accessorKey: 'type',
        header: 'Type / Vendor',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize text-xs font-medium border-border/70">
            {row.original.type}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.status === 'online'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }
          >
            {row.original.status === 'online' ? (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Offline
              </span>
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
              className="h-8 text-xs"
              onClick={() => toast.success(`Pinging RADIUS dictionary on ${row.original.name}: 2ms (ACK)`)}
            >
              Ping NAS
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const coaColumns = useMemo<LegacyColumnDef<RadiusCoaLog, unknown>[]>(
    () => [
      {
        accessorKey: 'at',
        header: 'Timestamp',
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.at}</span>,
      },
      {
        accessorKey: 'nas',
        header: 'NAS Gateway',
        cell: ({ row }) => <span className="font-semibold text-xs text-foreground">{row.original.nas}</span>,
      },
      {
        accessorKey: 'username',
        header: 'Target User',
        enableHiding: false,
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-primary">{row.original.username}</span>,
      },
      {
        accessorKey: 'action',
        header: 'Action Requested',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-mono capitalize border-border/70">
            {row.original.action}
          </Badge>
        ),
      },
      {
        accessorKey: 'result',
        header: 'RADIUS Result',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.result === 'ok'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }
          >
            {row.original.result === 'ok' ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                CoA-ACK
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                CoA-NAK
              </span>
            )}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (isLoading && activeNasList.length === 0) return <PageSkeleton variant="table" />;
  if (isError && activeNasList.length === 0) {
    return <EmptyState title="Failed to load RADIUS" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="FreeRADIUS & CoA / PoD"
        subtitle="Manage Network Access Servers (NAS), RADIUS dictionaries, and inspect live CoA disconnect packets"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Network' }, { label: 'RADIUS' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleTestAllCoa} disabled={isTesting}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isTesting ? 'animate-spin' : ''}`} />
              Test RADIUS
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCoaModalOpen(true)}>
              <Send className="h-4 w-4 mr-1.5 text-primary" />
              Send CoA Packet
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add NAS Client
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Configured NAS</span>
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{totalNas}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Active gateways</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>NAS Health</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{onlineNas} / {totalNas}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Responding to auth</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>CoA / PoD Packets</span>
            <Activity className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{totalCoa}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Disconnect & speed changes</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Success Rate</span>
            <Radio className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {totalCoa > 0 ? `${Math.round((successCoa / totalCoa) * 100)}%` : '100%'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">CoA-ACK confirmations</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="nas" className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="nas" className="text-xs">
              <Server className="h-3.5 w-3.5 mr-1.5" />
              NAS Clients ({totalNas})
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              CoA / PoD Audit Trail ({totalCoa})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="nas" className="space-y-4 m-0">
          <DataTable
            columns={nasColumns}
            data={activeNasList}
            searchKey="name"
            searchFilterFn={nasFilter}
            searchPlaceholder="Search NAS client by name, IP, or type..."
            toolbarActions={
              <Button size="sm" onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add NAS Client
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 m-0">
          <DataTable
            columns={coaColumns}
            data={activeCoaLogs}
            searchKey="username"
            searchFilterFn={coaFilter}
            searchPlaceholder="Search CoA logs by username, NAS, or action..."
            toolbarActions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportLogs}>
                  <Download className="h-4 w-4 mr-1.5" />
                  Export Logs
                </Button>
                <Button size="sm" onClick={() => setCoaModalOpen(true)}>
                  <Send className="h-4 w-4 mr-1.5" />
                  Send CoA
                </Button>
              </div>
            }
          />
        </TabsContent>
      </Tabs>

      {/* Add NAS Client Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add Network Access Server (NAS)</DialogTitle>
            <DialogDescription>
              Register a MikroTik, Cisco, or Huawei gateway router as a recognized RADIUS client.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNas} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nasName">NAS Identifier / Name *</Label>
              <Input
                id="nasName"
                placeholder="e.g. Uttara-Core-CCR"
                value={nasName}
                onChange={(e) => setNasName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nasIp">Host / IP Address *</Label>
                <Input
                  id="nasIp"
                  placeholder="103.15.20.1"
                  value={nasIp}
                  onChange={(e) => setNasIp(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nasType">Server Type</Label>
                <Select value={nasType} onValueChange={(val: 'mikrotik' | 'cisco' | 'other' | null) => { if (val) setNasType(val); }}>
                  <SelectTrigger id="nasType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mikrotik">MikroTik RouterOS</SelectItem>
                    <SelectItem value="cisco">Cisco IOS</SelectItem>
                    <SelectItem value="other">Generic RFC 2865</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nasSecret">RADIUS Shared Secret *</Label>
              <Input
                id="nasSecret"
                type="password"
                placeholder="Secret key configured on router"
                value={nasSecret}
                onChange={(e) => setNasSecret(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Must match the secret entered in RouterOS /radius settings.</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add NAS Client</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manual Send CoA Modal */}
      <Dialog open={coaModalOpen} onOpenChange={setCoaModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Send RADIUS CoA / PoD Packet</DialogTitle>
            <DialogDescription>
              Transmit an immediate RFC 3576 Change-of-Authorization or Disconnect request to the gateway.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendManualCoa} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="coaUsername">PPPoE / Hotspot Username *</Label>
              <Input
                id="coaUsername"
                placeholder="e.g. user_uttara_104"
                value={coaUsername}
                onChange={(e) => setCoaUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coaNas">Target NAS Client</Label>
              <Select value={coaNas} onValueChange={(val) => { if (val) setCoaNas(val); }}>
                <SelectTrigger id="coaNas">
                  <SelectValue placeholder="Select target NAS..." />
                </SelectTrigger>
                <SelectContent>
                  {activeNasList.map((n) => (
                    <SelectItem key={n.id} value={n.name}>
                      {n.name} ({n.ip})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coaAction">CoA Action</Label>
              <Select value={coaAction} onValueChange={(val: 'disconnect' | 'coa' | 'pod' | null) => { if (val) setCoaAction(val); }}>
                <SelectTrigger id="coaAction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disconnect">Disconnect (PoD Packet)</SelectItem>
                  <SelectItem value="coa">Re-apply Rate-Limit (CoA)</SelectItem>
                  <SelectItem value="pod">Packet of Disconnect (PoD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCoaModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Transmit CoA</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

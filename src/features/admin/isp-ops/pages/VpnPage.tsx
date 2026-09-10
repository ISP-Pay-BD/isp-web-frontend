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
import { Shield, Plus, RefreshCw, Zap, Download, Lock, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';
import type { VpnTunnel } from '@/data/admin/isp-ops.data';

const searchFilter = (row: LegacyRow<VpnTunnel>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.peer).toLowerCase().includes(q) ||
    String(r.protocol).toLowerCase().includes(q) ||
    String(r.status).toLowerCase().includes(q)
  );
};

export function VpnPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [tunnels, setTunnels] = useState<VpnTunnel[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [peer, setPeer] = useState('');
  const [protocol, setProtocol] = useState<'wireguard' | 'ipsec' | 'l2tp'>('wireguard');

  const initialTunnels = data?.vpnTunnels ?? [];
  const list = tunnels.length > 0 ? tunnels : initialTunnels;

  const totalTunnels = list.length;
  const upCount = list.filter((r) => r.status === 'up').length;
  const downCount = totalTunnels - upCount;
  const wireguardCount = list.filter((r) => r.protocol === 'wireguard').length;

  const handleAddTunnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !peer.trim()) {
      toast.error('Please enter tunnel name and peer IP endpoint');
      return;
    }

    const newTun: VpnTunnel = {
      id: `vpn_${Date.now()}`,
      name,
      peer,
      protocol,
      status: 'up',
      uptime: 'Just connected',
    };

    setTunnels((prev) => [newTun, ...(prev.length > 0 ? prev : initialTunnels)]);
    toast.success(`VPN Tunnel "${newTun.name}" initiated and peer key exchanged.`);
    setModalOpen(false);
    setName('');
    setPeer('');
  };

  const handleTestHandshake = (tun: VpnTunnel) => {
    toast.promise(
      new Promise((res, rej) => {
        setTimeout(() => {
          if (tun.status === 'up') {
            res({ rtt: '1.4ms', cipher: 'ChaCha20-Poly1305' });
          } else {
            rej(new Error(`Handshake timeout to ${tun.peer}`));
          }
        }, 550);
      }),
      {
        loading: `Testing crypto handshake to ${tun.peer}...`,
        success: (res) => `Tunnel ${tun.name} active (${(res as { rtt: string }).rtt}, ${(res as { cipher: string }).cipher})`,
        error: (err) => (err as Error).message,
      },
    );
  };

  const handleSyncAllTunnels = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Synced WireGuard peer states, IPsec SAs, and encryption keys from edge routers.');
    }, 800);
  };

  const handleExportCsv = () => {
    const headers = ['Tunnel Name', 'Peer IP / Host', 'Protocol', 'Uptime', 'Status'];
    const rows = list.map((t) => [t.name, t.peer, t.protocol.toUpperCase(), t.uptime, t.status.toUpperCase()]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vpn-tunnels-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('VPN tunnels inventory exported.');
  };

  const columns = useMemo<LegacyColumnDef<VpnTunnel, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Tunnel Name',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">POP Backhaul Link</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'peer',
        header: 'Peer Remote IP',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-foreground bg-muted/40 px-2 py-1 rounded border border-border/40">
            {row.original.peer}
          </span>
        ),
      },
      {
        accessorKey: 'protocol',
        header: 'Encryption Protocol',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-muted-foreground" />
            <Badge variant="outline" className="uppercase text-xs font-mono border-border/70">
              {row.original.protocol}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'uptime',
        header: 'Tunnel Uptime',
        cell: ({ row }) => (
          <div>
            <span className="font-mono text-xs font-semibold text-foreground">{row.original.uptime}</span>
            <div className="text-xs text-muted-foreground">Continuous Link</div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.status === 'up'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs'
            }
          >
            {row.original.status === 'up' ? (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Tunnel Up
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Link Down
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
              className="h-8 text-xs gap-1"
              onClick={() => handleTestHandshake(row.original)}
            >
              <Zap className="h-3 w-3 text-amber-500" />
              Test Peer
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading && list.length === 0) return <PageSkeleton variant="table" />;
  if (isError && list.length === 0) {
    return <EmptyState title="Failed to load VPN tunnels" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="VPN Site-to-Site & Remote POP Tunnels"
        subtitle="Manage WireGuard meshes, IPsec Site-to-Site crypto tunnels, L2TP backhauls, and keep-alive monitoring"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Network' }, { label: 'VPN' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSyncAllTunnels} disabled={isSyncing}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync SAs & Keys
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-1.5" />
              Export Tunnels
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create VPN Tunnel
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Configured Tunnels</span>
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{totalTunnels}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Backhaul encrypted links</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Online Tunnels</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{upCount} / {totalTunnels}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Active keep-alive</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>WireGuard Meshes</span>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{wireguardCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">High-throughput UDP</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Latency SLA</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">1.4 ms</div>
            <p className="text-xs text-muted-foreground mt-0.5">Avg cross-POP latency</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={list}
        searchKey="name"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search VPN tunnels by name, remote peer IP, or protocol..."
        toolbarActions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create VPN Tunnel
          </Button>
        }
      />

      {/* Add VPN Tunnel Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Provision Secure VPN Tunnel</DialogTitle>
            <DialogDescription>
              Establish an encrypted site-to-site backhaul tunnel connecting POP stations or corporate HQ.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTunnel} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Tunnel Identifier *</Label>
              <Input
                id="name"
                placeholder="e.g. Uttara-To-Dhanmondi-WG"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="peer">Peer Remote Endpoint IP *</Label>
                <Input
                  id="peer"
                  placeholder="103.15.20.10"
                  value={peer}
                  onChange={(e) => setPeer(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="protocol">VPN Protocol</Label>
                <Select value={protocol} onValueChange={(val: 'wireguard' | 'ipsec' | 'l2tp' | null) => { if (val) setProtocol(val); }}>
                  <SelectTrigger id="protocol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wireguard">WireGuard (ChaCha20)</SelectItem>
                    <SelectItem value="ipsec">IPsec IKEv2 (AES-256-GCM)</SelectItem>
                    <SelectItem value="l2tp">L2TP / IPsec</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="preshared">Pre-Shared Key / Public Key</Label>
              <Input
                id="preshared"
                type="password"
                placeholder="Auto-generated cryptographic keypair"
              />
              <p className="text-xs text-muted-foreground">Keys are synchronized automatically with RouterOS /wireguard peers.</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Establish Tunnel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Binary, Plus, Download, RefreshCw, Network, Layers, ShieldCheck, HardDrive } from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IpamBlock } from '@/data/admin/isp-ops.data';

const searchFilter = (row: LegacyRow<IpamBlock>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.cidr).toLowerCase().includes(q) ||
    String(r.family).toLowerCase().includes(q) ||
    String(r.purpose).toLowerCase().includes(q)
  );
};

export function IpamPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [blocks, setBlocks] = useState<IpamBlock[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [cidr, setCidr] = useState('');
  const [family, setFamily] = useState<'v4' | 'v6'>('v4');
  const [totalIps, setTotalIps] = useState('256');
  const [purpose, setPurpose] = useState('Corporate Leased Line');

  const initialBlocks = data?.ipamBlocks ?? [];
  const list = blocks.length > 0 ? blocks : initialBlocks;

  const totalBlocks = list.length;
  const totalAllocated = list.reduce((s, r) => s + r.used, 0);
  const totalCapacity = list.reduce((s, r) => s + r.total, 0);
  const ipv4Count = list.filter((b) => b.family === 'v4').length;
  const ipv6Count = list.filter((b) => b.family === 'v6').length;
  const overallUtilPct = totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0;

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cidr.trim()) {
      toast.error('Please specify CIDR block');
      return;
    }

    const newBlock: IpamBlock = {
      id: `ipam_${Date.now()}`,
      cidr,
      family,
      used: 0,
      total: Number(totalIps) || (family === 'v4' ? 256 : 65536),
      purpose,
    };

    setBlocks((prev) => [newBlock, ...(prev.length > 0 ? prev : initialBlocks)]);
    toast.success(`Subnet ${newBlock.cidr} registered into IPAM.`);
    setModalOpen(false);
    setCidr('');
  };

  const handleSyncBgp = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('BGP routing tables and RPKI ROA validation synced successfully.');
    }, 800);
  };

  const handleExportCsv = () => {
    const headers = ['CIDR Prefix', 'IP Family', 'Used IPs', 'Total IPs', 'Utilization %', 'Allocated Purpose'];
    const rows = list.map((b) => [
      b.cidr,
      b.family.toUpperCase(),
      b.used,
      b.total,
      `${Math.round((b.used / b.total) * 100)}%`,
      b.purpose,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ipam-subnets-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('IPAM Subnet inventory downloaded.');
  };

  const columns = useMemo<LegacyColumnDef<IpamBlock, unknown>[]>(
    () => [
      {
        accessorKey: 'cidr',
        header: 'Subnet Prefix (CIDR)',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono text-xs font-bold">
              {row.original.family === 'v4' ? 'v4' : 'v6'}
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-foreground">{row.original.cidr}</p>
              <p className="text-xs text-muted-foreground">{row.original.family === 'v4' ? 'IPv4 Subnet' : 'IPv6 Global Unicast'}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'purpose',
        header: 'Assigned Purpose',
        cell: ({ row }) => (
          <div>
            <span className="text-sm font-medium text-foreground">{row.original.purpose}</span>
            <div className="text-xs text-muted-foreground">APNIC Allocated</div>
          </div>
        ),
      },
      {
        id: 'utilization',
        accessorKey: 'used',
        header: 'Allocation & Utilization',
        cell: ({ row }) => {
          const util = Math.round((row.original.used / (row.original.total || 1)) * 100);
          return (
            <div className="min-w-[170px] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold tabular-nums text-foreground">
                  {row.original.used.toLocaleString()} / {row.original.total.toLocaleString()} IPs
                </span>
                <span className={util > 85 ? 'text-rose-500 font-bold' : 'text-muted-foreground'}>
                  {util}%
                </span>
              </div>
              <Progress value={util} className="h-1.5" />
            </div>
          );
        },
      },
      {
        accessorKey: 'family',
        header: 'Family',
        cell: ({ row }) => (
          <Badge variant="outline" className="uppercase font-mono text-xs border-border/70">
            {row.original.family}
          </Badge>
        ),
      },
      {
        id: 'status',
        header: 'RPKI ROA',
        cell: () => (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Valid (AS24185)
            </span>
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => toast.success(`Subnet ${row.original.cidr} whois query OK`)}
            >
              Inspect
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading && list.length === 0) return <PageSkeleton variant="table" />;
  if (isError && list.length === 0) {
    return <EmptyState title="Failed to load IPAM" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="IPAM — IP Address Management"
        subtitle="Authoritative IPv4 / IPv6 prefix planning, APNIC allocations, and subnet utilization"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Network' }, { label: 'IPAM' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSyncBgp} disabled={isSyncing}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync BGP & RPKI
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-1.5" />
              Export Subnets
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Subnet
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Total Subnets</span>
            <Binary className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{totalBlocks}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{ipv4Count} IPv4 / {ipv6Count} IPv6 blocks</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Assigned Addresses</span>
            <Network className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {totalAllocated.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Out of {totalCapacity.toLocaleString()} IPs</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Overall Utilization</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{overallUtilPct}%</div>
            <p className="text-xs text-muted-foreground mt-0.5">Capacity allocated</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>RPKI Status</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">100% Valid</div>
            <p className="text-xs text-muted-foreground mt-0.5">Route Origin Auth</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={list}
        searchKey="cidr"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search by CIDR prefix, purpose, or IP family..."
        toolbarActions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Subnet
          </Button>
        }
      />

      {/* Add Subnet Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Register IP Subnet Block</DialogTitle>
            <DialogDescription>
              Assign and track an IPv4 or IPv6 prefix in your authoritative IPAM catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddBlock} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cidr">CIDR Prefix *</Label>
              <Input
                id="cidr"
                placeholder="e.g. 103.15.35.0/24 or 2400:8901::/32"
                value={cidr}
                onChange={(e) => setCidr(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="family">IP Protocol</Label>
                <Select value={family} onValueChange={(val: 'v4' | 'v6' | null) => { if (val) setFamily(val); }}>
                  <SelectTrigger id="family">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v4">IPv4 Subnet</SelectItem>
                    <SelectItem value="v6">IPv6 Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="totalIps">Total Host Count</Label>
                <Input
                  id="totalIps"
                  type="number"
                  placeholder="256"
                  value={totalIps}
                  onChange={(e) => setTotalIps(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="purpose">Allocation Purpose</Label>
              <Input
                id="purpose"
                placeholder="e.g. CGNAT Public NAT Pool / Corporate DIA"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Register Subnet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


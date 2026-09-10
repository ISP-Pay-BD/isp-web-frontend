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
import { toast } from 'sonner';
import { Gauge, Plus, RefreshCw, Download, Activity, CheckCircle2, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';
import type { BandwidthSlaRow } from '@/data/admin/isp-ops.data';

const searchFilter = (row: LegacyRow<BandwidthSlaRow>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.link).toLowerCase().includes(q) ||
    String(r.committedMbps).toLowerCase().includes(q) ||
    String(r.avgMbps).toLowerCase().includes(q) ||
    String(r.uptimePct).toLowerCase().includes(q)
  );
};

export function BandwidthSlaPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [slaList, setSlaList] = useState<BandwidthSlaRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  // Form State
  const [link, setLink] = useState('');
  const [committedMbps, setCommittedMbps] = useState('1000');
  const [avgMbps, setAvgMbps] = useState('980');
  const [uptimePct, setUptimePct] = useState('99.98');

  const initialRows = data?.bandwidthSla ?? [];
  const list = slaList.length > 0 ? slaList : initialRows;

  const totalLinks = list.length;
  const totalCommitted = list.reduce((s, r) => s + r.committedMbps, 0);
  const totalDelivered = list.reduce((s, r) => s + r.avgMbps, 0);
  const totalBreaches = list.reduce((s, r) => s + r.breaches, 0);
  const avgUptime = totalLinks > 0 ? (list.reduce((s, r) => s + r.uptimePct, 0) / totalLinks).toFixed(2) : '99.9';

  const handleAddSla = (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim()) {
      toast.error('Please enter uplink or client circuit name');
      return;
    }

    const newSla: BandwidthSlaRow = {
      id: `sla_${Date.now()}`,
      link,
      committedMbps: Number(committedMbps) || 1000,
      avgMbps: Number(avgMbps) || 980,
      uptimePct: Number(uptimePct) || 99.9,
      breaches: 0,
    };

    setSlaList((prev) => [newSla, ...(prev.length > 0 ? prev : initialRows)]);
    toast.success(`Bandwidth SLA monitor for "${newSla.link}" configured.`);
    setModalOpen(false);
    setLink('');
  };

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      toast.success('Generated 30-day BTRC & Enterprise SLA compliance audit. 0 penalty credits due.');
    }, 800);
  };

  const handleExportCsv = () => {
    const headers = ['Circuit / Upstream Link', 'Committed Bandwidth (Mbps)', 'Delivered Avg (Mbps)', 'Fulfillment %', 'Uptime %', 'SLA Breaches'];
    const rows = list.map((r) => [
      r.link,
      r.committedMbps,
      r.avgMbps,
      `${Math.round((r.avgMbps / (r.committedMbps || 1)) * 100)}%`,
      `${r.uptimePct}%`,
      r.breaches,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bandwidth-sla-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Bandwidth SLA compliance report downloaded.');
  };

  const columns = useMemo<LegacyColumnDef<BandwidthSlaRow, unknown>[]>(
    () => [
      {
        accessorKey: 'link',
        header: 'Upstream / DIA Circuit',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{row.original.link}</p>
              <p className="text-xs text-muted-foreground">Carrier Grade SLA</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'committedMbps',
        header: 'CIR Committed',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-foreground">
            {row.original.committedMbps.toLocaleString()} Mbps
          </span>
        ),
      },
      {
        accessorKey: 'avgMbps',
        header: 'Actual Delivery',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {row.original.avgMbps.toLocaleString()} Mbps
          </span>
        ),
      },
      {
        id: 'fulfillment',
        header: 'SLA Fulfillment',
        cell: ({ row }) => {
          const ratio = Math.round((row.original.avgMbps / (row.original.committedMbps || 1)) * 100);
          return (
            <div className="min-w-[150px] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{ratio}% CIR</span>
                <span className={ratio >= 98 ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                  {ratio >= 98 ? 'Guaranteed' : 'Fluctuating'}
                </span>
              </div>
              <Progress value={Math.min(ratio, 100)} className="h-1.5" />
            </div>
          );
        },
      },
      {
        accessorKey: 'uptimePct',
        header: 'Uptime %',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.uptimePct >= 99.9
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-xs'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-mono text-xs'
            }
          >
            {row.original.uptimePct}%
          </Badge>
        ),
      },
      {
        accessorKey: 'breaches',
        header: 'SLA Breaches',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.breaches === 0
                ? 'bg-muted text-muted-foreground text-xs'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-mono text-xs font-bold'
            }
          >
            {row.original.breaches === 0 ? '0 Incidents' : `${row.original.breaches} Breaches`}
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
              className="h-8 text-xs gap-1"
              onClick={() => toast.success(`Generated 30-Day MRTG throughput graph for ${row.original.link}`)}
            >
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              MRTG
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading && list.length === 0) return <PageSkeleton variant="table" />;
  if (isError && list.length === 0) {
    return <EmptyState title="Failed to load Bandwidth SLA" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth SLA & CIR Quality Assurance"
        subtitle="Track carrier uplink commitments, enterprise CIR fulfillment, packet loss, and automatic SLA rebate calculations"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Network' }, { label: 'Bandwidth SLA' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRunAudit} disabled={isAuditing}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isAuditing ? 'animate-spin' : ''}`} />
              Run SLA Audit
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-1.5" />
              Export Report
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add SLA Circuit
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Committed Capacity</span>
            <Gauge className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{(totalCommitted / 1000).toFixed(1)} Gbps</div>
            <p className="text-xs text-muted-foreground mt-0.5">Across {totalLinks} audited links</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Average Delivery</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{(totalDelivered / 1000).toFixed(1)} Gbps</div>
            <p className="text-xs text-muted-foreground mt-0.5">Fulfillment & CIR rate</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Mean Uptime</span>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{avgUptime}%</div>
            <p className="text-xs text-muted-foreground mt-0.5">99.9% contractual target</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>SLA Breaches (30d)</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{totalBreaches}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Zero penalty claims</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={list}
        searchKey="link"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search circuits, links, committed speeds..."
        toolbarActions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add SLA Circuit
          </Button>
        }
      />

      {/* Add SLA Circuit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Register Bandwidth SLA Target</DialogTitle>
            <DialogDescription>
              Configure Committed Information Rate (CIR), peak burst thresholds, and automated uptime tracking.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSla} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="link">Circuit / Provider Link Name *</Label>
              <Input
                id="link"
                placeholder="e.g. NTT IIG 10G Primary Link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="committedMbps">Committed Bandwidth (Mbps) *</Label>
                <Input
                  id="committedMbps"
                  type="number"
                  placeholder="1000"
                  value={committedMbps}
                  onChange={(e) => setCommittedMbps(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="avgMbps">Delivered Average (Mbps)</Label>
                <Input
                  id="avgMbps"
                  type="number"
                  placeholder="980"
                  value={avgMbps}
                  onChange={(e) => setAvgMbps(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="uptimePct">Target Uptime (%)</Label>
              <Input
                id="uptimePct"
                placeholder="99.95"
                value={uptimePct}
                onChange={(e) => setUptimePct(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Track SLA Circuit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


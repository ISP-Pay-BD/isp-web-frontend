'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIspOps } from '../hooks/use-isp-ops';
import type { OltOnu } from '@/data/admin/isp-ops.data';
import {
  Download,
  Radio,
  Activity,
  AlertTriangle,
  Zap,
  MoreHorizontal,
  RotateCw,
  Search,
  CheckCircle2,
  Signal,
  Router,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

const searchFilter = (row: LegacyRow<OltOnu>, _c: string, v: unknown) => {
  const q = String(v ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    r.sn.toLowerCase().includes(q) ||
    r.customerName.toLowerCase().includes(q) ||
    String(r.rxDbm).includes(q) ||
    String(r.status).toLowerCase().includes(q)
  );
};

export function OltOnusPage() {
  const params = useParams<{ id: string }>();
  const oltId = params?.id ?? 'olt_01';
  const { data, isLoading, isError, refetch } = useIspOps();
  const [onuList, setOnuList] = useState<OltOnu[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State for manual provision
  const [sn, setSn] = useState('');
  const [customerName, setCustomerName] = useState('');

  const initialRows = (data?.oltOnus ?? []).filter((o) => o.oltId === oltId || oltId === 'olt_01');
  const rows = onuList.length > 0 ? onuList : initialRows;

  const totalOnus = rows.length;
  const onlineCount = rows.filter((r) => r.status === 'online').length;
  const weakSignalCount = rows.filter((r) => Number(r.rxDbm) < -25 && r.status === 'online').length;
  const losCount = rows.filter((r) => r.status === 'los' || r.status === 'offline').length;

  const handleManualProvision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sn.trim()) {
      toast.error('Please enter ONU Serial');
      return;
    }

    const newOnu: OltOnu = {
      id: `onu_${Date.now()}`,
      oltId,
      sn: sn.toUpperCase(),
      customerName: customerName.trim() || 'New Subscriber',
      rxDbm: -19.5,
      txDbm: 2.3,
      status: 'online',
    };

    setOnuList((prev) => [newOnu, ...(prev.length > 0 ? prev : initialRows)]);
    toast.success(`ONU ${newOnu.sn} provisioned successfully on ${oltId}.`);
    setModalOpen(false);
    setSn('');
    setCustomerName('');
  };

  const handleExportCsv = () => {
    const headers = ['ONU Serial', 'Assigned Customer', 'Rx Power (dBm)', 'Tx Power (dBm)', 'Optical Status'];
    const csvRows = rows.map((r) => [
      r.sn,
      `"${r.customerName}"`,
      r.rxDbm,
      r.txDbm,
      r.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `onu_telemetry_${oltId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('ONU optical telemetry exported to CSV');
  };

  const handleScanDiscovery = () => {
    toast.promise(new Promise((res) => setTimeout(res, 1200)), {
      loading: `Scanning PON ports on ${oltId} for unconfigured ONUs...`,
      success: `Scan complete: 2 new un-provisioned ONUs discovered on Port PON 1/3!`,
      error: `Failed to scan ${oltId}`,
    });
  };

  const columns = useMemo<LegacyColumnDef<OltOnu, unknown>[]>(
    () => [
      {
        accessorKey: 'sn',
        header: 'ONU Serial Number (PON SN)',
        enableHiding: false,
        size: 210,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Router className="h-4 w-4" />
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
              {row.original.sn}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Subscriber / Client',
        size: 220,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground text-sm">{row.original.customerName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'rxDbm',
        header: 'Rx Power (dBm)',
        size: 160,
        cell: ({ row }) => {
          const rx = Number(row.original.rxDbm);
          const isGood = rx >= -24 && rx <= -14;
          const isFair = rx < -24 && rx >= -27;
          return (
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold tabular-nums">
              <Signal
                className={`h-3.5 w-3.5 ${
                  isGood ? 'text-emerald-500' : isFair ? 'text-amber-500' : 'text-rose-500'
                }`}
              />
              <span
                className={`px-2 py-0.5 rounded ${
                  isGood
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : isFair
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                {row.original.rxDbm} dBm
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'txDbm',
        header: 'Tx Power (dBm)',
        size: 140,
        cell: ({ row }) => (
          <span className="tabular-nums font-mono text-xs text-muted-foreground">
            +{row.original.txDbm} dBm
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Optical Link',
        size: 120,
        cell: ({ row }) => {
          const st = row.original.status;
          if (st === 'online') {
            return (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                Online Link
              </Badge>
            );
          }
          if (st === 'los') {
            return (
              <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/30">
                LOS / Cut
              </Badge>
            );
          }
          return (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              Offline
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>ONU Telemetry</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.success(`Optical power ping: ${r.rxDbm} dBm (stable)`)}>
                  <Zap className="h-3.5 w-3.5 mr-2 text-amber-500" />
                  Live Optical Ping
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success(`Reboot command sent to ONU ${r.sn}`)}>
                  <RotateCw className="h-3.5 w-3.5 mr-2 text-primary" />
                  Reboot ONU
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info(`Re-provisioned ${r.sn}`)}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  Re-provision Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load ONUs" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ONU Optical Power & Telemetry"
        subtitle={`Connected fiber terminals, optical attenuation (dBm), and signal telemetry for OLT Node "${oltId}".`}
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'OLT', href: '/admin/olt' },
          { label: `ONUs (${oltId})` },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleScanDiscovery} className="h-9">
              <Radio className="mr-2 h-4 w-4 text-emerald-500" />
              Scan & Discover
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Zap className="mr-2 h-4 w-4" />
              Provision ONU
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Mapped ONUs</span>
            <Router className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalOnus}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Terminals on this OLT</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Optimal Signal</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {onlineCount - weakSignalCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">-14 to -24 dBm range</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">High Attenuation</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
            {weakSignalCount}
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">&lt; -25 dBm (check patch)</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Loss of Signal (LOS)</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {losCount}
          </div>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">Fiber break / power off</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={rows}
        searchKey="sn"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search by ONU serial #, customer name, or dBm..."
      />

      {/* Provision ONU Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleManualProvision}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Provision Customer ONU
              </DialogTitle>
              <DialogDescription>
                Bind an optical serial number to an active GPON line profile on {oltId}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="onu-sn">ONU Serial Number (PON SN) *</Label>
                <Input
                  id="onu-sn"
                  placeholder="e.g. HWTC4A5B6C7D"
                  value={sn}
                  onChange={(e) => setSn(e.target.value)}
                  className="font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="onu-cust">Subscriber / Customer Name *</Label>
                <Input
                  id="onu-cust"
                  placeholder="e.g. Zahid Hasan (CUST-2041)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Complete Provisioning</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';
import {
  Plus,
  Download,
  Server,
  Layers,
  CheckCircle2,
  RefreshCw,
  Cpu,
  MoreHorizontal,
  Edit,
  Trash2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

type Row = IspOpsData['oltVendors'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.models).toLowerCase().includes(q) ||
    String(r.profileCount).toLowerCase().includes(q) ||
    String(r.lastSync).toLowerCase().includes(q)
  );
};

export function OltVendorsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [vendors, setVendors] = useState<Row[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [models, setModels] = useState('');
  const [profileCount, setProfileCount] = useState('8');

  const initialRows = data?.oltVendors ?? [];
  const rows = vendors.length > 0 ? vendors : initialRows;

  const totalVendors = rows.length;
  const totalProfiles = rows.reduce((s, r) => s + (r.profileCount || 0), 0);

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter vendor name');
      return;
    }

    const newVendor: Row = {
      id: `ov_${Date.now()}`,
      name,
      models: models.trim() || 'GPON / EPON Standard Series',
      profileCount: Number(profileCount) || 5,
      lastSync: new Date().toISOString().split('T')[0],
    };

    setVendors((prev) => [newVendor, ...(prev.length > 0 ? prev : initialRows)]);
    toast.success(`OLT Vendor profile "${newVendor.name}" registered.`);
    setModalOpen(false);
    setName('');
    setModels('');
  };

  const handleExportCsv = () => {
    const headers = ['Vendor Name', 'Supported Models', 'Configured Profiles', 'Last Telemetry Sync'];
    const csvRows = rows.map((r) => [
      `"${r.name}"`,
      `"${r.models}"`,
      r.profileCount,
      r.lastSync,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `olt_vendors_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('OLT vendor profiles exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Vendor & Brand Template',
        enableHiding: false,
        size: 240,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm">{String(row.original.name)}</span>
              <span className="text-xs text-muted-foreground block font-mono">SNMP / Telnet MIB</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'models',
        header: 'Supported Hardware Models',
        size: 280,
        cell: ({ row }) => (
          <span className="text-sm text-foreground font-mono">{String(row.original.models)}</span>
        ),
      },
      {
        accessorKey: 'profileCount',
        header: 'Profiles Configured',
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background font-mono tabular-nums font-semibold">
            {String(row.original.profileCount)} profiles
          </Badge>
        ),
      },
      {
        accessorKey: 'lastSync',
        header: 'Last Telemetry Sync',
        size: 160,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>{String(row.original.lastSync)}</span>
          </div>
        ),
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Vendor Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.success(`MIB tables refreshed for ${r.name}`)}>
                  <RefreshCw className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  Sync MIB Definitions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Editing template for ${r.name}`)}>
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Edit Vendor Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Vendor ${r.name} removed`)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Template
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
    return <EmptyState title="Failed to load vendors" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="OLT Multi-Vendor Drivers & Templates"
        subtitle="Manage hardware templates, SNMP MIB drivers, optical threshold profiles for Huawei, ZTE, BDCOM, and VSOL."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'OLT', href: '/admin/olt' },
          { label: 'Vendors' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export Directory
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Onboard Vendor
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Supported Vendors</span>
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalVendors}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Multi-vendor drivers</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Configured Profiles</span>
            <Layers className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalProfiles}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Provisioning templates</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Driver Status</span>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            100% Sync
          </div>
          <p className="mt-1 text-xs text-muted-foreground">MIB telemetry active</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={rows}
        searchKey="name"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search vendor by name, model, or sync status..."
      />

      {/* Onboard Vendor Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddVendor}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Add OLT Vendor Template
              </DialogTitle>
              <DialogDescription>
                Configure hardware series MIB definitions and auto-provisioning parameters.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="ov-name">Vendor / Brand Name *</Label>
                <Input
                  id="ov-name"
                  placeholder="e.g. Huawei SmartAX or ZTE C320"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ov-models">Supported Model Series</Label>
                <Input
                  id="ov-models"
                  placeholder="e.g. MA5608T, MA5800-X7, MA5800-X15"
                  value={models}
                  onChange={(e) => setModels(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ov-prof">Initial Profiles Count</Label>
                <Input
                  id="ov-prof"
                  type="number"
                  value={profileCount}
                  onChange={(e) => setProfileCount(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Template</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

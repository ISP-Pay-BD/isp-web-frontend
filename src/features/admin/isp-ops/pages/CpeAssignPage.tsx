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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';
import {
  Plus,
  Download,
  Router,
  CheckCircle2,
  Cpu,
  UserCheck,
  MoreHorizontal,
  RotateCcw,
  AlertTriangle,
  Radio,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

type Row = IspOpsData['cpeAssignments'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.serial).toLowerCase().includes(q) ||
    String(r.model).toLowerCase().includes(q) ||
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.assignedAt).toLowerCase().includes(q)
  );
};

export function CpeAssignPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [cpeList, setCpeList] = useState<Row[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [serial, setSerial] = useState('');
  const [model, setModel] = useState('Huawei HG8546M GPON ONU');
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState<'assigned' | 'spare'>('assigned');

  const initialRows = data?.cpeAssignments ?? [];
  const rows = cpeList.length > 0 ? cpeList : initialRows;

  const totalCpes = rows.length;
  const assignedCount = rows.filter((r) => r.status === 'assigned').length;
  const spareCount = rows.filter((r) => r.status === 'spare').length;
  const deploymentRate = totalCpes > 0 ? Math.round((assignedCount / totalCpes) * 100) : 0;

  const handleAssignCpe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) {
      toast.error('Please enter CPE device serial number');
      return;
    }

    const newAssignment: Row = {
      id: `cpe_${Date.now()}`,
      serial: serial.toUpperCase(),
      model,
      customerName: status === 'assigned' ? (customerName.trim() || 'Direct Client') : 'Unassigned (Spare)',
      assignedAt: new Date().toISOString().split('T')[0],
      status,
    };

    setCpeList((prev) => [newAssignment, ...(prev.length > 0 ? prev : initialRows)]);
    toast.success(`CPE Serial ${newAssignment.serial} registered (${status}).`);
    setModalOpen(false);
    setSerial('');
    setCustomerName('');
  };

  const handleExportCsv = () => {
    const headers = ['Device Serial', 'Model Specification', 'Customer / Subscriber', 'Assigned Date', 'Status'];
    const csvRows = rows.map((r) => [
      r.serial,
      `"${r.model}"`,
      `"${r.customerName}"`,
      r.assignedAt,
      r.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cpe_assignments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CPE registry exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'serial',
        header: 'CPE Serial Number',
        enableHiding: false,
        size: 190,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Router className="h-4 w-4" />
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
              {String(row.original.serial)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'model',
        header: 'Device Model Specification',
        size: 240,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{String(row.original.model)}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Assigned Subscriber',
        size: 220,
        cell: ({ row }) => {
          const cust = String(row.original.customerName);
          const isSpare = row.original.status === 'spare';
          return (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className={`text-sm ${isSpare ? 'text-muted-foreground italic' : 'font-medium text-foreground'}`}>
                {cust}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'assignedAt',
        header: 'Assignment Date',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{String(row.original.assignedAt)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        cell: ({ row }) => {
          const st = row.original.status;
          if (st === 'assigned') {
            return (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                Assigned
              </Badge>
            );
          }
          if (st === 'spare') {
            return (
              <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/30">
                In Stock (Spare)
              </Badge>
            );
          }
          return (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/30">
              Defective
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Device Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.success(`Diagnostic ping sent to ${r.serial}`)}>
                  <Radio className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  Ping / Optical Test
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Reassign modal for ${r.serial}`)}>
                  <UserCheck className="h-3.5 w-3.5 mr-2" />
                  Reassign Subscriber
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Returned ${r.serial} to spare inventory`)}>
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Return to Spare Pool
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Device ${r.serial} marked defective`)}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-2" />
                  Mark as Defective
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
    return <EmptyState title="Failed to load CPE records" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CPE & Device Assignment"
        subtitle="Manage optical network terminals, wireless routers, and subscriber CPE allocations."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Inventory', href: '/admin/inventory/items' },
          { label: 'CPE Assignment' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export Registry
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Assign CPE
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total CPEs</span>
            <Router className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalCpes}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Tracked in registry</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Assigned Online</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {assignedCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Customer in-service</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Spare Pool</span>
            <Cpu className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {spareCount}
          </div>
          <p className="mt-1 text-xs text-sky-600 dark:text-sky-400 font-medium">Ready for dispatch</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Deployment Rate</span>
            <UserCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {deploymentRate}%
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Active utilization</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={rows}
        searchKey="serial"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search by serial #, model, or customer name..."
      />

      {/* Assign CPE Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleAssignCpe}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Router className="h-5 w-5 text-primary" />
                Register / Assign CPE Device
              </DialogTitle>
              <DialogDescription>
                Assign an optical network terminal (ONU) or wireless router to a subscriber account.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cpe-serial">Device Serial Number (PON SN) *</Label>
                  <Input
                    id="cpe-serial"
                    placeholder="e.g. HWTC1A2B3C4D"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    className="font-mono uppercase"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cpe-status">Allocation Status</Label>
                  <Select
                    value={status}
                    onValueChange={(val) => {
                      if (val === 'assigned' || val === 'spare') setStatus(val);
                    }}
                  >
                    <SelectTrigger id="cpe-status">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assigned">Assigned to Subscriber</SelectItem>
                      <SelectItem value="spare">In Stock (Spare Pool)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cpe-model">Model Specification *</Label>
                <Select value={model} onValueChange={(val) => { if (val) setModel(val); }}>
                  <SelectTrigger id="cpe-model">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Huawei HG8546M GPON ONU">Huawei HG8546M GPON ONU (1GE+3FE+WiFi)</SelectItem>
                    <SelectItem value="ZTE F660 V8.0 GPON Terminal">ZTE F660 V8.0 GPON Terminal</SelectItem>
                    <SelectItem value="VSOL V2801SG 1GE XPON ONU">VSOL V2801SG 1GE XPON ONU</SelectItem>
                    <SelectItem value="TP-Link Archer C6 Dual-Band Router">TP-Link Archer C6 Dual-Band Router</SelectItem>
                    <SelectItem value="Mikrotik hAP ac2 Dual-Concurrent AP">Mikrotik hAP ac2 Dual-Concurrent AP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === 'assigned' && (
                <div className="space-y-1.5">
                  <Label htmlFor="cpe-cust">Subscriber / Customer Name *</Label>
                  <Input
                    id="cpe-cust"
                    placeholder="e.g. Tanvir Ahmed (CUST-1042)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Complete Assignment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

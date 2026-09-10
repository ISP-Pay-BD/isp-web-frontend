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
import { Cable, RefreshCw, Plus, Download, Radio, ShieldCheck, Cpu, Wifi, RotateCw, CheckCircle2 } from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';
import type { AcsDevice } from '@/data/admin/isp-ops.data';

const searchFilter = (row: LegacyRow<AcsDevice>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.serial).toLowerCase().includes(q) ||
    String(r.manufacturer).toLowerCase().includes(q) ||
    String(r.model).toLowerCase().includes(q) ||
    String(r.lastInform).toLowerCase().includes(q) ||
    String(r.status).toLowerCase().includes(q)
  );
};

export function AcsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [devices, setDevices] = useState<AcsDevice[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Form State
  const [serial, setSerial] = useState('');
  const [manufacturer, setManufacturer] = useState('TP-Link');
  const [model, setModel] = useState('Archer C6 v3');

  const initialDevices = data?.acsDevices ?? [];
  const list = devices.length > 0 ? devices : initialDevices;

  const totalDevices = list.length;
  const onlineDevices = list.filter((r) => r.status === 'online').length;
  const offlineDevices = totalDevices - onlineDevices;

  const handleRegisterDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) {
      toast.error('Please enter CPE Serial number / MAC');
      return;
    }

    const newDev: AcsDevice = {
      id: `cpe_${Date.now()}`,
      serial,
      manufacturer,
      model,
      lastInform: 'Just now',
      status: 'online',
    };

    setDevices((prev) => [newDev, ...(prev.length > 0 ? prev : initialDevices)]);
    toast.success(`CPE Router (${newDev.serial}) added to GenieACS provisioner.`);
    setModalOpen(false);
    setSerial('');
  };

  const handlePushGlobalProvision = () => {
    setIsProvisioning(true);
    setTimeout(() => {
      setIsProvisioning(false);
      toast.success('Pushed Wi-Fi SSID, TR-069 PeriodicInformInterval (300s), and DNS configs to all online CPEs.');
    }, 900);
  };

  const handleRebootCpe = (dev: AcsDevice) => {
    toast.promise(
      new Promise((res) => setTimeout(res, 600)),
      {
        loading: `Sending TR-069 RPC Reboot to ${dev.serial}...`,
        success: `Reboot command queued on ACS server for ${dev.manufacturer} ${dev.model}.`,
        error: 'Failed to dispatch RPC command',
      },
    );
  };

  const handleExportCsv = () => {
    const headers = ['Serial Number', 'Manufacturer', 'Model', 'Last Inform', 'Status'];
    const rows = list.map((d) => [d.serial, d.manufacturer, d.model, d.lastInform, d.status]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `acs-tr069-devices-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('ACS device inventory exported.');
  };

  const columns = useMemo<LegacyColumnDef<AcsDevice, unknown>[]>(
    () => [
      {
        accessorKey: 'serial',
        header: 'CPE Serial / ID',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <Cable className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-foreground">{row.original.serial}</p>
              <p className="text-xs text-muted-foreground font-mono">CWMP Port 7547</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'manufacturer',
        header: 'Manufacturer',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{row.original.manufacturer}</span>
          </div>
        ),
      },
      {
        accessorKey: 'model',
        header: 'Hardware Model',
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs border-border/70">
            {row.original.model}
          </Badge>
        ),
      },
      {
        accessorKey: 'lastInform',
        header: 'Last Inform',
        cell: ({ row }) => (
          <div>
            <span className="font-mono text-xs font-semibold text-foreground">{row.original.lastInform}</span>
            <div className="text-xs text-muted-foreground">Periodic Inform (5m)</div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'CWMP Status',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.status === 'online'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs'
            }
          >
            {row.original.status === 'online' ? (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online (Connected)
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
        cell: ({ row }) => {
          const dev = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => handleRebootCpe(dev)}
                title="Send RPC Reboot"
              >
                <RotateCw className="h-3 w-3 text-amber-500" />
                Reboot
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => toast.success(`TR-069 Parameters synced for ${dev.serial}: SSID, Wi-Fi Key, WAN PPPoE status OK`)}
              >
                Parameters
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading && list.length === 0) return <PageSkeleton variant="table" />;
  if (isError && list.length === 0) {
    return <EmptyState title="Failed to load ACS" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ACS / TR-069 Auto Configuration Server"
        subtitle="Manage customer WiFi routers, remote firmware upgrades, Wi-Fi password sync, and CWMP RPC commands"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Network' }, { label: 'ACS / TR-069' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePushGlobalProvision} disabled={isProvisioning}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isProvisioning ? 'animate-spin' : ''}`} />
              Provision All CPEs
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-1.5" />
              Export Inventory
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Register CPE
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Managed CPEs</span>
            <Cable className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{totalDevices}</div>
            <p className="text-xs text-muted-foreground mt-0.5">TR-069 client routers</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Online Informs</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{onlineDevices} / {totalDevices}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Actively sending informs</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Offline Devices</span>
            <Radio className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">{offlineDevices}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Missed periodic inform</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>GenieACS Engine</span>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Port 7547</div>
            <p className="text-xs text-muted-foreground mt-0.5">CWMP HTTP server ready</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={list}
        searchKey="serial"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search by serial number, manufacturer, model, or status..."
        toolbarActions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Register CPE
          </Button>
        }
      />

      {/* Register CPE Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Register Customer CPE Router</DialogTitle>
            <DialogDescription>
              Pre-configure a customer Wi-Fi router to bind TR-069 ACS URL automatically upon connection.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterDevice} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="serial">Serial Number / OUI-MAC *</Label>
              <Input
                id="serial"
                placeholder="e.g. 2208945A89B1"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Select value={manufacturer} onValueChange={(val) => { if (val) setManufacturer(val); }}>
                  <SelectTrigger id="manufacturer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TP-Link">TP-Link</SelectItem>
                    <SelectItem value="Tenda">Tenda</SelectItem>
                    <SelectItem value="Netis">Netis</SelectItem>
                    <SelectItem value="MikroTik">MikroTik RouterOS</SelectItem>
                    <SelectItem value="Huawei">Huawei Home Gateway</SelectItem>
                    <SelectItem value="ZTE">ZTE ZXHN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="model">Model Name</Label>
                <Input
                  id="model"
                  placeholder="e.g. Archer C6"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Register Device</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useOltDevices } from '../hooks/useOltDevices';
import type { OltDeviceItem } from '@/data/admin/network-ops.data';
import { OltModal } from '../components/OltModal';
import { OltDiagnosticsModal } from '../components/OltDiagnosticsModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Zap,
  RotateCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function OltHealthBar({ online, total }: { online: number; total: number }) {
  const pct = total > 0 ? Math.round((online / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500',
          )}
          style={{ width: `${pct}%`, transitionDelay: '300ms' }}
        />
      </div>
      <span className="text-[11px] font-semibold tabular-nums text-muted-foreground w-8 text-right">
        {pct}%
      </span>
    </div>
  );
}

const oltSearchFilter = (row: LegacyRow<OltDeviceItem>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const o = row.original;
  return (
    o.name.toLowerCase().includes(q) ||
    o.ip.includes(q) ||
    o.brand.toLowerCase().includes(q) ||
    o.area.toLowerCase().includes(q)
  );
};

export function OltPage() {
  const { data: initialOlts = [], isLoading, isError, refetch } = useOltDevices();
  const [olts, setOlts] = useState<OltDeviceItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOlt, setSelectedOlt] = useState<OltDeviceItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [diagnosticsOlt, setDiagnosticsOlt] = useState<OltDeviceItem | null>(null);

  if (olts.length === 0 && initialOlts.length > 0) {
    setOlts(initialOlts);
  }

  const list = olts.length > 0 ? olts : initialOlts;
  const totalOlts = list.length;
  const totalOnus = list.reduce((sum, o) => sum + o.onuTotal, 0);
  const onlineOnus = list.reduce((sum, o) => sum + o.onuOnline, 0);
  const offlineOnus = totalOnus - onlineOnus;
  const healthPct = totalOnus > 0 ? Math.round((onlineOnus / totalOnus) * 100) : 0;

  const handleDelete = () => {
    if (!deleteId) return;
    setOlts((prev) => prev.filter((o) => o.id !== deleteId));
    toast.success('OLT device removed.');
    setDeleteId(null);
  };

  const handleReboot = (olt: OltDeviceItem) => {
    toast.promise(new Promise((res) => setTimeout(res, 800)), {
      loading: `Resetting ${olt.name} connection...`,
      success: `${olt.name} reconnected — optical line refreshed.`,
      error: `Failed to reset ${olt.name}`,
    });
  };

  const handleSaveOlt = (values: {
    name: string;
    brand: OltDeviceItem['brand'];
    ip: string;
    port: number;
    protocol: OltDeviceItem['protocol'];
    username: string;
    loginKey?: string;
    snmpOid?: string;
    area: string;
    ponPortsCount: number;
  }) => {
    if (selectedOlt) {
      setOlts((prev) => prev.map((o) => (o.id === selectedOlt.id ? { ...o, ...values } : o)));
    } else {
      const newOlt: OltDeviceItem = {
        id: `olt_${Date.now()}`,
        name: values.name,
        brand: values.brand,
        ip: values.ip,
        port: values.port,
        protocol: values.protocol,
        username: values.username,
        loginKey: values.loginKey,
        snmpOid: values.snmpOid,
        area: values.area,
        ponPortsCount: values.ponPortsCount,
        onuTotal: 0,
        onuOnline: 0,
        status: 'active',
      };
      setOlts((prev) => [newOlt, ...prev]);
    }
  };

  const columns = useMemo<LegacyColumnDef<OltDeviceItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'OLT Node',
        enableHiding: false,
        cell: ({ row }) => {
          const olt = row.original;
          const onlinePct =
            olt.onuTotal > 0 ? Math.round((olt.onuOnline / olt.onuTotal) * 100) : 0;
          return (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg border text-[11px] font-bold shrink-0',
                  onlinePct >= 90
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : onlinePct >= 70
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                )}
              >
                {onlinePct}%
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-[13px] leading-tight truncate">
                  {olt.name}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{olt.area}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'brand',
        header: 'Vendor',
        cell: ({ row }) => (
          <Badge variant="outline" className="font-medium bg-muted/30 text-[11px] px-2 py-0.5">
            {row.original.brand}
          </Badge>
        ),
      },
      {
        accessorKey: 'ip',
        header: 'Host IP & Port',
        cell: ({ row }) => (
          <div>
            <div className="font-mono text-[12px] font-medium text-foreground">
              {row.original.ip}
              <span className="text-muted-foreground">:{row.original.port}</span>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">
              user: {row.original.username}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'protocol',
        header: 'Protocol',
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className="uppercase font-mono text-[10px] tracking-wider px-2 py-0.5"
          >
            {row.original.protocol}
          </Badge>
        ),
      },
      {
        accessorKey: 'ponPortsCount',
        header: 'PON Ports',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-foreground">
              {row.original.ponPortsCount}
            </span>
            <span className="text-[10px] text-muted-foreground">PON</span>
          </div>
        ),
      },
      {
        id: 'onus',
        accessorKey: 'onuOnline',
        header: 'Connected ONUs',
        cell: ({ row }) => (
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                {row.original.onuOnline}
              </span>
              <span className="text-[11px] text-muted-foreground">/ {row.original.onuTotal}</span>
            </div>
            <OltHealthBar online={row.original.onuOnline} total={row.original.onuTotal} />
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge status={row.original.status === 'active' ? 'active' : 'disabled'} />
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const olt = row.original;
          return (
            <div className="flex items-center justify-end gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-amber-500/10"
                title="Diagnostics"
                onClick={() => setDiagnosticsOlt(olt)}
              >
                <Zap className="h-3.5 w-3.5 text-amber-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-orange-500/10"
                title="Reboot / Refresh Line"
                onClick={() => handleReboot(olt)}
              >
                <RotateCw className="h-3.5 w-3.5 text-orange-500" />
              </Button>
              <div className="w-px h-4 bg-border mx-0.5" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-muted"
                title="Edit OLT"
                onClick={() => {
                  setSelectedOlt(olt);
                  setModalOpen(true);
                }}
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-destructive/10"
                title="Delete OLT"
                onClick={() => setDeleteId(olt.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading && olts.length === 0) {
    return <PageSkeleton variant="table" rows={5} />;
  }

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load OLT nodes"
          description="Could not load GPON/EPON headend inventory."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="OLT Nodes (GPON / EPON)"
        subtitle="Manage fiber terminal headends, optical power telemetry, and connected ONUs"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Network Ops' },
          { label: 'OLT Nodes' },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setSelectedOlt(null);
              setModalOpen(true);
            }}
            className="transition-all duration-200 hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Onboard New OLT
          </Button>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{totalOlts}</span>{' '}
          <span className="text-muted-foreground">OLT nodes</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{totalOnus}</span>{' '}
          <span className="text-muted-foreground">ONUs</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{onlineOnus}</span>{' '}
          <span className="text-muted-foreground">online ({healthPct}%)</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-destructive">{offlineOnus}</span>{' '}
          <span className="text-muted-foreground">offline / LOS</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search OLT name, vendor, IP, or area..."
        searchFilterFn={oltSearchFilter}
        facetFilters={[
          { columnId: 'brand', title: 'Vendor' },
          { columnId: 'status', title: 'Status' },
          { columnId: 'protocol', title: 'Protocol' },
        ]}
        emptyTitle="No OLT nodes found"
        emptyDescription="Onboard a Huawei, ZTE, BDCOM, or V-Sol OLT node to start monitoring optical power."
        toolbarActions={
          <Button
            size="sm"
            onClick={() => {
              setSelectedOlt(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Onboard New OLT
          </Button>
        }
      />

      <OltModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={selectedOlt}
        onSuccess={handleSaveOlt}
      />

      {diagnosticsOlt && (
        <OltDiagnosticsModal
          open={!!diagnosticsOlt}
          onOpenChange={(open) => !open && setDiagnosticsOlt(null)}
          oltId={diagnosticsOlt.id}
          oltName={diagnosticsOlt.name}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove OLT Node?"
        description="Are you sure you want to remove this OLT? PON port telemetry and connected ONU auto-discovery will stop."
        confirmLabel="Delete OLT"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

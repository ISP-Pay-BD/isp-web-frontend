'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useOltDevices } from '../hooks/useOltDevices';
import type { OltDeviceItem } from '@/data/admin/network-ops.data';
import { OltModal } from '../components/OltModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Network, Cpu, CheckCircle2, Radio, Edit, Trash2, Zap, RadioTower } from 'lucide-react';
import { toast } from 'sonner';

export function OltPage() {
  const { data: initialOlts = [], isLoading } = useOltDevices();
  const [olts, setOlts] = useState<OltDeviceItem[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOlt, setSelectedOlt] = useState<OltDeviceItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (olts.length === 0 && initialOlts.length > 0) {
    setOlts(initialOlts);
  }

  const list = olts.length > 0 ? olts : initialOlts;

  const filtered = list.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.ip.includes(search) ||
    o.brand.toLowerCase().includes(search.toLowerCase()) ||
    o.area.toLowerCase().includes(search.toLowerCase())
  );

  const totalOlts = list.length;
  const totalOnus = list.reduce((sum, o) => sum + o.onuTotal, 0);
  const onlineOnus = list.reduce((sum, o) => sum + o.onuOnline, 0);
  const offlineOnus = totalOnus - onlineOnus;

  const handleTestPing = (olt: OltDeviceItem) => {
    toast.promise(
      new Promise((res) => setTimeout(res, 500)),
      {
        loading: `Testing ${olt.brand} OLT connection (${olt.ip})...`,
        success: `Connected to ${olt.name} via ${olt.protocol.toUpperCase()}! Optical health OK.`,
        error: 'Failed to communicate with OLT',
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setOlts((prev) => prev.filter((o) => o.id !== deleteId));
    toast.success('OLT device removed.');
    setDeleteId(null);
  };

  const handleSaveOlt = (values: {
    name: string;
    brand: 'Huawei' | 'ZTE' | 'BDCOM' | 'V_sol' | 'C_data' | 'Ecom';
    ip: string;
    port: number;
    protocol: 'http' | 'https' | 'telnet' | 'snmp';
    username: string;
    snmpOid?: string;
    area: string;
    ponPortsCount: number;
  }) => {
    if (selectedOlt) {
      setOlts((prev) =>
        prev.map((o) => (o.id === selectedOlt.id ? { ...o, ...values } : o))
      );
    } else {
      const newOlt: OltDeviceItem = {
        id: `olt_${Date.now()}`,
        name: values.name,
        brand: values.brand,
        ip: values.ip,
        port: values.port,
        protocol: values.protocol,
        username: values.username,
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

  if (isLoading && olts.length === 0) {
    return <PageSkeleton rows={5} />;
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
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Onboard New OLT
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total OLT Nodes"
          value={totalOlts}
          description="Provisioned in GPON network"
          icon={Network}
        />
        <StatCard
          title="Total Optical ONUs"
          value={totalOnus}
          description="Subscribers connected to PON"
          icon={Cpu}
        />
        <StatCard
          title="Online ONUs"
          value={onlineOnus}
          description={`${Math.round((onlineOnus / (totalOnus || 1)) * 100)}% active optical signal`}
          icon={CheckCircle2}
          trend={{ value: 'Fiber Healthy', positive: true }}
        />
        <StatCard
          title="Offline ONUs / LOS"
          value={offlineOnus}
          description="Loss of signal / power off"
          icon={Radio}
          trend={{ value: `${offlineOnus} alarms`, positive: false }}
        />
      </div>

      {/* Search and Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Input
            placeholder="Search by OLT name, vendor, IP, or POP area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <span className="text-xs text-muted-foreground self-end sm:self-auto">
            Showing {filtered.length} of {totalOlts} nodes
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<RadioTower className="h-10 w-10" />}
            title="No OLT nodes found"
            description="Onboard a Huawei, ZTE, BDCOM, or V-Sol OLT node to start monitoring optical power."
            actionLabel="Onboard OLT"
            onAction={() => {
              setSelectedOlt(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>OLT Node</TableHead>
                    <TableHead>Vendor / Brand</TableHead>
                    <TableHead>Host IP & Port</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>PON Ports</TableHead>
                    <TableHead>Connected ONUs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((olt, index) => (
                    <TableRow key={olt.id}>
                      <TableCell className="text-muted-foreground text-xs font-mono">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">{olt.name}</div>
                        <div className="text-xs text-muted-foreground">{olt.area}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium bg-muted/40">
                          {olt.brand}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs font-medium text-foreground">{olt.ip}:{olt.port}</div>
                        <div className="font-mono text-xs text-muted-foreground">user: {olt.username}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="uppercase font-mono text-[10px] tracking-wide">
                          {olt.protocol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{olt.ponPortsCount} PON</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{olt.onuOnline}</span>
                          <span className="text-xs text-muted-foreground">/ {olt.onuTotal} online</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={olt.status === 'active' ? 'active' : 'disabled'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ping OLT"
                            onClick={() => handleTestPing(olt)}
                          >
                            <Zap className="h-4 w-4 text-amber-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit OLT"
                            onClick={() => {
                              setSelectedOlt(olt);
                              setModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete OLT"
                            onClick={() => setDeleteId(olt.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <OltModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={selectedOlt}
        onSuccess={handleSaveOlt}
      />

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

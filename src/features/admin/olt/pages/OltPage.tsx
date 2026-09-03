'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useOltDevices } from '../hooks/useOltDevices';
import type { OltDeviceItem } from '@/data/admin/network-ops.data';
import { OltModal } from '../components/OltModal';
import { OltDiagnosticsModal } from '../components/OltDiagnosticsModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Network, Cpu, CheckCircle2, Radio, Edit, Trash2, Zap, RadioTower, RotateCw, Search, AlertTriangle } from 'lucide-react';
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
      <span className="text-[11px] font-semibold tabular-nums text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

function OltNodeRow({
  olt,
  index,
  onDiagnostics,
  onReboot,
  onEdit,
  onDelete,
}: {
  olt: OltDeviceItem;
  index: number;
  onDiagnostics: () => void;
  onReboot: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const onlinePct = olt.onuTotal > 0 ? Math.round((olt.onuOnline / olt.onuTotal) * 100) : 0;
  return (
    <TableRow
      className="group/row animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <TableCell className="text-muted-foreground text-xs font-mono w-10">{index + 1}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg border text-[11px] font-black shrink-0 transition-transform duration-200 group-hover/row:scale-110',
            onlinePct >= 90
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : onlinePct >= 70
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
          )}>
            {onlinePct}%
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-foreground text-[13px] leading-tight truncate">{olt.name}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{olt.area}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-medium bg-muted/30 text-[11px] px-2 py-0.5 transition-colors duration-200 group-hover/row:bg-muted/50">
          {olt.brand}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="font-mono text-[12px] font-medium text-foreground">{olt.ip}<span className="text-muted-foreground">:{olt.port}</span></div>
        <div className="font-mono text-[10px] text-muted-foreground">user: {olt.username}</div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="uppercase font-mono text-[10px] tracking-wider px-2 py-0.5">
          {olt.protocol}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-semibold text-foreground">{olt.ponPortsCount}</span>
          <span className="text-[10px] text-muted-foreground">PON</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">{olt.onuOnline}</span>
            <span className="text-[11px] text-muted-foreground">/ {olt.onuTotal}</span>
          </div>
          <OltHealthBar online={olt.onuOnline} total={olt.onuTotal} />
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={olt.status === 'active' ? 'active' : 'disabled'} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-amber-500/10" title="Diagnostics" onClick={onDiagnostics}>
            <Zap className="h-3.5 w-3.5 text-amber-500" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-orange-500/10" title="Reboot / Refresh Line" onClick={onReboot}>
            <RotateCw className="h-3.5 w-3.5 text-orange-500" />
          </Button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted" title="Edit OLT" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10" title="Delete OLT" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function OltMobileCard({
  olt,
  index,
  onDiagnostics,
  onReboot,
  onEdit,
  onDelete,
}: {
  olt: OltDeviceItem;
  index: number;
  onDiagnostics: () => void;
  onReboot: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const onlinePct = olt.onuTotal > 0 ? Math.round((olt.onuOnline / olt.onuTotal) * 100) : 0;
  return (
    <div
      className="rounded-xl border bg-card p-4 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both hover:shadow-md hover:border-border/80 transition-all duration-200"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border text-[10px] font-black shrink-0',
            onlinePct >= 90
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : onlinePct >= 70
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
          )}>
            {onlinePct}%
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground text-sm truncate">{olt.name}</h3>
            <p className="text-[11px] text-muted-foreground">{olt.area}</p>
          </div>
        </div>
        <StatusBadge status={olt.status === 'active' ? 'active' : 'disabled'} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-[10px] font-medium bg-muted/30">{olt.brand}</Badge>
        <Badge variant="secondary" className="uppercase font-mono text-[10px] tracking-wider">{olt.protocol}</Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Host</span>
          <span className="font-mono font-medium">{olt.ip}:{olt.port}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">PON Ports</span>
          <span className="font-medium">{olt.ponPortsCount}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Connected ONUs</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{olt.onuOnline}</span>
            <span className="text-muted-foreground">/ {olt.onuTotal}</span>
          </div>
        </div>
        <OltHealthBar online={olt.onuOnline} total={olt.onuTotal} />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button variant="outline" size="sm" className="w-full h-9 transition-all duration-150 hover:bg-amber-500/10 hover:border-amber-500/30" onClick={onDiagnostics}>
          <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
          Diagnostics
        </Button>
        <Button variant="outline" size="sm" className="w-full h-9 transition-all duration-150 hover:bg-orange-500/10 hover:border-orange-500/30" onClick={onReboot}>
          <RotateCw className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
          Reset Line
        </Button>
        <Button variant="outline" size="sm" className="w-full h-9 transition-all duration-150" onClick={onEdit}>
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Edit
        </Button>
        <Button variant="outline" size="sm" className="w-full h-9 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all duration-150" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

export function OltPage() {
  const { data: initialOlts = [], isLoading } = useOltDevices();
  const [olts, setOlts] = useState<OltDeviceItem[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOlt, setSelectedOlt] = useState<OltDeviceItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [diagnosticsOlt, setDiagnosticsOlt] = useState<OltDeviceItem | null>(null);

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
  const healthPct = totalOnus > 0 ? Math.round((onlineOnus / totalOnus) * 100) : 0;

  const handleDelete = () => {
    if (!deleteId) return;
    setOlts((prev) => prev.filter((o) => o.id !== deleteId));
    toast.success('OLT device removed.');
    setDeleteId(null);
  };

  const handleReboot = (olt: OltDeviceItem) => {
    toast.promise(
      new Promise((res) => setTimeout(res, 800)),
      {
        loading: `Resetting ${olt.name} connection...`,
        success: `${olt.name} reconnected — optical line refreshed.`,
        error: `Failed to reset ${olt.name}`,
      }
    );
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
            className="transition-all duration-200 hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Onboard New OLT
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total OLT Nodes', value: totalOlts, desc: 'Provisioned in GPON network', icon: Network, color: 'primary', gradient: 'from-primary/5' },
          { label: 'Total Optical ONUs', value: totalOnus, desc: 'Subscribers connected to PON', icon: Cpu, color: 'blue-500', gradient: 'from-blue-500/5' },
        ].map((card, i) => (
          <Card
            key={card.label}
            className="relative overflow-hidden border-border/70 bg-card/90 shadow-2xs animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both hover:shadow-md hover:border-border transition-all duration-200"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br via-transparent to-transparent pointer-events-none', card.gradient)} />
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{card.label}</span>
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:scale-110', `bg-${card.color}/10 text-${card.color} border-${card.color}/20`)}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight text-foreground">{card.value}</div>
              <p className="text-muted-foreground mt-1 text-[11px]">{card.desc}</p>
            </CardContent>
          </Card>
        ))}

        <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-2xs animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both hover:shadow-md hover:border-border transition-all duration-200" style={{ animationDelay: '160ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Online ONUs</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">{onlineOnus}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${healthPct}%`, transitionDelay: '400ms' }} />
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{healthPct}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-2xs animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both hover:shadow-md hover:border-border transition-all duration-200" style={{ animationDelay: '240ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Offline ONUs / LOS</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                <Radio className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight text-red-600 dark:text-red-400">{offlineOnus}</div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <AlertTriangle className="h-3 w-3 text-amber-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{offlineOnus} alarms active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <div className="space-y-4 animate-in fade-in duration-500 fill-mode-both" style={{ animationDelay: '300ms' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search OLT name, vendor, IP, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 transition-shadow duration-200 focus:shadow-[0_0_0_2px] focus:shadow-primary/20"
            />
          </div>
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
          <>
            {/* Desktop table */}
            <div className="rounded-xl border bg-card overflow-hidden hidden sm:block animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both" style={{ animationDelay: '350ms' }}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10 text-[11px]">#</TableHead>
                      <TableHead className="text-[11px]">OLT Node</TableHead>
                      <TableHead className="text-[11px]">Vendor</TableHead>
                      <TableHead className="text-[11px]">Host IP &amp; Port</TableHead>
                      <TableHead className="text-[11px]">Protocol</TableHead>
                      <TableHead className="text-[11px]">PON Ports</TableHead>
                      <TableHead className="text-[11px]">Connected ONUs</TableHead>
                      <TableHead className="text-[11px]">Status</TableHead>
                      <TableHead className="text-right text-[11px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((olt, index) => (
                      <OltNodeRow
                        key={olt.id}
                        olt={olt}
                        index={index}
                        onDiagnostics={() => setDiagnosticsOlt(olt)}
                        onReboot={() => handleReboot(olt)}
                        onEdit={() => { setSelectedOlt(olt); setModalOpen(true); }}
                        onDelete={() => setDeleteId(olt.id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile card layout */}
            <div className="sm:hidden space-y-3">
              {filtered.map((olt, index) => (
                <OltMobileCard
                  key={olt.id}
                  olt={olt}
                  index={index}
                  onDiagnostics={() => setDiagnosticsOlt(olt)}
                  onReboot={() => handleReboot(olt)}
                  onEdit={() => { setSelectedOlt(olt); setModalOpen(true); }}
                  onDelete={() => setDeleteId(olt.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

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

'use client';

import { useMemo, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, WifiOff, AlertTriangle, Cpu, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { OnuPortItem } from '@/data/admin/network-ops.data';
import { oltDiagnostics } from '@/data/admin/network-ops.data';

interface OltDiagnosticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oltId: string;
  oltName: string;
}

export function OltDiagnosticsModal({
  open,
  onOpenChange,
  oltId,
  oltName,
}: OltDiagnosticsModalProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'wire_down' | 'offline'>('all');
  const [search, setSearch] = useState('');
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      const id = requestAnimationFrame(() => setContentVisible(false));
      return () => cancelAnimationFrame(id);
    }
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        if (!cancelled) setContentVisible(true);
      }, 60);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [open]);

  const data = useMemo(() => oltDiagnostics[oltId] ?? oltDiagnostics['olt_1'], [oltId]);

  const summary = useMemo(() => {
    const online = data.onus.filter((p: OnuPortItem) => p.status === 'online').length;
    const wireDown = data.onus.filter((p: OnuPortItem) => p.status === 'wire_down').length;
    const offline = data.onus.filter((p: OnuPortItem) => p.status === 'offline').length;
    return { online, wireDown, offline };
  }, [data.onus]);

  const portsByPon = useMemo(() => {
    const groups = new Map<string, OnuPortItem[]>();
    data.onus.forEach((p: OnuPortItem) => {
      const g = groups.get(p.ponPort) ?? [];
      g.push(p);
      groups.set(p.ponPort, g);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data.onus]);

  const filteredOnus = useMemo(() => {
    let list = data.onus;
    if (statusFilter !== 'all') {
      list = list.filter((onu: OnuPortItem) => onu.status === statusFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (onu: OnuPortItem) =>
          (onu.customerName?.toLowerCase().includes(s) ?? false) ||
          onu.macAddress.toLowerCase().includes(s) ||
          onu.pppoeId?.toLowerCase().includes(s) ||
          onu.ponPort.toLowerCase().includes(s)
      );
    }
    return list;
  }, [data.onus, statusFilter, search]);

  const rxColor = (db: number | null) => {
    if (db === null) return 'text-muted-foreground';
    if (db >= -20) return 'text-emerald-600 dark:text-emerald-400';
    if (db >= -25) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl p-0 gap-0 overflow-hidden border-border/80 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="border-b px-6 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 transition-transform duration-200 hover:scale-110">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">{oltName} Diagnostics</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PON telemetry snapshot — {data.onus.length} ONUs registered
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className={cn(
              'space-y-6 transition-all duration-500',
              contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            )}
          >
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'ONUs Online', value: summary.online, icon: Wifi, color: 'emerald', delay: '0ms' },
                { label: 'Wire Down', value: summary.wireDown, icon: AlertTriangle, color: 'amber', delay: '80ms' },
                { label: 'Offline / LOS', value: summary.offline, icon: WifiOff, color: 'red', delay: '160ms' },
              ].map((s) => (
                <Card
                  key={s.label}
                  className="border-border/70 bg-card/90 shadow-2xs animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both hover:shadow-md hover:border-border transition-all duration-200"
                  style={{ animationDelay: s.delay }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</span>
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg border transition-transform duration-200 hover:scale-110',
                        `bg-${s.color}-500/10 text-${s.color}-500 border-${s.color}-500/20`,
                      )}>
                        <s.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className={cn('text-2xl font-black tracking-tight', `text-${s.color}-600 dark:text-${s.color}-400`)}>
                      {s.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* PON Port grid */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">PON Ports ({portsByPon.length})</h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {portsByPon.map(([port, onus], i) => {
                  const online = onus.filter((o: OnuPortItem) => o.status === 'online').length;
                  return (
                    <div
                      key={port}
                      className="rounded-xl border bg-card/80 p-3.5 hover:shadow-md hover:border-border/80 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                      style={{ animationDelay: `${240 + i * 60}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-foreground">{port}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                          {online}/{onus.length}
                        </Badge>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                          style={{ width: onus.length > 0 ? `${(online / onus.length) * 100}%` : '0%', transitionDelay: `${350 + i * 60}ms` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All ONUs', count: data.onus.length },
                { key: 'online', label: 'Online', count: summary.online },
                { key: 'wire_down', label: 'Wire Down', count: summary.wireDown },
                { key: 'offline', label: 'Offline', count: summary.offline },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key as typeof statusFilter)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150',
                    statusFilter === f.key
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-muted-foreground border-border hover:border-foreground/30',
                  )}
                >
                  {f.label}
                  <span className={cn('tabular-nums', statusFilter === f.key ? 'text-background/70' : 'text-muted-foreground')}>{f.count}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search customer, MAC, or PPPoE ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 transition-shadow duration-200 focus:shadow-[0_0_0_2px] focus:shadow-primary/20"
              />
            </div>

            {/* ONU Table */}
            <div className="rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">PON Port</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">MAC Address</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">RX Power</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOnus.map((onu: OnuPortItem, i: number) => (
                      <tr
                        key={onu.id}
                        className="border-b last:border-b-0 hover:bg-muted/20 transition-colors duration-100 animate-in fade-in slide-in-from-bottom-1 duration-250 fill-mode-both"
                        style={{ animationDelay: `${400 + i * 30}ms` }}
                      >
                        <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{onu.onuIndex}</td>
                        <td className="px-4 py-2.5 font-medium text-foreground">{onu.ponPort}</td>
                        <td className="px-4 py-2.5 font-medium text-foreground">
                          {onu.customerName ?? <span className="text-muted-foreground italic">Unassigned</span>}
                          {onu.pppoeId && (
                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{onu.pppoeId}</div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground hidden sm:table-cell">{onu.macAddress}</td>
                        <td className="px-4 py-2.5">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            onu.status === 'online' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            onu.status === 'wire_down' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                            onu.status === 'offline' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                          )}>
                            {onu.status === 'online' ? '● Online' : onu.status === 'wire_down' ? '▲ Wire Down' : '○ Offline'}
                          </span>
                          {onu.deregisterReason && (
                            <div className="text-[9px] text-muted-foreground mt-0.5">{onu.deregisterReason}</div>
                          )}
                        </td>
                        <td className={cn('px-4 py-2.5 font-mono text-xs font-semibold tabular-nums', rxColor(onu.rxPower))}>
                          {onu.rxPower !== null ? `${onu.rxPower.toFixed(1)} dBm` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{onu.vendor}</td>
                      </tr>
                    ))}
                    {filteredOnus.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                          No ONUs match the current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Showing {filteredOnus.length} of {data.onus.length} ONUs
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success('PON port telemetry refreshed.');
                  onOpenChange(false);
                }}
                className="transition-all duration-150 hover:shadow-md"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

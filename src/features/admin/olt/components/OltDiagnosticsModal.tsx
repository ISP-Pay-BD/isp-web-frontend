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
import { Cpu, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { OnuPortItem, OltDiagnostics } from '@/data/admin/network-ops.data';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

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

  const { data: diagnosticsMap, isLoading } = useQuery({
    queryKey: ['admin', 'network', 'olt-diagnostics'],
    queryFn: async () => {
      const network = await mockFetch('admin.domain', 'network');
      return (network as { oltDiagnostics?: Record<string, OltDiagnostics> }).oltDiagnostics ?? {};
    },
    enabled: open,
  });

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

  const data = useMemo(() => {
    if (!diagnosticsMap) return null;
    return diagnosticsMap[oltId] ?? diagnosticsMap['olt_1'] ?? null;
  }, [diagnosticsMap, oltId]);

  const summary = useMemo(() => {
    if (!data) return { online: 0, wireDown: 0, offline: 0 };
    const online = data.onus.filter((p: OnuPortItem) => p.status === 'online').length;
    const wireDown = data.onus.filter((p: OnuPortItem) => p.status === 'wire_down').length;
    const offline = data.onus.filter((p: OnuPortItem) => p.status === 'offline').length;
    return { online, wireDown, offline };
  }, [data]);

  const portsByPon = useMemo(() => {
    if (!data) return [] as [string, OnuPortItem[]][];
    const groups = new Map<string, OnuPortItem[]>();
    data.onus.forEach((p: OnuPortItem) => {
      const g = groups.get(p.ponPort) ?? [];
      g.push(p);
      groups.set(p.ponPort, g);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  const filteredOnus = useMemo(() => {
    if (!data) return [] as OnuPortItem[];
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
  }, [data, statusFilter, search]);

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
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground border border-border/60">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">{oltName} Diagnostics</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PON telemetry snapshot — {data?.onus.length ?? 0} ONUs registered
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading || !data ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading diagnostics…</div>
          ) : (
          <div
            className={cn(
              'space-y-6 transition-opacity duration-200',
              contentVisible ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
              <p>
                <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{summary.online}</span>{' '}
                <span className="text-muted-foreground">online</span>
              </p>
              <p>
                <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{summary.wireDown}</span>{' '}
                <span className="text-muted-foreground">wire down</span>
              </p>
              <p>
                <span className="font-semibold tabular-nums text-destructive">{summary.offline}</span>{' '}
                <span className="text-muted-foreground">offline / LOS</span>
              </p>
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
                      className="rounded-xl border bg-card/80 p-3.5 hover:shadow-md hover:border-border/80 transition-all duration-200"
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
                        className="border-b last:border-b-0 hover:bg-muted/20 transition-colors duration-100"
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

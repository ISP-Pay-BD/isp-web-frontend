'use client';

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { oltDiagnostics, type OnuStatus } from '@/data/admin/network-ops.data';
import { Search, Wifi, WifiOff, AlertTriangle, X, Plug } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OltDiagnosticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oltId: string;
  oltName: string;
}

function formatRx(power: number | null): string {
  if (power === null || power === undefined) return '--';
  return `${power.toFixed(1)} dBm`;
}

function rxQuality(power: number | null): string {
  if (power === null) return 'text-muted-foreground';
  if (power >= -20) return 'text-emerald-500';
  if (power >= -25) return 'text-amber-500';
  return 'text-red-500';
}

function distanceDisplay(d: number): string {
  if (d >= 1000) return `${(d / 1000).toFixed(1)} km`;
  return `${d} m`;
}

function DiagnosticsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-card">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-10" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-2.5">
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-4 w-8 mb-1" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-3 border-b">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-3 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OltDiagnosticsModal({ open, onOpenChange, oltId, oltName }: OltDiagnosticsModalProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | OnuStatus>('all');
  const [search, setSearch] = useState('');
  const [ready, setReady] = useState(false);

  const diag = oltDiagnostics[oltId];

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const filteredOnus = useMemo(() => {
    if (!diag) return [];
    return diag.onus.filter((onu) => {
      const matchesStatus = statusFilter === 'all' || onu.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        onu.onuIndex.toLowerCase().includes(q) ||
        onu.macAddress.toLowerCase().includes(q) ||
        onu.ponPort.toLowerCase().includes(q) ||
        (onu.customerName?.toLowerCase().includes(q) ?? false) ||
        (onu.pppoeId?.toLowerCase().includes(q) ?? false);
      return matchesStatus && matchesSearch;
    });
  }, [diag, statusFilter, search]);

  const portSummary = useMemo(() => {
    if (!diag) return [];
    const map = new Map<string, { total: number; active: number; inactive: number }>();
    for (const onu of diag.onus) {
      const existing = map.get(onu.ponPort) ?? { total: 0, active: 0, inactive: 0 };
      existing.total++;
      if (onu.status === 'online') existing.active++;
      else existing.inactive++;
      map.set(onu.ponPort, existing);
    }
    return Array.from(map.entries());
  }, [diag]);

  const handleMetricClick = (filter: 'all' | OnuStatus, searchHint?: string) => {
    setStatusFilter(filter);
    setSearch(searchHint ?? '');
  };

  if (!diag) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            {oltName}
            <span className="text-muted-foreground font-normal">— Device Diagnostics</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-5 py-4">
          {!ready ? (
            <DiagnosticsSkeleton />
          ) : (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleMetricClick('online')}
                  className={cn(
                    'flex items-center justify-between gap-3 p-3 rounded-xl border bg-card transition-all duration-150 hover:border-emerald-500/50 hover:shadow-sm cursor-pointer text-left',
                    statusFilter === 'online' && 'border-emerald-500/50 bg-emerald-500/5',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <Wifi className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Online ONUs</span>
                  </div>
                  <span className="text-xl font-black text-emerald-500">{diag.onlineCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMetricClick('wire_down')}
                  className={cn(
                    'flex items-center justify-between gap-3 p-3 rounded-xl border bg-card transition-all duration-150 hover:border-amber-500/50 hover:shadow-sm cursor-pointer text-left',
                    statusFilter === 'wire_down' && 'border-amber-500/50 bg-amber-500/5',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Wire Down</span>
                  </div>
                  <span className="text-xl font-black text-amber-500">{diag.wireDownCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMetricClick('offline')}
                  className={cn(
                    'flex items-center justify-between gap-3 p-3 rounded-xl border bg-card transition-all duration-150 hover:border-red-500/50 hover:shadow-sm cursor-pointer text-left',
                    statusFilter === 'offline' && 'border-red-500/50 bg-red-500/5',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                      <WifiOff className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Power Off / Offline</span>
                  </div>
                  <span className="text-xl font-black text-red-500">{diag.powerOffCount}</span>
                </button>
              </div>

              {/* Port Summary Cards */}
              {portSummary.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {portSummary.map(([port, stats]) => (
                    <button
                      key={port}
                      type="button"
                      onClick={() => {
                        setStatusFilter('all');
                        setSearch(port);
                      }}
                      className="rounded-xl border bg-card p-2.5 text-left transition-all duration-150 hover:border-primary/50 hover:shadow-sm cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-border/50">
                        <div className="flex items-center gap-1.5">
                          <Plug className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] font-bold text-foreground">{port}</span>
                        </div>
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 font-mono">
                          {stats.total}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Active</span>
                        <span className="text-xs font-bold text-emerald-500">{stats.active}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-muted-foreground">Inactive</span>
                        <span className="text-xs font-bold text-red-500">{stats.inactive}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* ONU Table */}
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border-b">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">ONU Port Distribution &amp; Signals</h3>
                    {(statusFilter !== 'all' || search) && (
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {filteredOnus.length} shown
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | OnuStatus)}>
                      <SelectTrigger className="w-[100px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="wire_down">Wire Down</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1 sm:w-[200px]">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Search ONU ID, MAC, customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 pl-8 text-xs"
                      />
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch('')}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ONU ID</TableHead>
                        <TableHead>MAC Address</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Customer / User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>RX Power</TableHead>
                        <TableHead>Deregister Reason</TableHead>
                        <TableHead>Last Seen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOnus.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-xs">
                            No ONUs match the current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOnus.map((onu) => (
                          <TableRow key={onu.id}>
                            <TableCell className="font-mono text-xs font-semibold">{onu.onuIndex}</TableCell>
                            <TableCell className="font-mono text-[11px]">{onu.macAddress}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] font-mono bg-muted/40">{onu.vendor}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{distanceDisplay(onu.distance)}</TableCell>
                            <TableCell>
                              {onu.customerName ? (
                                <div>
                                  <div className="text-xs font-semibold">{onu.customerName}</div>
                                  {onu.pppoeId && <div className="text-[10px] text-muted-foreground font-mono">{onu.pppoeId}</div>}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Unbound</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={onu.status} />
                            </TableCell>
                            <TableCell>
                              <span className={cn('font-mono text-xs font-semibold', rxQuality(onu.rxPower))}>
                                {formatRx(onu.rxPower)}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                              {onu.deregisterReason ?? '--'}
                            </TableCell>
                            <TableCell className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                              {onu.lastSeen}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile card fallback */}
                <div className="sm:hidden divide-y">
                  {filteredOnus.map((onu) => (
                    <div key={onu.id} className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold">ONU {onu.onuIndex}</span>
                        <StatusBadge status={onu.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div>
                          <span className="text-muted-foreground">MAC:</span>{' '}
                          <span className="font-mono">{onu.macAddress}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Vendor:</span>{' '}
                          <span className="font-semibold">{onu.vendor}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">RX:</span>{' '}
                          <span className={cn('font-mono font-semibold', rxQuality(onu.rxPower))}>{formatRx(onu.rxPower)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dist:</span>{' '}
                          <span>{distanceDisplay(onu.distance)}</span>
                        </div>
                      </div>
                      {onu.customerName && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Customer:</span>{' '}
                          <span className="font-semibold">{onu.customerName}</span>
                          {onu.pppoeId && <span className="text-muted-foreground ml-1 font-mono">({onu.pppoeId})</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end px-5 py-3 border-t shrink-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

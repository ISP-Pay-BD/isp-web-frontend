'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/EmptyState';
import { AlertTriangle, Cpu, Loader2, RefreshCw, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatDateTime } from '@/lib/format/date';
import { useOltDiagnostics } from '../hooks/useOltDiagnostics';
import { onuHealth, parseBackendDate, rxBand, type OltOnu, type OnuHealth } from '../types';

interface OltDiagnosticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oltId: string;
  oltName: string;
}

/** Rows rendered at once; search narrows the rest (a live read can hold every ONU of the OLT). */
const MAX_ROWS = 200;

const RX_CLASS: Record<ReturnType<typeof rxBand>, string> = {
  good: 'text-emerald-600 dark:text-emerald-400',
  weak: 'text-amber-600 dark:text-amber-400',
  critical: 'text-red-600 dark:text-red-400',
  unknown: 'text-muted-foreground',
};

export function OltDiagnosticsModal({
  open,
  onOpenChange,
  oltId,
  oltName,
}: OltDiagnosticsModalProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | OnuHealth>('all');
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching, isError, error, refetch } = useOltDiagnostics(oltId, open);

  const filteredOnus = useMemo(() => {
    if (!data) return [] as OltOnu[];
    const q = search.trim().toLowerCase();
    return data.items.filter((onu) => {
      if (statusFilter !== 'all' && onuHealth(onu) !== statusFilter) return false;
      if (!q) return true;
      return [onu.customerName, onu.description, onu.mac, onu.pppoeId, onu.ponPort, onu.onuId].some((v) =>
        (v ?? '').toLowerCase().includes(q),
      );
    });
  }, [data, statusFilter, search]);

  const syncedAt = parseBackendDate(data?.lastSyncedAt ?? null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl p-0 gap-0 overflow-hidden border-border/80 shadow-[var(--shadow-md)] max-h-[85vh] flex flex-col">
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
                  {data
                    ? `${data.summary.total} ONUs — ${data.isCached ? 'last synchronized data' : 'read live from the OLT'}`
                    : 'Live ONU status read from the OLT'}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Reading ONU status from the OLT — this can take up to a minute…
            </div>
          ) : isError || !data ? (
            <EmptyState
              title="Diagnostics unavailable"
              description={errorMessage(error, 'The OLT could not be read.')}
              actionLabel="Retry"
              onAction={() => refetch()}
            />
          ) : (
          <div className="space-y-6">
            {data.isCached && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Live read failed{data.liveError ? `: ${data.liveError}` : ''}. Showing the last synchronized data
                  {syncedAt ? ` from ${formatDateTime(syncedAt)}` : ''}.
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
              <p>
                <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{data.summary.online}</span>{' '}
                <span className="text-muted-foreground">online</span>
              </p>
              <p>
                <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{data.summary.wireDown}</span>{' '}
                <span className="text-muted-foreground">wire down / LOS</span>
              </p>
              <p>
                <span className="font-semibold tabular-nums text-destructive">{data.summary.powerOff}</span>{' '}
                <span className="text-muted-foreground">offline / power off</span>
              </p>
            </div>

            {/* PON Port grid */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">PON Ports ({data.ponPorts.length})</h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data.ponPorts.map((port) => (
                  <div
                    key={port.port}
                    className="rounded-xl border bg-card/80 p-3.5 hover:shadow-md hover:border-border/80 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold text-foreground">{port.port}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                        {port.online}/{port.total}
                      </Badge>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                        style={{ width: port.total > 0 ? `${(port.online / port.total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All ONUs', count: data.summary.total },
                { key: 'online', label: 'Online', count: data.summary.online },
                { key: 'wire_down', label: 'Wire Down', count: data.summary.wireDown },
                { key: 'power_off', label: 'Power Off', count: data.summary.powerOff },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
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
                placeholder="Search customer, MAC, PPPoE ID or port..."
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
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground tracking-wide">ONU</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground tracking-wide">PON Port</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground tracking-wide">Customer</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground tracking-wide hidden sm:table-cell">MAC Address</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground tracking-wide">Status</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground tracking-wide">RX Power</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground tracking-wide">Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOnus.slice(0, MAX_ROWS).map((onu) => {
                      const health = onuHealth(onu);
                      return (
                        <tr
                          key={`${onu.onuId}-${onu.mac ?? ''}`}
                          className="border-b last:border-b-0 hover:bg-muted/20 transition-colors duration-100"
                        >
                          <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{onu.onuIndex || '—'}</td>
                          <td className="px-4 py-2.5 font-medium text-foreground">{onu.ponPort || '—'}</td>
                          <td className="px-4 py-2.5 font-medium text-foreground">
                            {onu.customerName ?? onu.description ?? <span className="text-muted-foreground italic">Unassigned</span>}
                            {onu.pppoeId && (
                              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{onu.pppoeId}</div>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground hidden sm:table-cell">{onu.mac ?? '—'}</td>
                          <td className="px-4 py-2.5">
                            <span className={cn(
                              'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wide',
                              health === 'online' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                              health === 'wire_down' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                              health === 'power_off' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                            )}>
                              {health === 'online' ? '● Online' : health === 'wire_down' ? '▲ Wire Down' : '○ Offline'}
                            </span>
                            {onu.reason && (
                              <div className="text-[9px] text-muted-foreground mt-0.5">{onu.reason}</div>
                            )}
                          </td>
                          <td className={cn('px-4 py-2.5 font-mono text-xs font-semibold tabular-nums', RX_CLASS[rxBand(onu.rxPower)])}>
                            {onu.rxPower !== null ? `${onu.rxPower.toFixed(1)} dBm` : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{onu.vendor ?? '—'}</td>
                        </tr>
                      );
                    })}
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
                Showing {Math.min(filteredOnus.length, MAX_ROWS)} of {filteredOnus.length} matching ({data.items.length} total)
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() => refetch()}
                className="gap-1.5 transition-all duration-150 hover:shadow-md"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
                {isFetching ? 'Reading…' : 'Refresh'}
              </Button>
            </div>
          </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

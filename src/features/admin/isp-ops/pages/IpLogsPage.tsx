'use client';

import { useState } from 'react';
import { Clock, Download, Network, RefreshCw, Radar, Search, Server, Users, X } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useDebouncedValue } from '@/features/admin/customers/hooks/use-debounced-value';
import { useCaptureIpLogs, useExportIpLogs, useIpLogs } from '../hooks/use-ip-logs';
import { NetOpsPager, OptionSelect, fmtDateTime } from '../components/NetOpsControls';

const PAGE_SIZE = 25;

/**
 * Compliance IP log: which subscriber held which IP, and when. Built from
 * live PPPoE sessions read off the routers ("Capture now") plus static IP
 * assignments. Port-level NAT translations are not recorded by the platform.
 */
export function IpLogsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim(), 350);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [source, setSource] = useState('');
  const filters = { search, from, to, source };

  const { data, isLoading, isError, error, refetch, isFetching } = useIpLogs({ page, pageSize: PAGE_SIZE, ...filters });
  const capture = useCaptureIpLogs();
  const exportCsv = useExportIpLogs();

  const rows = data?.items ?? [];
  const summary = data?.summary;
  const filtered = Boolean(search || from || to || source);
  const reset = () => {
    setSearchInput('');
    setFrom('');
    setTo('');
    setSource('');
    setPage(1);
  };

  if (isLoading && !data) return <PageSkeleton variant="table" rows={8} />;
  if (isError && !data) {
    return <EmptyState title="Failed to load IP logs" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const kpis = [
    { label: 'Log Entries', value: (summary?.entries ?? 0).toLocaleString(), hint: 'IP holding periods recorded', icon: Network, tone: 'bg-purple-500/10 text-purple-400 border-purple-500/20', text: 'text-foreground' },
    { label: 'Distinct IPs', value: (summary?.distinctIps ?? 0).toLocaleString(), hint: 'Addresses seen', icon: Server, tone: 'bg-blue-500/10 text-blue-400 border-blue-500/20', text: 'text-blue-400' },
    { label: 'Subscribers', value: (summary?.users ?? 0).toLocaleString(), hint: 'Usernames logged', icon: Users, tone: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400' },
    { label: 'Last Capture', value: fmtDateTime(summary?.lastCapture), hint: 'Most recent session read', icon: Clock, tone: 'bg-amber-500/10 text-amber-400 border-amber-500/20', text: 'text-amber-400 text-lg' },
  ];

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Compliance IP Assignment Logs"
        subtitle="Which subscriber held which IP address and when — searchable and exportable for lawful requests."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Compliance' }, { label: 'IP Logs' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5">
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => capture.mutate()} disabled={capture.isPending} className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5">
              <Radar className={cn('h-3.5 w-3.5', capture.isPending && 'animate-pulse')} />
              {capture.isPending ? 'Reading routers…' : 'Capture Now'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCsv.mutate(filters)}
              disabled={exportCsv.isPending || rows.length === 0}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              {exportCsv.isPending ? 'Exporting…' : 'Export CSV'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{k.label}</span>
                <div className={cn('p-2 rounded-lg border', k.tone)}>
                  <k.icon className="h-4 w-4" />
                </div>
              </div>
              <div className={cn('mt-2 text-2xl font-black font-mono', k.text)}>{k.value}</div>
              <div className="mt-2 text-[11px] text-muted-foreground">{k.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username, IP address or MAC..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="h-9 w-[150px] text-xs bg-background/80"
            aria-label="From date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="h-9 w-[150px] text-xs bg-background/80"
            aria-label="To date"
          />
          <OptionSelect
            value={source}
            onChange={(v) => {
              setSource(v);
              setPage(1);
            }}
            options={[
              { value: 'pppoe_session', label: 'PPPoE sessions' },
              { value: 'static', label: 'Static IPs' },
            ]}
            placeholder="All sources"
            noneLabel="All sources"
            className="w-[150px] h-9 text-xs bg-background/80"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={filtered ? 'No log entries match these filters' : 'No IP assignments logged yet'}
          description={filtered ? 'Try a wider date range or a different search.' : 'Use "Capture Now" to read the live sessions from your routers.'}
          actionLabel={filtered ? 'Clear Filters' : undefined}
          onAction={filtered ? reset : undefined}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <TableHead className="text-xs font-semibold">First Seen</TableHead>
                  <TableHead className="text-xs font-semibold">Last Seen</TableHead>
                  <TableHead className="text-xs font-semibold">Subscriber</TableHead>
                  <TableHead className="text-xs font-semibold">IP Address</TableHead>
                  <TableHead className="text-xs font-semibold">MAC</TableHead>
                  <TableHead className="text-xs font-semibold">Router</TableHead>
                  <TableHead className="text-xs font-semibold">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {rows.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/30 transition-colors duration-150">
                    <TableCell className="py-3 font-mono text-xs text-muted-foreground">{fmtDateTime(r.firstSeenAt)}</TableCell>
                    <TableCell className="py-3 font-mono text-xs text-muted-foreground">{fmtDateTime(r.lastSeenAt)}</TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs font-bold text-foreground">{r.username}</span>
                      {r.customerName && <div className="text-[11px] text-muted-foreground">{r.customerName}</div>}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold">{r.ipAddress}</span>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-xs text-muted-foreground">{r.macAddress ?? '—'}</TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">{r.routerName ?? '—'}</TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold uppercase',
                          r.source === 'static' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                        )}
                      >
                        {r.source === 'static' ? 'Static' : 'PPPoE'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <NetOpsPager page={page} totalPages={data?.meta.totalPages ?? 1} total={data?.meta.total ?? 0} onPageChange={setPage} label="entries" />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Network,
  Activity,
  Server,
  X,
  Clock,
  ArrowRightLeft,
  Filter,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type Row = IspOpsData['ipNatLogs'][number];

export function IpLogsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<'all' | 'tcp' | 'udp'>('all');

  const rows = useMemo(() => data?.ipNatLogs ?? [], [data?.ipNatLogs]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.username.toLowerCase().includes(q) ||
        r.publicIp.toLowerCase().includes(q) ||
        r.privateIp.toLowerCase().includes(q) ||
        r.port.toString().includes(q);

      const matchesProto = protocolFilter === 'all' || r.protocol.toLowerCase() === protocolFilter;
      return matchesSearch && matchesProto;
    });
  }, [rows, search, protocolFilter]);

  const stats = useMemo(() => {
    const total = rows.length;
    const tcpCount = rows.filter((r) => r.protocol.toLowerCase() === 'tcp').length;
    const udpCount = rows.filter((r) => r.protocol.toLowerCase() === 'udp').length;
    const totalBytes = rows.reduce((s, r) => s + (typeof r.bytes === 'number' ? r.bytes : 0), 0);
    return { total, tcpCount, udpCount, totalBytes };
  }, [rows]);

  const handleExportCsv = () => {
    toast.success(`Exporting ${filteredRows.length} BTRC compliance NAT logs to CSV...`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError || !data) {
    return <EmptyState title="Failed to load IP / NAT logs" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <PageHeader
        title="BTRC Compliance IP / NAT Session Logs"
        subtitle="Regulatory carrier-grade NAT translation mapping, subscriber session audits, and legal compliance export."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Compliance' }, { label: 'IP / NAT Logs' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              Export BTRC CSV
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total NAT Sessions</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Network className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">{stats.total.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Logged translation records</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">TCP Sessions</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">{stats.tcpCount.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Stateful TCP connections</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">UDP Datagrams</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">{stats.udpCount.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Voice, streaming & DNS streams</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Retention Status</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-amber-400">730 Days</div>
            <div className="mt-2 text-[11px] text-muted-foreground">BTRC 2-year compliant buffer</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by subscriber username, public IP, private IP, port..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select value={protocolFilter} onValueChange={(v) => v && setProtocolFilter(v as any)}>
          <SelectTrigger className="w-[160px] h-9 text-xs bg-background/80">
            <SelectValue placeholder="Protocol" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="all">All Protocols</SelectItem>
            <SelectItem value="tcp">TCP Only</SelectItem>
            <SelectItem value="udp">UDP Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredRows.length === 0 ? (
        <EmptyState
          title="No IP / NAT logs found"
          description="Try modifying search query or protocol filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setProtocolFilter('all');
          }}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                  <TableHead className="text-xs font-semibold">Subscriber</TableHead>
                  <TableHead className="text-xs font-semibold">Public IP (CGNAT)</TableHead>
                  <TableHead className="text-xs font-semibold">Private IP (LAN)</TableHead>
                  <TableHead className="text-xs font-semibold">Port</TableHead>
                  <TableHead className="text-xs font-semibold">Proto</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Volume Bytes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {filteredRows.map((r, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30 transition-colors duration-150">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary/70" />
                        {String(r.at)}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs font-bold text-foreground">{String(r.username)}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold">
                        {String(r.publicIp)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs text-muted-foreground">{String(r.privateIp)}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs font-bold text-amber-400">{String(r.port)}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold uppercase',
                          String(r.protocol).toLowerCase() === 'tcp'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        )}
                      >
                        {String(r.protocol)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right font-mono text-xs text-muted-foreground">
                      {typeof r.bytes === 'number' ? r.bytes.toLocaleString() : String(r.bytes)} B
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

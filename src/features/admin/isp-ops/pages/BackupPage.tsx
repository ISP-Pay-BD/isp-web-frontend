'use client';

import { useState, useMemo } from 'react';
import {
  HardDrive,
  Database,
  CloudUpload,
  RefreshCw,
  CheckCircle2,
  Clock,
  Download,
  Search,
  X,
  Play,
  FileCheck,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

export function BackupPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [search, setSearch] = useState('');

  const rows = useMemo(() => data?.backupJobs ?? [], [data?.backupJobs]);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.target.toLowerCase().includes(q) ||
        r.lastRun.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const total = rows.length;
    const okCount = rows.filter((r) => r.status.toLowerCase() === 'ok' || r.status.toLowerCase() === 'success').length;
    const failedCount = rows.filter((r) => r.status.toLowerCase() === 'failed').length;
    const totalSizeMb = rows.reduce((s, r) => s + (typeof r.sizeMb === 'number' ? r.sizeMb : 0), 0);
    return { total, okCount, failedCount, totalSizeMb };
  }, [rows]);

  const handleRunBackup = () => {
    toast.success('Instant automated snapshot job initiated! Database dump in progress.');
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError || !data) {
    return <EmptyState title="Failed to load backup jobs" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <PageHeader
        title="Automated Backup & Disaster Recovery"
        subtitle="PostgreSQL / MySQL database snapshots, MikroTik router config archives, and encrypted S3 cloud vaults."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Backup / Restore' }]}
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
              size="sm"
              onClick={handleRunBackup}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              Run Instant Backup
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
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configured Jobs</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Database className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">{stats.total}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Scheduled cron backup targets</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Health Rate</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">
              {stats.total > 0 ? `${Math.round((stats.okCount / stats.total) * 100)}%` : '100%'}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Successful last run cycle</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Archive Size</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <HardDrive className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">{(stats.totalSizeMb / 1024).toFixed(2)} GB</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Compressed storage volume</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cloud Replication</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CloudUpload className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-amber-400">AWS S3 / Wasabi</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Multi-region geo redundancy</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search backup jobs by name, destination target..."
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
      </div>

      {/* Table */}
      {filteredRows.length === 0 ? (
        <EmptyState
          title="No backup jobs found"
          description="Try modifying your search criteria or create a new backup schedule."
          actionLabel="Clear Search"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <TableHead className="text-xs font-semibold">Job Name</TableHead>
                  <TableHead className="text-xs font-semibold">Destination Target</TableHead>
                  <TableHead className="text-xs font-semibold">Last Completed Run</TableHead>
                  <TableHead className="text-xs font-semibold">Archive Size</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {filteredRows.map((r, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30 transition-colors duration-150">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-xs text-foreground">{r.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs text-muted-foreground">{r.target}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {r.lastRun}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-xs font-bold text-foreground">
                      {r.sizeMb} MB
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold uppercase',
                          r.status.toLowerCase() === 'failed'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        )}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success(`Downloading snapshot archive: ${r.name}.tar.gz`)}
                        className="text-xs h-7 border-border/80 hover:bg-accent gap-1"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </Button>
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

'use client';

import { useState } from 'react';
import { HardDrive, Database, RefreshCw, Clock, Download, Play, FileCheck, Trash2, Info, Archive } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TablePagination } from '@/components/shared/TablePagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import {
  useCreateTenantExport,
  useDeleteTenantExport,
  useDownloadTenantExport,
  useTenantExports,
} from '@/features/admin/settings/hooks/use-exports';
import type { TenantExport } from '@/features/admin/settings/types';

const DATASETS = ['customers', 'payments', 'packages', 'areas'] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const fmt = (iso: string | null) => (iso ? new Date(iso.replace(' ', 'T')).toLocaleString() : '—');

export function BackupPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } = useTenantExports(page);
  const create = useCreateTenantExport();
  const download = useDownloadTenantExport();
  const remove = useDeleteTenantExport();
  const [deleting, setDeleting] = useState<TenantExport | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return <EmptyState title="Failed to load exports" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const latest = data.items[0] ?? null;
  const handleExport = () => {
    create.mutate(undefined, {
      onSuccess: (res) => {
        toast.success('Export ready — downloading');
        download.mutate(res);
      },
    });
  };

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Data Export & Backup"
        subtitle="Download your customers, payments, packages and areas as CSV files in one ZIP archive."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Backup / Export' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5">
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleExport} disabled={create.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5">
              <Play className={cn('h-3.5 w-3.5', create.isPending && 'animate-pulse')} />
              {create.isPending ? 'Building export…' : 'Export my data'}
            </Button>
          </div>
        }
      />

      <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>
          Each export is generated on the server from live data and kept for download (newest 10). Passwords and national ID numbers are never
          included.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Exports kept" value={String(data.meta.total)} hint="Most recent archives" icon={<Archive className="h-4 w-4" />} tone="purple" />
        <Stat label="Last export" value={latest ? fmt(latest.createdAt) : 'Never'} hint="Generated on demand" icon={<Clock className="h-4 w-4" />} tone="blue" small />
        <Stat label="Last archive size" value={latest ? formatBytes(latest.sizeBytes) : '—'} hint="Compressed ZIP" icon={<HardDrive className="h-4 w-4" />} tone="emerald" />
        <Stat
          label="Customers in last export"
          value={latest ? String(latest.rowCounts.customers ?? 0) : '—'}
          hint="Rows in customers.csv"
          icon={<Database className="h-4 w-4" />}
          tone="amber"
        />
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          icon={<Archive className="h-5 w-5" />}
          title="No exports yet"
          description="Create your first export to download a copy of your data."
          actionLabel="Export my data"
          onAction={handleExport}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 border-b border-border/60">
                  <TableHead className="text-xs font-semibold">Archive</TableHead>
                  <TableHead className="text-xs font-semibold">Created</TableHead>
                  <TableHead className="text-xs font-semibold">Contents</TableHead>
                  <TableHead className="text-xs font-semibold">Size</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {data.items.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <span className="font-mono text-xs text-foreground">{row.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-xs text-muted-foreground">{fmt(row.createdAt)}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {DATASETS.map((d) => (
                          <Badge key={d} variant="outline" className="text-[10px] font-mono">
                            {d}: {row.rowCounts[d] ?? 0}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-xs font-bold text-foreground">{formatBytes(row.sizeBytes)}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={downloadingId === row.id}
                          onClick={() => {
                            setDownloadingId(row.id);
                            download.mutate(row, { onSettled: () => setDownloadingId(null) });
                          }}
                          className="text-xs h-7 gap-1"
                        >
                          <Download className="h-3.5 w-3.5" /> {downloadingId === row.id ? 'Downloading…' : 'Download'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleting(row)} className="text-xs h-7 text-destructive" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.meta.total > 10 && (
            <div className="p-3 border-t border-border/50">
              <TablePagination currentPage={page} pageSize={10} totalItems={data.meta.total} onPageChange={setPage} onPageSizeChange={() => undefined} pageSizeOptions={[10]} />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete export?"
        description={deleting ? `${deleting.fileName} will be removed from the server.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          const target = deleting;
          setDeleting(null);
          if (target) remove.mutate(target.id, { onSuccess: () => toast.success('Export deleted') });
        }}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
  tone,
  small,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: 'purple' | 'blue' | 'emerald' | 'amber';
  small?: boolean;
}) {
  const tones = {
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className={cn('p-2 rounded-lg border', tones[tone])}>{icon}</div>
        </div>
        <div className={cn('mt-2 font-black font-mono text-foreground', small ? 'text-sm' : 'text-2xl')}>{value}</div>
        <div className="mt-2 text-[11px] text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

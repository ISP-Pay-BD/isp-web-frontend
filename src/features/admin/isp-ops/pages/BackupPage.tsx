'use client';

import { useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { HardDrive, Database, RefreshCw, Clock, Download, Play, FileCheck, Trash2, Info, Archive } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

import { formatDateTime } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';
const DATASETS = ['customers', 'payments', 'packages', 'areas'] as const;

type Translate = ReturnType<typeof useLocale>['t'];

function datasetLabel(t: Translate, d: (typeof DATASETS)[number]): string {
  switch (d) {
    case 'customers':
      return t('admin.ops.backup.dsCustomers', 'customers');
    case 'payments':
      return t('admin.ops.backup.dsPayments', 'payments');
    case 'packages':
      return t('admin.ops.backup.dsPackages', 'packages');
    case 'areas':
      return t('admin.ops.backup.dsAreas', 'areas');
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const fmt = (iso: string | null) => (iso ? formatDateTime(iso.replace(' ', 'T')) : '—');

export function BackupPage() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } = useTenantExports(page);
  const create = useCreateTenantExport();
  const download = useDownloadTenantExport();
  const remove = useDeleteTenantExport();
  const [deleting, setDeleting] = useState<TenantExport | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const columns: LegacyColumnDef<TenantExport, unknown>[] = [
    {
      id: 'archive',
      header: t('admin.ops.backup.colArchive', 'Archive'),
      enableSorting: false,
      meta: { mobile: 'title' },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileCheck className="h-4 w-4 shrink-0 text-primary" />
          <span className="break-all font-mono text-xs text-foreground">{row.original.fileName}</span>
        </div>
      ),
    },
    {
      id: 'created',
      header: t('admin.ops.backup.colCreated', 'Created'),
      enableSorting: false,
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{fmt(row.original.createdAt)}</span>,
    },
    {
      id: 'contents',
      header: t('admin.ops.backup.colContents', 'Contents'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {DATASETS.map((d) => (
            <Badge key={d} variant="outline" className="text-xs font-mono">
              {datasetLabel(t, d)}: {row.original.rowCounts[d] ?? 0}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: 'size',
      header: t('admin.ops.backup.colSize', 'Size'),
      enableSorting: false,
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-foreground">{formatBytes(row.original.sizeBytes)}</span>,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('common.actions', 'Actions')}</div>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            disabled={downloadingId === row.original.id}
            onClick={() => {
              setDownloadingId(row.original.id);
              download.mutate(row.original, { onSettled: () => setDownloadingId(null) });
            }}
            className="text-xs h-7 gap-1"
          >
            <Download className="h-3.5 w-3.5" /> {downloadingId === row.original.id ? t('admin.ops.backup.downloading', 'Downloading…') : t('admin.ops.backup.download', 'Download')}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setDeleting(row.original)} className="h-7 w-7 text-destructive" title={t('common.delete', 'Delete')} aria-label={t('admin.ops.backup.deleteExport', 'Delete export')}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return <EmptyState variant="error" title={t('admin.ops.backup.loadFailed', 'Failed to load exports')} description={errorMessage(error)} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />;
  }

  const latest = data.items[0] ?? null;
  const handleExport = () => {
    create.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(t('admin.ops.backup.ready', 'Export ready — downloading'));
        download.mutate(res);
      },
    });
  };

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.ops.backup.title', 'Data Export & Backup')}
        subtitle={t('admin.ops.backup.subtitle', 'Download your customers, payments, packages and areas as CSV files in one ZIP archive.')}
        breadcrumb={[{ label: t('nav.dashboard', 'Dashboard'), url: '/admin/dashboard' }, { label: t('admin.ops.backup.breadcrumb', 'Backup / Export') }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5">
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              {t('admin.ops.backup.refresh', 'Refresh')}
            </Button>
            <Button size="sm" onClick={handleExport} disabled={create.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5">
              <Play className={cn('h-3.5 w-3.5', create.isPending && 'animate-pulse')} />
              {create.isPending ? t('admin.ops.backup.building', 'Building export…') : t('admin.ops.backup.exportMine', 'Export my data')}
            </Button>
          </div>
        }
      />

      <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>
          {t('admin.ops.backup.note', 'Each export is generated on the server from live data and kept for download (newest 10). Passwords and national ID numbers are never included.')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t('admin.ops.backup.statKept', 'Exports kept')} value={String(data.meta.total)} hint={t('admin.ops.backup.statKeptHint', 'Most recent archives')} icon={<Archive className="h-4 w-4" />} tone="purple" />
        <Stat label={t('admin.ops.backup.statLast', 'Last export')} value={latest ? fmt(latest.createdAt) : t('admin.ops.backup.never', 'Never')} hint={t('admin.ops.backup.statLastHint', 'Generated on demand')} icon={<Clock className="h-4 w-4" />} tone="blue" small />
        <Stat label={t('admin.ops.backup.statSize', 'Last archive size')} value={latest ? formatBytes(latest.sizeBytes) : '—'} hint={t('admin.ops.backup.statSizeHint', 'Compressed ZIP')} icon={<HardDrive className="h-4 w-4" />} tone="emerald" />
        <Stat
          label={t('admin.ops.backup.statCustomers', 'Customers in last export')}
          value={latest ? String(latest.rowCounts.customers ?? 0) : '—'}
          hint={t('admin.ops.backup.statCustomersHint', 'Rows in customers.csv')}
          icon={<Database className="h-4 w-4" />}
          tone="amber"
        />
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          icon={<Archive className="h-5 w-5" />}
          title={t('admin.ops.backup.emptyTitle', 'No exports yet')}
          description={t('admin.ops.backup.emptyHint', 'Create your first export to download a copy of your data.')}
          actionLabel={t('admin.ops.backup.exportMine', 'Export my data')}
          onAction={handleExport}
        />
      ) : (
        <DataTable
          urlState
          columns={columns}
          data={data.items}
          getRowId={(row) => row.id}
          enableColumnVisibility={false}
          enableLayoutToggle={false}
          pageSizeOptions={[10]}
          server={{
            page,
            pageSize: 10,
            total: data.meta.total,
            onPageChange: setPage,
            onPageSizeChange: () => undefined,
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('admin.ops.backup.deleteTitle', 'Delete export?')}
        description={deleting ? t('admin.ops.backup.deleteDesc', '{name} will be removed from the server.', { name: deleting.fileName }) : undefined}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          const target = deleting;
          setDeleting(null);
          if (target) remove.mutate(target.id, { onSuccess: () => toast.success(t('admin.ops.backup.deleted', 'Export deleted')) });
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
        <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

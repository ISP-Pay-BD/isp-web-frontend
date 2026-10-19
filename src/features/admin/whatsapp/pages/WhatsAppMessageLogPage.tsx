'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { History, Eye, RefreshCw, ArrowDownLeft, ArrowUpRight, CheckCheck, AlertCircle, Clock, FileCode, Download } from 'lucide-react';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatDateTime } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { waStatusLabel } from '../components/wa-labels';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsAppLogs } from '../hooks/use-whatsapp';
import type { WaLogRow } from '../types';

export function WhatsAppMessageLogPage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState('all');
  const [status, setStatus] = useState('all');
  const logs = useWhatsAppLogs({ page, pageSize, search, direction, status });
  const [selectedLog, setSelectedLog] = useState<WaLogRow | null>(null);

  const handleExportCsv = () => {
    const rows = logs.data?.items ?? [];
    const header = ['ID', 'Phone', 'Direction', 'Category', 'Template', 'Status', 'Error', 'Timestamp'];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [header, ...rows.map((r) => [r.id, r.phone, r.direction, r.category, r.templateName, r.status, r.errorCode, r.sentAt])]
      .map((line) => line.map(escape).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp_log_page_${page}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo<LegacyColumnDef<WaLogRow, unknown>[]>(
    () => [
      {
        accessorKey: 'phone',
        header: t('admin.whatsapp.log.colPhone', 'Phone / Recipient'),
        size: 160,
        enableHiding: false,
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-foreground">{row.original.phone}</span>,
      },
      {
        accessorKey: 'direction',
        header: t('admin.whatsapp.log.colDirection', 'Direction'),
        size: 120,
        cell: ({ row }) => {
          const dir = row.original.direction;
          return (
            <Badge
              variant="outline"
              tone={dir === 'inbound' ? 'success' : 'info'} className="text-xs font-mono gap-1 capitalize"
            >
              {dir === 'inbound' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
              {dir === 'inbound' ? t('admin.whatsapp.log.inbound', 'Inbound') : t('admin.whatsapp.log.outbound', 'Outbound')}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'category',
        header: t('admin.whatsapp.log.colCategory', 'Category'),
        size: 120,
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-xs font-mono">
            {row.original.category || '—'}
          </Badge>
        ),
      },
      {
        id: 'templateName',
        accessorFn: (row) => row.templateName || '—',
        header: t('admin.whatsapp.log.colTemplate', 'Template Used'),
        size: 180,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.templateName || t('admin.whatsapp.log.directText', 'Direct text')}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.whatsapp.log.colStatus', 'DLR Status'),
        size: 110,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={s === 'failed' ? 'destructive' : s === 'read' ? 'default' : 'secondary'}
              tone={s === 'read' ? 'success' : undefined} className="text-xs font-mono capitalize gap-1"
            >
              {s === 'read' || s === 'delivered' ? <CheckCheck className="h-3 w-3" /> : s === 'failed' ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {waStatusLabel(t, s)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'sentAt',
        header: t('admin.whatsapp.log.colTime', 'Timestamp'),
        size: 160,
        cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.sentAt ? formatDateTime(row.original.sentAt) : '—'}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        size: 90,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary hover:bg-primary/10" onClick={() => setSelectedLog(row.original)}>
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('admin.whatsapp.log.inspect', 'Inspect')}</span>
          </Button>
        ),
      },
    ],
    [t],
  );

  if (logs.isLoading) return <PageSkeleton variant="table" />;
  if (logs.isError && !logs.data) {
    return (
      <EmptyState variant="error"
        title={t('admin.whatsapp.log.loadFailed', 'Failed to load message log')}
        description={errorMessage(logs.error, t('admin.whatsapp.log.loadFailedHint', 'Could not fetch the WhatsApp delivery log.'))}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => logs.refetch()}
      />
    );
  }

  const stats = logs.data?.stats;
  const directionOptions: Record<string, string> = {
    all: t('admin.whatsapp.log.allDirections', 'All directions'),
    out: t('admin.whatsapp.log.outbound', 'Outbound'),
    in: t('admin.whatsapp.log.inbound', 'Inbound'),
  };
  const statusOptions: Record<string, string> = {
    all: t('admin.whatsapp.log.allStatuses', 'All statuses'),
    sent: waStatusLabel(t, 'sent'),
    delivered: waStatusLabel(t, 'delivered'),
    read: waStatusLabel(t, 'read'),
    failed: waStatusLabel(t, 'failed'),
    queued: waStatusLabel(t, 'queued'),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.whatsapp.log.title', 'WhatsApp Message Log')}
        subtitle={t('admin.whatsapp.log.subtitle', 'Delivery audit trail for inbound and outbound WhatsApp Business communications')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: t('nav.wa-log', 'Message Log') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={logs.isFetching} onClick={() => logs.refetch()}>
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              {t('admin.whatsapp.log.refresh', 'Refresh')}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={(logs.data?.items ?? []).length === 0} onClick={handleExportCsv}>
              <Download className="h-3.5 w-3.5" />
              {t('admin.whatsapp.log.exportPage', 'Export Page')}
            </Button>
          </div>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: t('admin.whatsapp.log.kpiTotal', 'Total Logged Events'), value: stats?.total ?? 0 },
          { label: t('admin.whatsapp.log.kpiOutbound', 'Outbound Dispatches'), value: stats?.outbound ?? 0 },
          { label: t('admin.whatsapp.log.kpiInbound', 'Inbound Messages'), value: stats?.inbound ?? 0 },
          { label: t('status.failed', 'Failed'), value: stats?.failed ?? 0 },
          { label: t('admin.whatsapp.log.kpiSuccess', 'Send Success Rate'), value: stats?.successRate === null || stats?.successRate === undefined ? '—' : `${stats.successRate}%` },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                {t('admin.whatsapp.log.cardTitle', 'Transmission Audit Log')}
              </CardTitle>
              <CardDescription>{t('admin.whatsapp.log.cardDesc', 'Every WhatsApp message with its Meta WAMID and delivery status')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={direction} onValueChange={(v) => { if (v) { setDirection(v); setPage(1); } }} items={directionOptions}>
                <SelectTrigger aria-label={t('admin.whatsapp.log.filterDirection', 'Filter by direction')} className="h-9 w-[150px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(directionOptions).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }} items={statusOptions}>
                <SelectTrigger aria-label={t('admin.whatsapp.log.filterStatus', 'Filter by status')} className="h-9 w-[150px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusOptions).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable urlState
            columns={columns}
            data={logs.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="phone"
            searchPlaceholder={t('admin.whatsapp.log.searchPlaceholder', 'Search by phone or template...')}
            emptyTitle={t('admin.whatsapp.log.emptyTitle', 'No message logs')}
            emptyDescription={t('admin.whatsapp.log.emptyDesc', 'Outbound and inbound WhatsApp messages will appear here.')}
            server={{
              page,
              pageSize,
              total: logs.data?.meta.total ?? 0,
              onPageChange: setPage,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPage(1);
              },
              search,
              onSearchChange: (q) => {
                setSearch(q);
                setPage(1);
              },
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              {t('admin.whatsapp.log.dialogTitle', 'Message Delivery Record')}
            </DialogTitle>
            <DialogDescription>{t('admin.whatsapp.log.dialogDesc', 'Stored log entry for this message')}</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg border border-border/40">
                <div>
                  <span className="text-muted-foreground block">{t('admin.whatsapp.log.fieldId', 'Log Event ID:')}</span>
                  <span className="font-mono font-semibold">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t('admin.whatsapp.log.fieldCategory', 'Category:')}</span>
                  <span className="font-mono font-semibold">{selectedLog.category || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t('admin.whatsapp.log.fieldPhone', 'Phone:')}</span>
                  <span className="font-mono font-semibold">{selectedLog.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t('admin.whatsapp.log.fieldStatus', 'Delivery Status:')}</span>
                  <Badge variant="secondary" className="font-mono text-xs mt-0.5">
                    {waStatusLabel(t, selectedLog.status).toUpperCase()}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block">WAMID:</span>
                  <span className="font-mono font-semibold break-all">{selectedLog.wamid || '—'}</span>
                </div>
                {selectedLog.errorCode && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">{t('admin.whatsapp.log.fieldError', 'Error:')}</span>
                    <span className="font-mono text-destructive break-all">{selectedLog.errorCode}</span>
                  </div>
                )}
              </div>
              {selectedLog.payload && (
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">{t('admin.whatsapp.log.fieldPayload', 'Message (redacted):')}</span>
                  <pre className="p-3 rounded-lg bg-background border border-border/60 font-mono text-xs whitespace-pre-wrap text-foreground/90">
                    {selectedLog.payload}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedLog(null)}>{t('common.close', 'Close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

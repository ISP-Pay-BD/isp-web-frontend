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
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsAppLogs } from '../hooks/use-whatsapp';
import type { WaLogRow } from '../types';

export function WhatsAppMessageLogPage() {
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
        header: 'Phone / Recipient',
        size: 160,
        enableHiding: false,
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-foreground">{row.original.phone}</span>,
      },
      {
        accessorKey: 'direction',
        header: 'Direction',
        size: 120,
        cell: ({ row }) => {
          const dir = row.original.direction;
          return (
            <Badge
              variant="outline"
              className={`text-[10px] font-mono gap-1 capitalize ${
                dir === 'inbound' ? 'border-emerald-300 text-emerald-500 bg-emerald-50/10' : 'border-blue-300 text-blue-500 bg-blue-50/10'
              }`}
            >
              {dir === 'inbound' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
              {dir}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 120,
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-[10px] font-mono">
            {row.original.category || '—'}
          </Badge>
        ),
      },
      {
        id: 'templateName',
        accessorFn: (row) => row.templateName || '—',
        header: 'Template Used',
        size: 180,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.templateName || 'Direct text'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'DLR Status',
        size: 110,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={s === 'failed' ? 'destructive' : s === 'read' ? 'default' : 'secondary'}
              className={`text-[10px] font-mono capitalize gap-1 ${s === 'read' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}`}
            >
              {s === 'read' || s === 'delivered' ? <CheckCheck className="h-3 w-3" /> : s === 'failed' ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'sentAt',
        header: 'Timestamp',
        size: 160,
        cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.sentAt ? formatDateTime(row.original.sentAt) : '—'}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 90,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary hover:bg-primary/10" onClick={() => setSelectedLog(row.original)}>
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Inspect</span>
          </Button>
        ),
      },
    ],
    [],
  );

  if (logs.isLoading) return <PageSkeleton variant="table" />;
  if (logs.isError && !logs.data) {
    return (
      <EmptyState
        title="Failed to load message log"
        description={errorMessage(logs.error, 'Could not fetch the WhatsApp delivery log.')}
        actionLabel="Retry"
        onAction={() => logs.refetch()}
      />
    );
  }

  const stats = logs.data?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Message Log"
        subtitle="Delivery audit trail for inbound and outbound WhatsApp Business communications"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Message Log' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={logs.isFetching} onClick={() => logs.refetch()}>
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={(logs.data?.items ?? []).length === 0} onClick={handleExportCsv}>
              <Download className="h-3.5 w-3.5" />
              Export Page
            </Button>
          </div>
        }
      />

      <WhatsAppNavLinks />

      <OpsSummaryStrip
        items={[
          { label: 'Total Logged Events', value: stats?.total ?? 0 },
          { label: 'Outbound Dispatches', value: stats?.outbound ?? 0 },
          { label: 'Inbound Messages', value: stats?.inbound ?? 0 },
          { label: 'Failed', value: stats?.failed ?? 0 },
          { label: 'Send Success Rate', value: stats?.successRate === null || stats?.successRate === undefined ? '—' : `${stats.successRate}%` },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Transmission Audit Log
              </CardTitle>
              <CardDescription>Every WhatsApp message with its Meta WAMID and delivery status</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={direction} onValueChange={(v) => { if (v) { setDirection(v); setPage(1); } }}>
                <SelectTrigger className="h-9 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All directions</SelectItem>
                  <SelectItem value="out">Outbound</SelectItem>
                  <SelectItem value="in">Inbound</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }}>
                <SelectTrigger className="h-9 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={logs.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="phone"
            searchPlaceholder="Search by phone or template..."
            emptyTitle="No message logs"
            emptyDescription="Outbound and inbound WhatsApp messages will appear here."
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
              Message Delivery Record
            </DialogTitle>
            <DialogDescription>Stored log entry for this message</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg border border-border/40">
                <div>
                  <span className="text-muted-foreground block">Log Event ID:</span>
                  <span className="font-mono font-semibold">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Category:</span>
                  <span className="font-mono font-semibold">{selectedLog.category || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Phone:</span>
                  <span className="font-mono font-semibold">{selectedLog.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Delivery Status:</span>
                  <Badge variant="secondary" className="font-mono text-[10px] mt-0.5">
                    {selectedLog.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block">WAMID:</span>
                  <span className="font-mono font-semibold break-all">{selectedLog.wamid || '—'}</span>
                </div>
                {selectedLog.errorCode && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">Error:</span>
                    <span className="font-mono text-destructive break-all">{selectedLog.errorCode}</span>
                  </div>
                )}
              </div>
              {selectedLog.payload && (
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Message (redacted):</span>
                  <pre className="p-3 rounded-lg bg-background border border-border/60 font-mono text-[11px] whitespace-pre-wrap text-foreground/90">
                    {selectedLog.payload}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedLog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

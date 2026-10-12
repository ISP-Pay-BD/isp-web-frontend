'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { FileText, Users, Download, RotateCw, Filter, Clock, ListTree, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuditLogs, type AuditLogEntry } from '../hooks/use-audit-logs';

const fmt = (iso: string) => (iso ? new Date(iso.replace(' ', 'T')).toLocaleString() : '—');

export function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { data, isLoading, isError, error, refetch, isFetching } = useAuditLogs({ page, pageSize, search, action, from, to });

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const pageActors = useMemo(() => new Set(rows.map((l) => l.actorId || l.actor)).size, [rows]);

  const exportCsv = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Entity', 'IP', 'Detail'];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = rows.map((l) => [l.at, l.actor, l.action, l.entity, l.ip, l.detail].map(esc).join(','));
    const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_page${page}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo<LegacyColumnDef<AuditLogEntry, unknown>[]>(
    () => [
      {
        accessorKey: 'at',
        header: 'Timestamp',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="h-3 w-3 text-muted-foreground/70" />
            {fmt(row.original.at)}
          </div>
        ),
      },
      {
        accessorKey: 'actor',
        header: 'Actor',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-medium text-sm text-foreground">
            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold">
              {row.original.actor.charAt(0).toUpperCase()}
            </div>
            <span>{row.original.actor}</span>
          </div>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-muted/60 border border-border/60 text-foreground font-semibold">
            {row.original.action}
          </span>
        ),
      },
      {
        accessorKey: 'entity',
        header: 'Entity',
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.entity || '—'}</span>,
      },
      {
        accessorKey: 'ip',
        header: 'IP',
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.ip || '—'}</span>,
      },
      {
        accessorKey: 'detail',
        header: 'Detail',
        cell: ({ row }) => <div className="text-xs text-foreground/90 max-w-md line-clamp-2 break-all">{row.original.detail || '—'}</div>,
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load audit logs" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Recorded actions by you, your staff and your customers"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Audit Logs' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border/70 hover:border-border hover:bg-card/80 text-xs">
              <RotateCw className={cn('mr-1.5 h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0} className="border-border/70 hover:border-border hover:bg-card/80 text-xs text-foreground">
              <Download className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Export page (CSV)
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Matching events" value={String(data.meta.total)} hint="With the current filters" icon={<FileText className="h-4 w-4" />} />
        <Kpi label="Action types" value={String(data.actions.length)} hint="Distinct actions recorded" icon={<ListTree className="h-4 w-4" />} />
        <Kpi label="Actors on this page" value={String(pageActors)} hint="Distinct accounts" icon={<Users className="h-4 w-4" />} />
        <Kpi label="Latest event" value={rows[0] ? fmt(rows[0].at) : '—'} hint="Newest first" icon={<CalendarClock className="h-4 w-4" />} small />
      </div>

      <div className="rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Action:
            </span>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                resetPage();
              }}
              className="h-8 rounded-lg border border-border/70 bg-background/80 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All actions</option>
              {data.actions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>From</span>
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); resetPage(); }} className="h-8 w-36 text-xs" />
            <span>to</span>
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); resetPage(); }} className="h-8 w-36 text-xs" />
            {(from || to || action) && (
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setFrom(''); setTo(''); setAction(''); resetPage(); }}>
                Clear
              </Button>
            )}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          isLoading={isFetching && !rows.length}
          searchPlaceholder="Search action, entity, actor, IP or detail..."
          emptyTitle="No audit events"
          emptyDescription="Nothing matches these filters."
          getRowId={(row) => row.id}
          server={{
            page,
            pageSize,
            total: data.meta.total,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
            search,
            onSearchChange: (value) => {
              setSearch(value);
              setPage(1);
            },
          }}
        />
      </div>
    </div>
  );
}

function Kpi({ label, value, hint, icon, small }: { label: string; value: string; hint: string; icon: React.ReactNode; small?: boolean }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">{icon}</div>
      </div>
      <div className={cn('mt-3 font-bold tracking-tight text-foreground', small ? 'text-sm' : 'text-2xl')}>{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { useAuditLogs } from '../hooks/use-audit-logs';
import { toast } from 'sonner';
import { 
  FileText, 
  ShieldAlert, 
  Users, 
  Activity, 
  Download, 
  RotateCw, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Flame,
  Search
} from 'lucide-react';
import type { AuditLogEntry } from '@/data/admin/extras.data';

const searchFilter = (
  row: LegacyRow<AuditLogEntry>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const e = row.original;
  return (
    e.actor.toLowerCase().includes(q) ||
    e.action.toLowerCase().includes(q) ||
    e.entity.toLowerCase().includes(q) ||
    e.detail.toLowerCase().includes(q)
  );
};

export function AuditLogsPage() {
  const { data, isLoading, isError, refetch } = useAuditLogs();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');

  const rawLogs = data?.items ?? [];

  const filteredLogs = useMemo(() => {
    return rawLogs.filter((item) => {
      const matchSeverity = selectedSeverity === 'all' || item.severity === selectedSeverity;
      const matchEntity = selectedEntity === 'all' || item.entity === selectedEntity;
      return matchSeverity && matchEntity;
    });
  }, [rawLogs, selectedSeverity, selectedEntity]);

  const uniqueEntities = useMemo(() => {
    return Array.from(new Set(rawLogs.map((l) => l.entity)));
  }, [rawLogs]);

  const stats = useMemo(() => {
    const total = rawLogs.length;
    const critical = rawLogs.filter((l) => l.severity === 'critical').length;
    const warning = rawLogs.filter((l) => l.severity === 'warning').length;
    const uniqueActors = new Set(rawLogs.map((l) => l.actor)).size;
    return { total, critical, warning, uniqueActors };
  }, [rawLogs]);

  const exportCsv = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Entity', 'Entity ID', 'Severity', 'Detail'];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.at).toISOString()}"`,
      `"${l.actor}"`,
      `"${l.action}"`,
      `"${l.entity}"`,
      `"${l.entityId}"`,
      `"${l.severity}"`,
      `"${l.detail.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit log report exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<AuditLogEntry, unknown>[]>(
    () => [
      {
        accessorKey: 'at',
        header: 'Timestamp',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="h-3 w-3 text-muted-foreground/70" />
            {new Date(row.original.at).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: 'actor',
        header: 'Operator / Actor',
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
        header: 'Action Performed',
        cell: ({ row }) => (
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-muted/60 border border-border/60 text-foreground font-semibold">
            {row.original.action}
          </span>
        ),
      },
      {
        accessorKey: 'entity',
        header: 'Target Entity',
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-medium text-foreground">{row.original.entity}</div>
            <div className="font-mono text-xs text-muted-foreground">{row.original.entityId}</div>
          </div>
        ),
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ row }) => {
          const s = row.original.severity;
          return (
            <Badge
              variant="outline"
              className={`capitalize font-medium text-xs px-2.5 py-0.5 ${
                s === 'critical'
                  ? 'border-red-500/30 bg-red-500/10 text-red-400'
                  : s === 'warning'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                    : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
              }`}
            >
              {s === 'critical' && <Flame className="mr-1 h-3 w-3 inline text-red-400" />}
              {s === 'warning' && <AlertTriangle className="mr-1 h-3 w-3 inline text-amber-400" />}
              {s === 'info' && <CheckCircle className="mr-1 h-3 w-3 inline text-blue-400" />}
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'detail',
        header: 'Change Detail',
        cell: ({ row }) => (
          <div className="text-sm text-foreground/90 max-w-md line-clamp-2">
            {row.original.detail}
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load audit logs" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs & System Trail"
        subtitle="Immutable security trail of staff actions across customers, billing, routers, and RBAC permissions"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Audit Logs' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Audit trail refreshed');
              }}
              className="border-border/70 hover:border-border hover:bg-card/80 text-xs"
            >
              <RotateCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              className="border-border/70 hover:border-border hover:bg-card/80 text-xs text-foreground"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Audited Events</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">{stats.total}</div>
          <p className="mt-1 text-xs text-muted-foreground">Logged actions & mutations</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Critical Operations</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-red-400">{stats.critical}</div>
          <p className="mt-1 text-xs text-muted-foreground">Deletions, overrides & re-syncs</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Warning Severity</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-amber-400">{stats.warning}</div>
          <p className="mt-1 text-xs text-muted-foreground">Suspensions and batch edits</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Staff Actors</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-blue-400">{stats.uniqueActors}</div>
          <p className="mt-1 text-xs text-muted-foreground">Distinct users recorded</p>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="h-3.5 w-3.5" /> Severity:
            </span>
            {['all', 'critical', 'warning', 'info'].map((sev) => (
              <Button
                key={sev}
                size="sm"
                variant={selectedSeverity === sev ? 'default' : 'outline'}
                onClick={() => setSelectedSeverity(sev)}
                className={`h-7 text-xs capitalize ${
                  selectedSeverity === sev
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'border-border/60 hover:bg-muted/50'
                }`}
              >
                {sev}
              </Button>
            ))}
          </div>

          {uniqueEntities.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Entity:</span>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="h-8 rounded-lg border border-border/70 bg-background/80 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Entity Types</option>
                {uniqueEntities.map((ent) => (
                  <option key={ent} value={ent}>
                    {ent}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={filteredLogs}
          searchKey="actor"
          searchPlaceholder="Filter audit trail by actor, entity or action..."
          searchFilterFn={searchFilter}
        />
      </div>
    </div>
  );
}

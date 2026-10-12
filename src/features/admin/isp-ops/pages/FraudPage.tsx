'use client';

import { useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { ShieldAlert, CheckCircle2, RefreshCw, Eye, PowerOff, EyeOff, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useFraudFlags, useRunFraudScan, useSetFraudStatus, type FraudCustomer, type FraudFlag, type FraudRule } from '../hooks/use-fraud';
import { useDisconnectSession } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';
import { OptionSelect, fmtDateTime } from '../components/NetOpsControls';

const ruleLabel: Record<FraudRule, string> = {
  duplicate_mac: 'Shared CPE MAC',
  duplicate_nid: 'Multiple accounts on one NID',
  duplicate_phone: 'Multiple accounts on one phone',
};

const statusClass: Record<string, string> = {
  open: 'bg-destructive/10 text-destructive border-destructive/30',
  resolved: 'bg-emerald-600 text-white border-transparent',
  ignored: 'bg-muted text-muted-foreground',
};

/** Fraud / account-sharing flags from rule scans over the tenant's customers. */
export function FraudPage() {
  const table = useServerTable();
  const [statusFilter, setStatusFilter] = useState('open');
  const { data, isLoading, isError, error, refetch } = useFraudFlags({ page: table.page, pageSize: table.pageSize, search: table.search, status: statusFilter });
  const scan = useRunFraudScan();
  const setStatus = useSetFraudStatus();
  const disconnect = useDisconnectSession();
  const [inspect, setInspect] = useState<FraudFlag | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<FraudCustomer | null>(null);

  const columns: LegacyColumnDef<FraudFlag, unknown>[] = [
    {
      accessorKey: 'matchValue',
      header: 'Matched Signature',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-xs text-foreground block">{ruleLabel[row.original.rule] ?? row.original.rule}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{row.original.matchValue}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'userCount',
      header: 'Accounts',
      cell: ({ row }) => (
        <div className="text-xs">
          <Badge variant="outline" className="text-[10px] font-mono">
            {row.original.userCount} accounts
          </Badge>
          <p className="mt-1 text-muted-foreground line-clamp-2 max-w-[260px]">{row.original.customers.map((c) => c.name).join(', ') || '—'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'lastDetectedAt',
      header: 'Detected',
      cell: ({ row }) => (
        <div className="font-mono text-xs text-muted-foreground">
          <div>First: {fmtDateTime(row.original.firstDetectedAt)}</div>
          <div>Last: {fmtDateTime(row.original.lastDetectedAt)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline" className={cn('capitalize text-[10px] font-mono', statusClass[row.original.status])}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const f = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => setInspect(f)} title="Inspect accounts">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {f.status === 'open' ? (
              <>
                <Button variant="ghost" size="sm" className="h-7 text-[11px] text-emerald-500" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: f.id, status: 'resolved' })}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Resolve
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: f.id, status: 'ignored' })}>
                  <EyeOff className="h-3.5 w-3.5 mr-1" /> Ignore
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" className="h-7 text-[11px]" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: f.id, status: 'open' })}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reopen
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState title="Failed to load fraud flags" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Detection & Account Sharing"
        subtitle="Accounts that share a CPE MAC, NID or phone number across your customers"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Engagement' }, { label: 'Fraud Detection' }]}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={scan.isPending} onClick={() => scan.mutate()}>
            <RefreshCw className={cn('h-3.5 w-3.5 text-muted-foreground', scan.isPending && 'animate-spin')} />
            {scan.isPending ? 'Scanning…' : 'Run Scan'}
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Monitored customers', value: (summary?.monitoredCustomers ?? 0).toLocaleString() },
          { label: 'Open flags', value: summary?.open ?? 0 },
          { label: 'Resolved', value: summary?.resolved ?? 0 },
          { label: 'Ignored', value: summary?.ignored ?? 0 },
          { label: 'Last scan', value: fmtDateTime(summary?.lastScanAt) },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Flagged Accounts
          </CardTitle>
          <CardDescription>Each flag groups the customers matching one rule value. Run a scan to refresh.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            getRowId={(row) => row.id}
            searchPlaceholder="Search MAC, NID, phone or note..."
            emptyTitle={summary?.lastScanAt ? 'No flags in this view' : 'No scan has run yet'}
            emptyDescription={summary?.lastScanAt ? undefined : 'Run a scan to check your customers for shared MACs, NIDs and phones.'}
            toolbarActions={
              <OptionSelect
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v);
                  table.setPage(1);
                }}
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'ignored', label: 'Ignored' },
                ]}
                placeholder="All"
                noneLabel="All"
                className="h-8 w-[120px] text-xs"
              />
            }
            server={table.server(data?.meta.total ?? 0)}
          />
        </CardContent>
      </Card>

      <Dialog open={!!inspect} onOpenChange={(open) => !open && setInspect(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              {inspect ? ruleLabel[inspect.rule] : ''}
            </DialogTitle>
            <DialogDescription className="font-mono">{inspect?.matchValue}</DialogDescription>
          </DialogHeader>
          {inspect && (
            <div className="space-y-2 py-2 text-xs">
              {inspect.customers.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{[c.pppoeId, c.mobile, c.status].filter(Boolean).join(' · ')}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-destructive"
                    disabled={!c.routerId || !c.pppoeId || disconnect.isPending}
                    onClick={() => setDisconnectTarget(c)}
                    title={c.routerId && c.pppoeId ? 'Disconnect the live PPPoE session' : 'No router/PPPoE username on file'}
                  >
                    <PowerOff className="h-3.5 w-3.5 mr-1" /> Disconnect
                  </Button>
                </div>
              ))}
              {inspect.note && <p className="text-muted-foreground">Note: {inspect.note}</p>}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setInspect(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!disconnectTarget}
        onOpenChange={(open) => !open && setDisconnectTarget(null)}
        title="Disconnect session"
        description={`Drop the live PPPoE session of "${disconnectTarget?.name ?? ''}" (${disconnectTarget?.pppoeId ?? ''})?`}
        confirmLabel="Disconnect"
        destructive
        onConfirm={() => {
          if (disconnectTarget?.routerId && disconnectTarget.pppoeId) {
            disconnect.mutate({ routerId: disconnectTarget.routerId, username: disconnectTarget.pppoeId });
          }
          setDisconnectTarget(null);
        }}
      />
    </div>
  );
}

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

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

type Translate = ReturnType<typeof useTranslations>;

const ruleLabel = (t: Translate, rule: FraudRule): string => {
  if (rule === 'duplicate_mac') return t('admin.ops.fraud.ruleMac', 'Shared CPE MAC');
  if (rule === 'duplicate_nid') return t('admin.ops.fraud.ruleNid', 'Multiple accounts on one NID');
  if (rule === 'duplicate_phone') return t('admin.ops.fraud.rulePhone', 'Multiple accounts on one phone');
  return rule;
};

const statusLabel = (t: Translate, status: string): string => {
  if (status === 'open') return t('status.open', 'Open');
  if (status === 'resolved') return t('status.resolved', 'Resolved');
  if (status === 'ignored') return t('admin.ops.fraud.statusIgnored', 'Ignored');
  return status;
};

const statusClass: Record<string, string> = {
  open: 'bg-destructive/10 text-destructive border-destructive/30',
  resolved: 'bg-emerald-700 text-white border-transparent',
  ignored: 'bg-muted text-muted-foreground',
};

/** Fraud / account-sharing flags from rule scans over the tenant's customers. */
export function FraudPage() {
  const t = useTranslations();
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
      header: t('admin.ops.fraud.colSignature', 'Matched Signature'),
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-xs text-foreground block">{ruleLabel(t, row.original.rule)}</span>
            <span className="text-xs text-muted-foreground font-mono">{row.original.matchValue}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'userCount',
      header: t('admin.ops.fraud.colAccounts', 'Accounts'),
      cell: ({ row }) => (
        <div className="text-xs">
          <Badge variant="outline" className="text-xs font-mono">
            {t('admin.ops.fraud.accountsCount', '{n} accounts', { n: row.original.userCount })}
          </Badge>
          <p className="mt-1 text-muted-foreground line-clamp-2 max-w-[260px]">{row.original.customers.map((c) => c.name).join(', ') || '—'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'lastDetectedAt',
      header: t('admin.ops.fraud.colDetected', 'Detected'),
      cell: ({ row }) => (
        <div className="font-mono text-xs text-muted-foreground">
          <div>{t('admin.ops.fraud.first', 'First:')} {fmtDateTime(row.original.firstDetectedAt)}</div>
          <div>{t('admin.ops.fraud.last', 'Last:')} {fmtDateTime(row.original.lastDetectedAt)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: t('admin.customers.list.statusLabel', 'Status'),
      cell: ({ row }) => (
        <Badge variant="outline" className={cn('capitalize text-xs font-mono', statusClass[row.original.status])}>
          {statusLabel(t, row.original.status)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const f = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => setInspect(f)} title={t('admin.ops.fraud.inspect', 'Inspect accounts')} aria-label={t('admin.ops.fraud.inspect', 'Inspect accounts')}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {f.status === 'open' ? (
              <>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-500" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: f.id, status: 'resolved' })}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {t('admin.ops.fraud.resolve', 'Resolve')}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: f.id, status: 'ignored' })}>
                  <EyeOff className="h-3.5 w-3.5 mr-1" /> {t('admin.ops.fraud.ignore', 'Ignore')}
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: f.id, status: 'open' })}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> {t('admin.ops.fraud.reopen', 'Reopen')}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.ops.fraud.loadFailed', 'Failed to load fraud flags')}
        description={errorMessage(error)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.ops.fraud.title', 'Fraud Detection & Account Sharing')}
        subtitle={t('admin.ops.fraud.subtitle', 'Accounts that share a CPE MAC, NID or phone number across your customers')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.engagement', 'Engagement') },
          { label: t('common.crumb.fraud_detection', 'Fraud Detection') },
        ]}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={scan.isPending} onClick={() => scan.mutate()}>
            <RefreshCw className={cn('h-3.5 w-3.5 text-muted-foreground', scan.isPending && 'animate-spin')} />
            {scan.isPending ? t('admin.ops.fraud.scanning', 'Scanning…') : t('admin.ops.fraud.runScan', 'Run Scan')}
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: t('admin.ops.fraud.sumMonitored', 'Monitored customers'), value: formatCount((summary?.monitoredCustomers ?? 0)) },
          { label: t('admin.ops.fraud.sumOpen', 'Open flags'), value: summary?.open ?? 0 },
          { label: t('status.resolved', 'Resolved'), value: summary?.resolved ?? 0 },
          { label: t('admin.ops.fraud.statusIgnored', 'Ignored'), value: summary?.ignored ?? 0 },
          { label: t('admin.ops.fraud.sumLastScan', 'Last scan'), value: fmtDateTime(summary?.lastScanAt) },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            {t('admin.ops.fraud.cardTitle', 'Flagged Accounts')}
          </CardTitle>
          <CardDescription>{t('admin.ops.fraud.cardDesc', 'Each flag groups the customers matching one rule value. Run a scan to refresh.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable urlState
            columns={columns}
            data={data?.items ?? []}
            getRowId={(row) => row.id}
            searchPlaceholder={t('admin.ops.fraud.search', 'Search MAC, NID, phone or note...')}
            emptyTitle={summary?.lastScanAt ? t('admin.ops.fraud.emptyView', 'No flags in this view') : t('admin.ops.fraud.emptyNoScan', 'No scan has run yet')}
            emptyDescription={summary?.lastScanAt ? undefined : t('admin.ops.fraud.emptyNoScanHint', 'Run a scan to check your customers for shared MACs, NIDs and phones.')}
            toolbarActions={
              <OptionSelect
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v);
                  table.setPage(1);
                }}
                options={[
                  { value: 'open', label: t('status.open', 'Open') },
                  { value: 'resolved', label: t('status.resolved', 'Resolved') },
                  { value: 'ignored', label: t('admin.ops.fraud.statusIgnored', 'Ignored') },
                ]}
                placeholder={t('admin.ops.fraud.all', 'All')}
                noneLabel={t('admin.ops.fraud.all', 'All')}
                className="h-8 w-[150px] text-xs"
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
              {inspect ? ruleLabel(t, inspect.rule) : ''}
            </DialogTitle>
            <DialogDescription className="font-mono">{inspect?.matchValue}</DialogDescription>
          </DialogHeader>
          {inspect && (
            <div className="space-y-2 py-2 text-xs">
              {inspect.customers.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{[c.pppoeId, c.mobile, c.status].filter(Boolean).join(' · ')}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive"
                    disabled={!c.routerId || !c.pppoeId || disconnect.isPending}
                    onClick={() => setDisconnectTarget(c)}
                    title={
                      c.routerId && c.pppoeId
                        ? t('admin.ops.fraud.disconnectHint', 'Disconnect the live PPPoE session')
                        : t('admin.ops.fraud.disconnectNone', 'No router/PPPoE username on file')
                    }
                  >
                    <PowerOff className="h-3.5 w-3.5 mr-1" /> {t('admin.ops.fraud.disconnect', 'Disconnect')}
                  </Button>
                </div>
              ))}
              {inspect.note && <p className="text-muted-foreground">{t('admin.ops.fraud.note', 'Note:')} {inspect.note}</p>}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setInspect(null)}>{t('common.close', 'Close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!disconnectTarget}
        onOpenChange={(open) => !open && setDisconnectTarget(null)}
        title={t('admin.ops.fraud.disconnectTitle', 'Disconnect session')}
        description={t('admin.ops.fraud.disconnectDesc', 'Drop the live PPPoE session of "{name}" ({pppoe})?', {
          name: disconnectTarget?.name ?? '',
          pppoe: disconnectTarget?.pppoeId ?? '',
        })}
        confirmLabel={t('admin.ops.fraud.disconnect', 'Disconnect')}
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

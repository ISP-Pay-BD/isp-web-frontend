'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Eye,
  PowerOff,
  Radio,
  FileCode,
} from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type Row = IspOpsData['fraudEvents'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.at).toLowerCase().includes(q) ||
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.score).toLowerCase().includes(q) ||
    String(r.reason).toLowerCase().includes(q) ||
    String(r.status).toLowerCase().includes(q)
  );
};

export function FraudPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [events, setEvents] = useState<Row[]>([]);
  const [inspectEvent, setInspectEvent] = useState<Row | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<Row | null>(null);

  useMemo(() => {
    if (data?.fraudEvents && events.length === 0) {
      setEvents(data.fraudEvents);
    }
  }, [data?.fraudEvents, events.length]);

  const rows = events.length > 0 ? events : (data?.fraudEvents ?? []);

  const handleUpdateStatus = (index: number, newStatus: 'open' | 'cleared' | 'blocked') => {
    setEvents((prev) =>
      prev.map((e, i) => (i === index ? { ...e, status: newStatus } : e))
    );
    toast.success(`Fraud event status marked as "${newStatus}"`);
  };

  const handleDisconnectSession = () => {
    if (!disconnectTarget) return;
    toast.success(`RADIUS CoA disconnect packet sent for ${disconnectTarget.customerName}`);
    setDisconnectTarget(null);
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Subscriber Account',
        size: 200,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center shrink-0">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">{String(row.original.customerName)}</span>
              <span className="text-[10px] text-muted-foreground font-mono">PPPoE ID #{row.index + 201}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'score',
        header: 'Risk Score',
        size: 140,
        cell: ({ row }) => {
          const s = Number(row.original.score);
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant={s >= 80 ? 'destructive' : s >= 50 ? 'outline' : 'secondary'}
                className={`text-[10px] font-mono gap-1 ${
                  s >= 80 ? 'animate-pulse' : s >= 50 ? 'border-amber-400 text-amber-500 bg-amber-50/10' : ''
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                Score: {s}/100
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'reason',
        header: 'Detected Anomaly Signature',
        size: 280,
        cell: ({ row }) => (
          <span className="text-xs text-foreground/90 font-mono line-clamp-2 leading-relaxed bg-muted/20 p-1.5 rounded border border-border/40">
            {String(row.original.reason)}
          </span>
        ),
      },
      {
        accessorKey: 'at',
        header: 'Detection Time',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{String(row.original.at)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        cell: ({ row }) => {
          const s = String(row.original.status);
          return (
            <Badge
              variant={s === 'open' ? 'destructive' : s === 'investigating' ? 'outline' : 'default'}
              className={`capitalize text-[10px] font-mono ${
                s === 'resolved' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
              }`}
            >
              {s}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 140,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary hover:bg-primary/10"
              onClick={() => setInspectEvent(row.original)}
              title="Inspect Telemetry"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              onClick={() => setDisconnectTarget(row.original)}
              title="Disconnect PPPoE Session"
            >
              <PowerOff className="h-3.5 w-3.5" />
            </Button>
            {row.original.status === 'open' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-emerald-500 hover:bg-emerald-50/10"
                onClick={() => handleUpdateStatus(row.index, 'cleared')}
              >
                Clear
              </Button>
            )}
          </div>
        ),
      },
    ],
    [events],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load fraud events" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const openCount = rows.filter((r) => r.status === 'open').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Detection & MAC Sharing"
        subtitle="Automated anomaly detection for concurrent MAC sessions, credential sharing, and abnormal traffic bursts"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Fraud Detection' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              toast.promise(new Promise((res) => setTimeout(res, 600)), {
                loading: 'Scanning RADIUS session logs for MAC sharing...',
                success: 'Audit complete: No new concurrent credentials detected',
                error: 'Audit failed',
              });
            }}
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            Run Deep Audit
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Monitored Subscribers', value: '3,420 Active' },
          { label: 'Active Fraud Incidents', value: `${openCount} Open Cases` },
          { label: 'Resolved Anomalies', value: `${rows.length - openCount} Cleared` },
          { label: 'System Threat Level', value: 'LOW (Nominal)' },
          { label: 'Auto-Block Protection', value: 'RADIUS CoA Active' },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                Suspicious Activity & Anomaly Alerts
              </CardTitle>
              <CardDescription>
                Telemetry flags triggered by concurrent MAC addresses and abnormal upload ratios
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            searchKey="customerName"
            searchFilterFn={searchFilter}
            searchPlaceholder="Search customer or reason..."
            facetFilters={[{ columnId: 'status', title: 'Status' }]}
          />
        </CardContent>
      </Card>

      {/* Inspect Modal */}
      <Dialog open={!!inspectEvent} onOpenChange={(open) => !open && setInspectEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              Fraud Anomaly Telemetry Details
            </DialogTitle>
            <DialogDescription>
              Forensic evidence captured by RADIUS auth listener
            </DialogDescription>
          </DialogHeader>
          {inspectEvent && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg border border-border/50">
                <div>
                  <span className="text-muted-foreground block">Customer:</span>
                  <span className="font-semibold">{inspectEvent.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Risk Score:</span>
                  <Badge variant="destructive" className="font-mono text-[10px] mt-0.5">
                    {inspectEvent.score}/100 High Risk
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block">Detection Time:</span>
                  <span className="font-mono">{inspectEvent.at}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Status:</span>
                  <Badge variant="outline" className="font-mono text-[10px] uppercase mt-0.5">
                    {inspectEvent.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground font-semibold">Anomaly Details:</span>
                <p className="p-3 bg-background border border-border/60 rounded-lg font-mono text-xs text-foreground/90 leading-relaxed">
                  {inspectEvent.reason}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setInspectEvent(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirm */}
      <ConfirmDialog
        open={!!disconnectTarget}
        onOpenChange={(open) => !open && setDisconnectTarget(null)}
        title="Force Terminate PPPoE Session"
        description={`Send RADIUS disconnect packet (PoD) to immediately drop live session for subscriber "${disconnectTarget?.customerName}"?`}
        confirmLabel="Disconnect Session"
        destructive
        onConfirm={handleDisconnectSession}
      />
    </div>
  );
}

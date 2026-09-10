'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Percent,
  Plus,
  TrendingUp,
  Wallet,
  DollarSign,
  ArrowUpRight,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Row = IspOpsData['popCommissions'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.popName).toLowerCase().includes(q) ||
    String(r.period).toLowerCase().includes(q) ||
    String(r.status).toLowerCase().includes(q)
  );
};

export function PopCommissionsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [selectedCommission, setSelectedCommission] = useState<Row | null>(null);

  const rows = data?.popCommissions ?? [];

  const stats = useMemo(() => {
    const totalCommissions = rows.reduce((s, r) => s + r.commissionBdt, 0);
    const paidCommissions = rows
      .filter((r) => r.status === 'paid')
      .reduce((s, r) => s + r.commissionBdt, 0);
    const pendingCommissions = rows
      .filter((r) => r.status === 'pending')
      .reduce((s, r) => s + r.commissionBdt, 0);
    const totalCollected = rows.reduce((s, r) => s + r.collectedBdt, 0);
    const avgRate = rows.length
      ? (rows.reduce((s, r) => s + r.ratePct, 0) / rows.length).toFixed(1)
      : '0.0';
    return {
      totalCommissions,
      paidCommissions,
      pendingCommissions,
      totalCollected,
      avgRate,
    };
  }, [rows]);

  const handleExportCsv = () => {
    const headers = [
      'POP Reseller',
      'Period',
      'Total Collections (BDT)',
      'Commission Rate (%)',
      'Commission Payout (BDT)',
      'Status',
    ];
    const csvRows = rows.map((r) => [
      r.popName,
      r.period,
      r.collectedBdt,
      r.ratePct,
      r.commissionBdt,
      r.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `pop_commissions_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('POP commission statement exported to CSV');
  };

  const handleSettlePayout = (comm: Row) => {
    toast.success(
      `Commission payout of ৳${comm.commissionBdt.toLocaleString()} for ${comm.popName} disbursed successfully`,
    );
    setSelectedCommission(null);
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'popName',
        header: 'POP Reseller Hub',
        enableHiding: false,
        size: 220,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.popName}</div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {row.original.id}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'period',
        header: 'Billing Cycle',
        size: 130,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{row.original.period}</span>
          </div>
        ),
      },
      {
        accessorKey: 'collectedBdt',
        header: 'Subscriber Collection',
        size: 150,
        cell: ({ row }) => (
          <div className="font-mono text-xs font-semibold text-foreground">
            <CurrencyDisplay amount={row.original.collectedBdt} />
          </div>
        ),
      },
      {
        accessorKey: 'ratePct',
        header: 'Tier Rate',
        size: 110,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/80 border border-border/50 text-xs font-mono font-bold text-foreground">
              {row.original.ratePct}%
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'commissionBdt',
        header: 'Net Commission',
        size: 140,
        cell: ({ row }) => (
          <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={row.original.commissionBdt} />
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Disbursement',
        size: 120,
        cell: ({ row }) => {
          const isPaid = row.original.status === 'paid';
          return isPaid ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Paid
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold gap-1"
            >
              <Clock className="h-3 w-3" />
              Pending
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 110,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex justify-end">
              {r.status === 'pending' ? (
                <Button
                  size="sm"
                  onClick={() => setSelectedCommission(r)}
                  className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-2xs gap-1"
                >
                  <Wallet className="h-3 w-3" /> Settle
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedCommission(r)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <Receipt className="h-3 w-3" /> Voucher
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load POP commissions"
        description="Could not fetch reseller commission accounting records."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="POP Commissions"
        subtitle="Reseller commission settlement ledger calculated from verified downstream subscriber collections"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'POP Suite' },
          { label: 'Commissions' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Statement
            </Button>
            <Button
              size="sm"
              onClick={() =>
                toast.success('All pending commission vouchers queued for batch bank disburse')
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
            >
              <FileCheck className="h-3.5 w-3.5" /> Batch Settle Pending
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">
            <CurrencyDisplay amount={stats.totalCommissions} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">total commissions ({rows.length} cycles)</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={stats.paidCommissions} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">disbursed to wallets</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            <CurrencyDisplay amount={stats.pendingCommissions} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">awaiting clearance</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{stats.avgRate}%</span>{' '}
          <span className="text-muted-foreground">average commission tier</span>
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        searchKey="popName"
        searchPlaceholder="Search POP partner name, period (e.g. 2026-08)..."
        searchFilterFn={searchFilter}
        facetFilters={[
          { columnId: 'status', title: 'Disbursement Status' },
        ]}
        emptyTitle="No commission records found"
        emptyDescription="Commission statements will generate automatically after monthly collection cycles."
      />

      {/* Settlement Voucher Modal */}
      <Dialog
        open={!!selectedCommission}
        onOpenChange={(open) => !open && setSelectedCommission(null)}
      >
        <DialogContent className="max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">Commission Voucher</DialogTitle>
                  <DialogDescription className="text-xs font-mono">
                    {selectedCommission?.period} &middot; {selectedCommission?.id}
                  </DialogDescription>
                </div>
              </div>
              {selectedCommission && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-semibold capitalize',
                    selectedCommission.status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                  )}
                >
                  {selectedCommission.status}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedCommission && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">POP Partner:</span>
                  <span className="font-bold text-foreground">{selectedCommission.popName}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-mono text-foreground">{selectedCommission.period}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Subscriber Total Collections:</span>
                  <span className="font-mono font-semibold text-foreground">
                    ৳{selectedCommission.collectedBdt.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Commission Split Rate:</span>
                  <span className="font-mono font-bold text-primary">
                    {selectedCommission.ratePct}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-bold">
                <span>Calculated Net Payout:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                  ৳{selectedCommission.commissionBdt.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCommission(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                {selectedCommission.status === 'pending' ? (
                  <Button
                    size="sm"
                    onClick={() => handleSettlePayout(selectedCommission)}
                    className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Disburse to Wallet
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.success('Statement voucher printed');
                      setSelectedCommission(null);
                    }}
                    className="text-xs font-semibold"
                  >
                    Print Statement
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

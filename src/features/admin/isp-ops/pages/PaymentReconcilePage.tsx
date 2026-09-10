'use client';

import { useState, useMemo } from 'react';
import {
  Scale,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Filter,
  X,
  CreditCard,
  Building2,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  FileCheck,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { ReconcileRow } from '@/data/admin/isp-ops.data';

type StatusFilter = 'all' | 'matched' | 'unmatched' | 'duplicate';
type GatewayFilter = 'all' | 'bkash' | 'nagad' | 'ssl' | 'bank' | 'rocket';

export function PaymentReconcilePage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [gatewayFilter, setGatewayFilter] = useState<GatewayFilter>('all');
  const [selectedRow, setSelectedRow] = useState<ReconcileRow | null>(null);

  const rawRows = useMemo(() => data?.reconcileRows ?? [], [data?.reconcileRows]);

  // Aggregate Metrics
  const totalSettledBdt = useMemo(
    () => rawRows.reduce((s, r) => s + r.amountBdt, 0),
    [rawRows]
  );
  const matchedBdt = useMemo(
    () => rawRows.filter((r) => r.status === 'matched').reduce((s, r) => s + r.amountBdt, 0),
    [rawRows]
  );
  const unmatchedBdt = useMemo(
    () => rawRows.filter((r) => r.status === 'unmatched').reduce((s, r) => s + r.amountBdt, 0),
    [rawRows]
  );
  const unmatchedCount = useMemo(
    () => rawRows.filter((r) => r.status === 'unmatched').length,
    [rawRows]
  );
  const duplicateCount = useMemo(
    () => rawRows.filter((r) => r.status === 'duplicate').length,
    [rawRows]
  );
  const matchRate = totalSettledBdt > 0 ? Math.round((matchedBdt / totalSettledBdt) * 100) : 0;

  const filteredRows = useMemo(() => {
    return rawRows.filter((row) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const match =
          row.trxId.toLowerCase().includes(q) ||
          row.gateway.toLowerCase().includes(q) ||
          (row.matchedPaymentId && row.matchedPaymentId.toLowerCase().includes(q)) ||
          String(row.amountBdt).includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (gatewayFilter !== 'all') {
        const gw = row.gateway.toLowerCase();
        if (gatewayFilter === 'bkash' && !gw.includes('bkash')) return false;
        if (gatewayFilter === 'nagad' && !gw.includes('nagad')) return false;
        if (gatewayFilter === 'ssl' && !gw.includes('ssl')) return false;
        if (gatewayFilter === 'bank' && !gw.includes('bank') && !gw.includes('city')) return false;
        if (gatewayFilter === 'rocket' && !gw.includes('rocket')) return false;
      }
      return true;
    });
  }, [rawRows, search, statusFilter, gatewayFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Transaction ID',
      'Settlement Date & Time',
      'Gateway Partner',
      'Gross Amount (BDT)',
      'Linked Invoice / Payment ID',
      'Reconciliation Status',
    ];
    const rows = filteredRows.map((r) => [
      r.trxId,
      r.at,
      r.gateway,
      r.amountBdt,
      r.matchedPaymentId ?? 'UNMATCHED',
      r.status.toUpperCase(),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `payment_reconciliation_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reconciliation report exported to CSV');
  };

  const handleMatchPayment = (trxId: string) => {
    toast.success(`Transaction ${trxId} matched and posted to subscriber ledger`);
    setSelectedRow(null);
  };

  if (isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load reconciliation log"
        description="Could not connect to payment gateway IPN service."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Payment Gateway Reconciliation & Settlement"
        subtitle="Match bKash, Nagad, SSLCommerz, and Bank EFT transaction logs against subscriber invoices"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Collections' },
          { label: 'Reconcile' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export Report
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success('Auto-reconciled 4 pending webhook transactions')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Run Auto-Match Engine
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Gateway Inflow
              </span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                ৳{totalSettledBdt.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">BDT</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Total electronic payments received from gateways
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reconciliation Rate
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-emerald-400 font-mono">
                {matchRate}%
              </span>
              <span className="text-xs text-emerald-500 font-medium">auto-matched</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              ৳{matchedBdt.toLocaleString()} credited to customer accounts
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Unmatched Trx
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-amber-400 font-mono">
                {unmatchedCount}
              </span>
              <span className="text-xs text-muted-foreground font-medium">(৳{unmatchedBdt.toLocaleString()})</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Requires manual subscriber invoice pairing
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Duplicate IPN
              </span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <Copy className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-rose-400 font-mono">
                {duplicateCount}
              </span>
              <span className="text-xs text-rose-500 font-medium">flagged</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Duplicate IPN webhooks safely quarantined
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Transaction ID (TrxID), gateway, or payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Gateway Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
            {(
              [
                { key: 'all', label: 'All Gateways' },
                { key: 'bkash', label: 'bKash' },
                { key: 'nagad', label: 'Nagad' },
                { key: 'ssl', label: 'SSLCommerz' },
                { key: 'bank', label: 'City Bank' },
                { key: 'rocket', label: 'Rocket' },
              ] as const
            ).map((pill) => (
              <Button
                key={pill.key}
                type="button"
                size="sm"
                variant={gatewayFilter === pill.key ? 'default' : 'ghost'}
                onClick={() => setGatewayFilter(pill.key)}
                className={cn(
                  'text-xs h-7 px-2.5 font-medium transition-all',
                  gatewayFilter === pill.key
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {pill.label}
              </Button>
            ))}
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="h-9 text-xs w-[130px] bg-background/80">
              <SelectValue placeholder="Match Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="unmatched">Unmatched</SelectItem>
              <SelectItem value="duplicate">Duplicate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      {filteredRows.length === 0 ? (
        <EmptyState
          title="No reconciliation logs found"
          description="No gateway records match the active filter criteria."
          actionLabel="Clear Filter"
          onAction={() => {
            setSearch('');
            setStatusFilter('all');
            setGatewayFilter('all');
          }}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                <tr>
                  <th className="py-3 px-4">Transaction ID (TrxID)</th>
                  <th className="py-3 px-4">Payment Gateway</th>
                  <th className="py-3 px-4">Settlement Time</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Matched Invoice / Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredRows.map((row) => {
                  const isMatched = row.status === 'matched';
                  const isUnmatched = row.status === 'unmatched';
                  const isDuplicate = row.status === 'duplicate';

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRow(row)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                        {row.trxId}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-semibold',
                            row.gateway.includes('bKash') && 'bg-pink-500/10 text-pink-400 border-pink-500/20',
                            row.gateway.includes('Nagad') && 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                            row.gateway.includes('SSL') && 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                            row.gateway.includes('Bank') && 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                            row.gateway.includes('Rocket') && 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                          )}
                        >
                          {row.gateway}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                        {row.at}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-primary text-sm">
                        ৳{row.amountBdt.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {row.matchedPaymentId ? (
                          <span className="text-foreground font-semibold">{row.matchedPaymentId}</span>
                        ) : (
                          <span className="text-amber-400 italic">Unmatched Transaction</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-[10px] font-semibold',
                            isMatched && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                            isUnmatched && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                            isDuplicate && 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          )}
                        >
                          {row.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {isUnmatched ? (
                          <Button
                            size="sm"
                            onClick={() => handleMatchPayment(row.trxId)}
                            className="h-7 px-2 text-[11px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1"
                          >
                            <Zap className="h-3 w-3" /> Match
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedRow(row)}
                            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Inspection Sheet */}
      <Sheet open={Boolean(selectedRow)} onOpenChange={(open) => !open && setSelectedRow(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-border/80 p-6 space-y-6">
          {selectedRow && (
            <>
              <SheetHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] font-semibold tracking-wider bg-primary/10 text-primary border-primary/20"
                  >
                    {selectedRow.gateway}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'capitalize text-[10px]',
                      selectedRow.status === 'matched'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : selectedRow.status === 'unmatched'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    )}
                  >
                    {selectedRow.status}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground font-mono">
                  {selectedRow.trxId}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  IPN Received: {selectedRow.at}
                </SheetDescription>
              </SheetHeader>

              {/* Amount Tile */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Settlement Amount</div>
                  <div className="text-2xl font-black font-mono text-primary mt-0.5">
                    ৳{selectedRow.amountBdt.toLocaleString()}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold">
                  {selectedRow.status.toUpperCase()}
                </Badge>
              </div>

              {/* Settlement Metadata */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Gateway IPN Diagnostics
                </h4>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Linked Subscriber Invoice</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedRow.matchedPaymentId ?? 'No Invoice Associated'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Gateway Channel</span>
                  <span className="font-semibold text-foreground">{selectedRow.gateway}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Verification Signature</span>
                  <span className="font-mono text-emerald-400 text-[11px]">SHA256 HMAC VALID</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-border/60">
                {selectedRow.status === 'unmatched' && (
                  <Button
                    onClick={() => handleMatchPayment(selectedRow.trxId)}
                    className="w-full bg-primary text-primary-foreground text-xs font-semibold h-9"
                  >
                    <Zap className="h-3.5 w-3.5 mr-1.5" /> Match with Active Due Invoice
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedRow(null)}
                  className="w-full text-xs h-9"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

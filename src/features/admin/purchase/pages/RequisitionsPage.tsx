'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { usePurchase, type PurchaseRequisition } from '../hooks/use-purchase';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import {
  Plus,
  Download,
  ClipboardList,
  CheckCircle2,
  Clock,
  Coins,
  FileCheck2,
  FileSpreadsheet,
  MoreHorizontal,
  User,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

const requisitionSearchFilter = (
  row: LegacyRow<PurchaseRequisition>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const req = row.original;
  return (
    req.requisitionId.toLowerCase().includes(q) ||
    req.title.toLowerCase().includes(q) ||
    req.requisitionBy.toLowerCase().includes(q) ||
    req.deadline.toLowerCase().includes(q)
  );
};

export function RequisitionsPage() {
  const { requisitions: initialReqs, isLoading, isError, refetch } = usePurchase();
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [itemCount, setItemCount] = useState('5');
  const [totalAmountBdt, setTotalAmountBdt] = useState('45000');
  const [requisitionBy, setRequisitionBy] = useState('Mahmudul Hasan (NOC Eng)');
  const [deadline, setDeadline] = useState('2026-10-10');

  const list = requisitions.length > 0 ? requisitions : initialReqs;

  const totalReqs = list.length;
  const approvedCount = list.filter((r) => r.status === 'approved' || r.status === 'completed').length;
  const pendingCount = list.filter((r) => r.status === 'pending').length;
  const totalEstimatedValue = list.reduce((acc, r) => acc + (r.totalAmountBdt || 0), 0);

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter requisition title / requirement');
      return;
    }

    const newReq: PurchaseRequisition = {
      id: `req_${Date.now()}`,
      requisitionId: `REQ-${Date.now().toString().slice(-4)}`,
      title,
      itemCount: Number(itemCount) || 1,
      totalAmountBdt: Number(totalAmountBdt) || 0,
      requisitionDate: new Date().toISOString().split('T')[0],
      requisitionBy,
      deadline,
      status: 'pending',
    };

    setRequisitions((prev) => [newReq, ...(prev.length > 0 ? prev : initialReqs)]);
    toast.success(`Requisition ${newReq.requisitionId} submitted for approval.`);
    setModalOpen(false);
    setTitle('');
    setTotalAmountBdt('45000');
  };

  const handleExportCsv = () => {
    const headers = ['Requisition ID', 'Title', 'Item Count', 'Estimated Value (BDT)', 'Requested By', 'Deadline', 'Status'];
    const rows = list.map((r) => [
      r.requisitionId,
      `"${r.title.replace(/"/g, '""')}"`,
      r.itemCount,
      r.totalAmountBdt,
      `"${r.requisitionBy}"`,
      r.deadline,
      r.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase_requisitions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Purchase requisitions exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<PurchaseRequisition, unknown>[]>(
    () => [
      {
        accessorKey: 'requisitionId',
        header: 'Req ID',
        enableHiding: false,
        size: 130,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {row.original.requisitionId}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Procurement Requirement & Scope',
        enableHiding: false,
        size: 280,
        cell: ({ row }) => {
          const req = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card/80 border border-border/60 text-primary shadow-xs">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-medium text-foreground text-sm line-clamp-1">{req.title}</span>
                <span className="text-xs text-muted-foreground">{req.itemCount} items listed</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'totalAmountBdt',
        header: 'Est. Budget',
        size: 140,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-foreground">
            {formatBdtWithSymbol(row.original.totalAmountBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'requisitionBy',
        header: 'Initiated By',
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">{row.original.requisitionBy}</span>
          </div>
        ),
      },
      {
        accessorKey: 'deadline',
        header: 'Target Deadline',
        size: 130,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.deadline}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        cell: ({ row }) => {
          const st = row.original.status;
          if (st === 'approved') {
            return (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                Approved
              </Badge>
            );
          }
          if (st === 'completed') {
            return (
              <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/30">
                Procured
              </Badge>
            );
          }
          if (st === 'pending') {
            return (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                Pending Approval
              </Badge>
            );
          }
          return (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/30">
              Rejected
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const req = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Requisition Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.success(`Requisition ${req.requisitionId} approved`)}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  Approve Requisition
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Issuing Purchase Order for ${req.requisitionId}`)}>
                  <ShoppingBag className="h-3.5 w-3.5 mr-2" />
                  Generate Purchase Order
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Printing voucher for ${req.requisitionId}`)}>
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />
                  Print Requisition Form
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Requisition ${req.requisitionId} rejected`)}
                >
                  <XCircle className="h-3.5 w-3.5 mr-2" />
                  Reject Requisition
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return <EmptyState title="Failed to load requisitions" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Requisitions"
        subtitle="Review internal hardware procurement requests, approval workflows, and budget allocations."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Purchase', href: '/admin/purchase/bills' },
          { label: 'Requisitions' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              New Requisition
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Requisitions</span>
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalReqs}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Procurement tickets</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Approved / Active</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {approvedCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ready for PO</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
            {pendingCount}
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">Awaiting management sign-off</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Estimated Budget</span>
            <Coins className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatBdtWithSymbol(totalEstimatedValue)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Combined requirement value</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={list}
        searchKey="title"
        searchFilterFn={requisitionSearchFilter}
        searchPlaceholder="Search by requisition ID, title, or requester..."
      />

      {/* New Requisition Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateRequisition}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                Submit Purchase Requisition
              </DialogTitle>
              <DialogDescription>
                Request procurement of optical terminals, fiber cables, or network routing hardware.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="req-title">Procurement Title & Scope *</Label>
                <Input
                  id="req-title"
                  placeholder="e.g. 50 Pcs GPON ONU & 10 Drums 2-Core Drop Cable for Uttara Expansion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="req-items">Item Lines Count</Label>
                  <Input
                    id="req-items"
                    type="number"
                    value={itemCount}
                    onChange={(e) => setItemCount(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="req-budget">Est. Budget (BDT) *</Label>
                  <Input
                    id="req-budget"
                    type="number"
                    value={totalAmountBdt}
                    onChange={(e) => setTotalAmountBdt(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="req-by">Initiated By / Department</Label>
                  <Input
                    id="req-by"
                    placeholder="e.g. Mahmudul Hasan (NOC Lead)"
                    value={requisitionBy}
                    onChange={(e) => setRequisitionBy(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="req-deadline">Target Deadline</Label>
                  <Input
                    id="req-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit for Approval</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

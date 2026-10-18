'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import {
  Plus,
  Download,
  ClipboardList,
  CheckCircle2,
  Clock,
  Coins,
  CalendarDays,
  Filter,
  MoreHorizontal,
  User,
  XCircle,
  Eye,
  Edit,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Can, ConfirmDialog } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import { KpiTile } from '@/features/admin/inventory/shared/KpiTile';
import { ListState } from '@/features/admin/inventory/shared/ListState';
import { downloadCsv, fetchAllPages, todayYmd, useServerTable } from '@/features/admin/inventory/shared/table-utils';
import { PURCHASE_DOC_URL, mapDoc, type PurchaseDoc } from '../api';
import { useApproveRequisition, useRequisitions } from '../hooks/use-requisitions';
import { useDeletePurchaseDoc } from '../hooks/use-purchase-docs';
import { PurchaseDocEditor } from '../components/PurchaseDocEditor';
import { PurchaseDocDetailDialog } from '../components/PurchaseDocDetailDialog';
import { DateRangeFilter } from '../components/DateRangeFilter';

const MENU = 'inventory_purchess';

export function RequisitionsPage() {
  const table = useServerTable();
  const [range, setRange] = useState({ from: '', to: '' });
  const query = useRequisitions({ page: table.page, pageSize: table.pageSize, search: table.search, ...range });
  const approve = useApproveRequisition();
  const reject = useDeletePurchaseDoc('requisition');

  const [editor, setEditor] = useState<{ docId: string | null } | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [approving, setApproving] = useState<PurchaseDoc | null>(null);
  const [rejecting, setRejecting] = useState<PurchaseDoc | null>(null);
  const [exporting, setExporting] = useState(false);

  const page = query.data;
  const totals = page?.totals;
  const filtered = Boolean(table.search || range.from || range.to);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const rows = (
        await fetchAllPages<unknown>(
          PURCHASE_DOC_URL.requisition,
          { search: table.search || undefined, from: range.from || undefined, to: range.to || undefined },
          { listKey: 'items' },
        )
      ).map(mapDoc);
      downloadCsv(
        `purchase_requisitions_${todayYmd()}.csv`,
        ['Requisition ID', 'Items', 'Item Names', 'Vendors', 'Total (BDT)', 'Date', 'Requested By', 'Deadline', 'Remarks', 'Status'],
        rows.map((r) => [
          r.requisitionId,
          r.itemCount,
          r.itemNames.join('; '),
          r.vendors.join('; '),
          r.total,
          r.requisitionDate,
          r.requisitionBy,
          r.deadline,
          r.remarks,
          r.status,
        ]),
      );
      toast.success(`Exported ${rows.length} requisitions`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<PurchaseDoc, unknown>[]>(
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
        accessorKey: 'itemNames',
        header: 'Items',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => {
          const r = row.original;
          const names = r.itemNames.slice(0, 2).join(', ');
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card/80 border border-border/60 text-primary shadow-xs">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-medium text-foreground text-sm line-clamp-1">
                  {names || '—'}
                  {r.itemNames.length > 2 ? ` +${r.itemNames.length - 2} more` : ''}
                </span>
                <span className="text-xs text-muted-foreground">
                  {r.itemCount} {r.itemCount === 1 ? 'line' : 'lines'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'vendors',
        header: 'Vendors',
        size: 180,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground line-clamp-2">{row.original.vendors.join(', ') || '—'}</span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Est. Total',
        size: 130,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-foreground">{formatBdtWithSymbol(row.original.total)}</span>
        ),
      },
      {
        accessorKey: 'requisitionDate',
        header: 'Date',
        size: 110,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.requisitionDate || '—'}</span>,
      },
      {
        accessorKey: 'requisitionBy',
        header: 'Requested By',
        size: 160,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">{row.original.requisitionBy || '—'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'deadline',
        header: 'Deadline',
        size: 110,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.deadline || '—'}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: () => (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
            Pending
          </Badge>
        ),
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
                <DropdownMenuItem onClick={() => setViewing(req.requisitionId)}>
                  <Eye className="h-3.5 w-3.5 mr-2" />
                  View Details
                </DropdownMenuItem>
                <Can menu={MENU} action="update">
                  <DropdownMenuItem onClick={() => setEditor({ docId: req.requisitionId })}>
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Edit Requisition
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setApproving(req)}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                    Approve → Purchase Bill
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setRejecting(req)}>
                    <XCircle className="h-3.5 w-3.5 mr-2" />
                    Reject Requisition
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Requisitions"
        subtitle="Pending procurement requests. Approving a requisition turns it into a purchase bill."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Purchase', href: '/admin/purchase/bills' },
          { label: 'Requisitions' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </Button>
            <Can menu={MENU} action="create">
              <Button size="sm" onClick={() => setEditor({ docId: null })} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                New Requisition
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <KpiTile
          label="Pending Review"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          value={page ? page.meta.total.toLocaleString() : '—'}
          valueClassName="text-amber-600 dark:text-amber-400"
          hint={filtered ? 'Matching current filters' : 'Awaiting approval'}
          hintClassName="text-amber-600 dark:text-amber-400 font-medium"
        />
        <KpiTile
          label="Pending Value"
          icon={<Coins className="h-4 w-4 text-primary" />}
          value={totals ? formatBdtWithSymbol(totals.all) : '—'}
          hint="All pending requisitions"
        />
        <KpiTile
          label="Requested Today"
          icon={<CalendarDays className="h-4 w-4 text-primary" />}
          value={totals ? formatBdtWithSymbol(totals.today) : '—'}
          hint={`Value dated ${todayYmd()}`}
        />
        <KpiTile
          label="Filtered Value"
          icon={<Filter className="h-4 w-4 text-primary" />}
          value={totals ? formatBdtWithSymbol(totals.filtered) : '—'}
          hint="Search / date range total"
        />
      </div>

      <ListState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={!filtered && page?.meta.total === 0}
        errorTitle="Failed to load requisitions"
        emptyTitle="No pending requisitions"
        emptyDescription="Create a requisition to request items for purchase."
        icon={<ClipboardList className="h-5 w-5" />}
      >
        <DataTable
          columns={columns}
          data={page?.items ?? []}
          getRowId={(r) => r.requisitionId || r.id}
          searchPlaceholder="Search by requisition ID, item or requester..."
          emptyTitle="No requisitions match your filters"
          server={{
            page: table.page,
            pageSize: table.pageSize,
            total: page?.meta.total ?? 0,
            onPageChange: table.setPage,
            onPageSizeChange: table.onPageSizeChange,
            search: table.search,
            onSearchChange: table.onSearchChange,
          }}
          toolbarActions={
            <DateRangeFilter
              from={range.from}
              to={range.to}
              onChange={(r) => {
                setRange(r);
                table.resetPage();
              }}
            />
          }
        />
      </ListState>

      <PurchaseDocEditor
        kind="requisition"
        open={editor !== null}
        onOpenChange={(o) => !o && setEditor(null)}
        docId={editor?.docId ?? null}
      />

      <PurchaseDocDetailDialog kind="requisition" docId={viewing} onOpenChange={(o) => !o && setViewing(null)} />

      <ConfirmDialog
        open={approving !== null}
        onOpenChange={(o) => !o && setApproving(null)}
        title="Approve requisition?"
        description={
          approving
            ? `${approving.requisitionId} (${formatBdtWithSymbol(approving.total)}) will be approved and moved to purchase bills.`
            : undefined
        }
        confirmLabel="Approve"
        onConfirm={() => {
          if (!approving) return;
          const target = approving;
          approve.mutate(target.requisitionId, {
            onSuccess: () => toast.success(`${target.requisitionId} approved and moved to purchase bills`),
          });
          setApproving(null);
        }}
      />

      <ConfirmDialog
        open={rejecting !== null}
        onOpenChange={(o) => !o && setRejecting(null)}
        title="Reject requisition?"
        description={rejecting ? `${rejecting.requisitionId} will be discarded. This cannot be undone.` : undefined}
        confirmLabel="Reject"
        destructive
        onConfirm={() => {
          if (!rejecting) return;
          const target = rejecting;
          reject.mutate(target.requisitionId, { onSuccess: () => toast.success(`${target.requisitionId} rejected`) });
          setRejecting(null);
        }}
      />
    </div>
  );
}

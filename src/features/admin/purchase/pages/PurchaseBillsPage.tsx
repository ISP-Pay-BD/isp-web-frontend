'use client';

import { Suspense, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import {
  Plus,
  Download,
  Receipt,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  CreditCard,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Can, ConfirmDialog, PageSkeleton } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import { idParam } from '@/features/admin/inventory/api';
import { useSupplierOptions } from '@/features/admin/inventory/hooks/use-suppliers';
import { KpiTile } from '@/features/admin/inventory/shared/KpiTile';
import { ListState } from '@/features/admin/inventory/shared/ListState';
import { OptionSelect } from '@/features/admin/inventory/shared/OptionSelect';
import { useUrlParam } from '@/hooks/use-url-state';
import { downloadCsv, fetchAllPages, todayYmd, useServerTable } from '@/features/admin/inventory/shared/table-utils';
import { PURCHASE_DOC_URL, mapDoc, type PurchaseDoc } from '../api';
import { usePurchaseBills, type PurchaseBillListParams } from '../hooks/use-purchase-bills';
import { useDeletePurchaseDoc } from '../hooks/use-purchase-docs';
import { PurchaseDocEditor } from '../components/PurchaseDocEditor';
import { PurchaseDocDetailDialog } from '../components/PurchaseDocDetailDialog';
import { RecordPaymentDialog } from '../components/RecordPaymentDialog';
import { PaymentStatusBadge } from '../components/PaymentStatusBadge';
import { DateRangeFilter } from '../components/DateRangeFilter';

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
const MENU = 'inventory_purchess';

type PaymentStatusFilter = NonNullable<PurchaseBillListParams['paymentStatus']>;

export function PurchaseBillsPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="table" rows={8} />}>
      <PurchaseBillsView />
    </Suspense>
  );
}

function PurchaseBillsView() {
  const t = useTranslations();
  const table = useServerTable();
  const [vendorId, setVendorId] = useUrlParam('vendor_id');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusFilter>('');
  const [range, setRange] = useState({ from: '', to: '' });
  const query = usePurchaseBills({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    vendorId,
    paymentStatus,
    ...range,
  });
  const suppliersQuery = useSupplierOptions();
  const deleteBill = useDeletePurchaseDoc('bill');

  const [editor, setEditor] = useState<{ docId: string | null } | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<PurchaseDoc | null>(null);
  const [exporting, setExporting] = useState(false);

  const vendorOptions = useMemo(
    () => (suppliersQuery.data ?? []).map((v) => ({ value: v.id, label: v.companyName })),
    [suppliersQuery.data],
  );
  const paymentStatusOptions = useMemo(
    () => [
      { value: 'paid', label: t('status.paid', 'Paid') },
      { value: 'partial', label: t('admin.purchase.bills.partial', 'Partially paid') },
      { value: 'unpaid', label: t('status.unpaid', 'Unpaid') },
    ],
    [t],
  );
  const page = query.data;
  const totals = page?.totals;
  const filtered = Boolean(table.search || vendorId || paymentStatus || range.from || range.to);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const rows = (
        await fetchAllPages<unknown>(
          PURCHASE_DOC_URL.bill,
          {
            search: table.search || undefined,
            vendor_id: idParam(vendorId),
            payment_status: paymentStatus || undefined,
            from: range.from || undefined,
            to: range.to || undefined,
          },
          { listKey: 'items' },
        )
      ).map(mapDoc);
      downloadCsv(
        `purchase_bills_${todayYmd()}.csv`,
        ['Bill', 'Vendors', 'Items', 'Date', 'Total (BDT)', 'Paid (BDT)', 'Due (BDT)', 'Payment Status', 'Approved By', 'Remarks'],
        rows.map((b) => [
          b.requisitionId,
          b.vendors.join('; '),
          b.itemCount,
          b.requisitionDate,
          b.total,
          b.paidAmount,
          b.dueAmount,
          b.paymentStatus,
          b.approvedBy,
          b.remarks,
        ]),
      );
      toast.success(t('admin.purchase.bills.exported', 'Exported {n} purchase bills', { n: rows.length }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('admin.purchase.bills.exportFailed', 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<PurchaseDoc, unknown>[]>(
    () => [
      {
        accessorKey: 'requisitionId',
        header: t('admin.purchase.bills.colBill', 'Bill #'),
        enableHiding: false,
        size: 130,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {row.original.requisitionId}
          </span>
        ),
      },
      {
        accessorKey: 'vendors',
        header: t('admin.purchase.bills.colVendor', 'Supplier / Vendor'),
        enableHiding: false,
        size: 240,
        cell: ({ row }) => {
          const b = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card/80 border border-border/60 text-primary shadow-xs">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-medium text-foreground text-sm line-clamp-1">{b.vendors.join(', ') || '—'}</span>
                <span className="text-xs text-muted-foreground">
                  {b.itemCount === 1
                    ? t('admin.purchase.bills.itemLineOne', '{n} item line', { n: b.itemCount })
                    : t('admin.purchase.bills.itemLineMany', '{n} item lines', { n: b.itemCount })}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'requisitionDate',
        header: t('admin.purchase.bills.colDate', 'Bill Date'),
        size: 110,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.requisitionDate || '—'}</span>,
      },
      {
        accessorKey: 'total',
        header: t('admin.purchase.bills.colTotal', 'Total Bill'),
        size: 130,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-foreground">{formatBdtWithSymbol(row.original.total)}</span>
        ),
      },
      {
        accessorKey: 'paidAmount',
        header: t('status.paid', 'Paid'),
        size: 130,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(row.original.paidAmount)}
          </span>
        ),
      },
      {
        accessorKey: 'dueAmount',
        header: t('admin.purchase.bills.colDue', 'Balance Due'),
        size: 130,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-rose-600 dark:text-rose-400">
            {formatBdtWithSymbol(row.original.dueAmount)}
          </span>
        ),
      },
      {
        accessorKey: 'paymentStatus',
        header: t('admin.purchase.bills.colPaymentStatus', 'Payment Status'),
        size: 130,
        cell: ({ row }) => <PaymentStatusBadge status={row.original.paymentStatus} />,
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const b = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger aria-label={t('common.actions', 'Actions')} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>{t('admin.purchase.bills.actionsLabel', 'Payable Actions')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setViewing(b.requisitionId)}>
                  <Eye className="h-3.5 w-3.5 mr-2" />
                  {t('admin.purchase.bills.viewBill', 'View Bill & Payments')}
                </DropdownMenuItem>
                {b.dueAmount > 0 ? (
                  <Can menu={MENU} action="create">
                    <DropdownMenuItem onClick={() => setPaying(b.requisitionId)}>
                      <CreditCard className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                      {t('admin.purchase.bills.recordPayment', 'Record Payment')}
                    </DropdownMenuItem>
                  </Can>
                ) : null}
                <Can menu={MENU} action="update">
                  <DropdownMenuItem onClick={() => setEditor({ docId: b.requisitionId })}>
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    {t('admin.purchase.bills.editBill', 'Edit Bill')}
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleting(b)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    {t('admin.purchase.bills.deleteBill', 'Delete Bill')}
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.purchase.bills.title', 'Purchase Bills & Payables')}
        subtitle={t('admin.purchase.bills.subtitle', 'Approved purchases, vendor payments and outstanding balances.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.purchase', 'Purchase'), href: '/admin/purchase/bills' },
          { label: t('admin.purchase.bills.crumb', 'Purchase Bills') },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? t('admin.customers.list.exporting', 'Exporting…') : t('admin.purchase.bills.exportPayables', 'Export Payables')}
            </Button>
            <Can menu={MENU} action="create">
              <Button size="sm" onClick={() => setEditor({ docId: null })} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.purchase.bills.newBill', 'New Bill')}
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <KpiTile
          label={filtered ? t('admin.purchase.bills.kpiBilledFiltered', 'Billed (Filtered)') : t('admin.purchase.bills.kpiBilled', 'Total Billed')}
          icon={<Receipt className="h-4 w-4 text-primary" />}
          value={totals ? formatBdtWithSymbol(filtered ? totals.filtered : totals.all) : '—'}
          hint={
            totals
              ? filtered
                ? t('admin.purchase.bills.kpiBilledOfAll', 'of {amount} all-time', { amount: formatBdtWithSymbol(totals.all) })
                : t('admin.purchase.bills.kpiBilledHint', 'All purchase bills')
              : undefined
          }
        />
        <KpiTile
          label={t('status.paid', 'Paid')}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          value={totals ? formatBdtWithSymbol(totals.paid) : '—'}
          valueClassName="text-emerald-600 dark:text-emerald-400"
          hint={filtered ? t('admin.purchase.bills.kpiFilteredHint', 'For the filtered bills') : t('admin.purchase.bills.kpiPaidHint', 'Cleared disbursements')}
          hintClassName="text-emerald-600 dark:text-emerald-400 font-medium"
        />
        <KpiTile
          label={t('admin.purchase.bills.kpiDue', 'Outstanding Due')}
          icon={<AlertCircle className="h-4 w-4 text-rose-500" />}
          value={totals ? formatBdtWithSymbol(totals.due) : '—'}
          valueClassName="text-rose-600 dark:text-rose-400"
          hint={filtered ? t('admin.purchase.bills.kpiFilteredHint', 'For the filtered bills') : t('admin.purchase.bills.kpiDueHint', 'Pending vendor balance')}
          hintClassName="text-rose-600 dark:text-rose-400 font-medium"
        />
        <KpiTile
          label={t('admin.purchase.bills.kpiBills', 'Bills')}
          icon={<FileText className="h-4 w-4 text-primary" />}
          value={page ? formatCount(page.meta.total) : '—'}
          hint={filtered ? t('admin.purchase.bills.kpiMatching', 'Matching current filters') : t('admin.purchase.bills.kpiBillsHint', 'Approved purchase bills')}
        />
      </div>

      <ListState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={!filtered && page?.meta.total === 0}
        errorTitle={t('admin.purchase.bills.loadFailed', 'Failed to load purchase bills')}
        emptyTitle={t('admin.purchase.bills.emptyTitle', 'No purchase bills yet')}
        emptyDescription={t('admin.purchase.bills.emptyDesc', 'Record a bill directly or approve a requisition.')}
        icon={<Receipt className="h-5 w-5" />}
      >
        <DataTable urlState
          columns={columns}
          data={page?.items ?? []}
          getRowId={(r) => r.requisitionId || r.id}
          searchPlaceholder={t('admin.purchase.bills.search', 'Search by bill #, item or vendor...')}
          emptyTitle={t('admin.purchase.bills.emptyFiltered', 'No bills match your filters')}
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
            <div className="flex flex-wrap items-center gap-2">
              <OptionSelect
                value={vendorId}
                onChange={(v) => {
                  setVendorId(v);
                  table.resetPage();
                }}
                options={vendorOptions}
                noneLabel={t('admin.purchase.bills.allVendors', 'All vendors')}
                className="h-9 w-44 text-xs"
              />
              <OptionSelect
                value={paymentStatus}
                onChange={(v) => {
                  setPaymentStatus(v === 'paid' || v === 'partial' || v === 'unpaid' ? v : '');
                  table.resetPage();
                }}
                options={paymentStatusOptions}
                noneLabel={t('admin.purchase.bills.allPayments', 'All payments')}
                className="h-9 w-44 text-xs"
              />
              <DateRangeFilter
                from={range.from}
                to={range.to}
                onChange={(r) => {
                  setRange(r);
                  table.resetPage();
                }}
              />
            </div>
          }
        />
      </ListState>

      <PurchaseDocEditor kind="bill" open={editor !== null} onOpenChange={(o) => !o && setEditor(null)} docId={editor?.docId ?? null} />

      <PurchaseDocDetailDialog kind="bill" docId={viewing} onOpenChange={(o) => !o && setViewing(null)} />

      <RecordPaymentDialog rid={paying} onOpenChange={(o) => !o && setPaying(null)} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('admin.purchase.bills.deleteTitle', 'Delete purchase bill?')}
        description={
          deleting
            ? t('admin.purchase.bills.deleteDesc', '{id} ({amount}) will be deleted. Bills with recorded payments cannot be deleted — void the payments first.', {
                id: deleting.requisitionId,
                amount: formatBdtWithSymbol(deleting.total),
              })
            : undefined
        }
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleting) return;
          const target = deleting;
          deleteBill.mutate(target.requisitionId, {
            onSuccess: () => toast.success(t('admin.purchase.bills.deleted', '{id} deleted', { id: target.requisitionId })),
          });
          setDeleting(null);
        }}
      />
    </div>
  );
}

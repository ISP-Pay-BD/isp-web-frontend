'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import {
  Plus,
  Download,
  Building2,
  Coins,
  Boxes,
  Phone,
  Mail,
  Globe,
  MoreHorizontal,
  Receipt,
  Edit,
  Trash2,
  User,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Can, ConfirmDialog } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { INVENTORY_URL, mapSupplier, type Supplier, type SupplierPayload } from '@/features/admin/inventory/api';
import { useDeleteSupplier, useSaveSupplier, useSuppliers } from '@/features/admin/inventory/hooks/use-suppliers';
import { useInventorySummary } from '@/features/admin/inventory/hooks/use-inventory-summary';
import { KpiTile } from '@/features/admin/inventory/shared/KpiTile';
import { ListState } from '@/features/admin/inventory/shared/ListState';
import { FieldError, fieldError } from '@/features/admin/inventory/shared/form-utils';
import { downloadCsv, fetchAllPages, todayYmd, useServerTable } from '@/features/admin/inventory/shared/table-utils';

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
const MENU = 'inventory_purchess';

export function VendorsPage() {
  const t = useTranslations();
  const table = useServerTable();
  const query = useSuppliers({ page: table.page, pageSize: table.pageSize, search: table.search });
  const summary = useInventorySummary();
  const deleteSupplier = useDeleteSupplier();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);
  const [exporting, setExporting] = useState(false);

  const page = query.data;
  const s = summary.data;

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const rows = (await fetchAllPages<unknown>(`${INVENTORY_URL}/suppliers`, { search: table.search || undefined })).map(
        mapSupplier,
      );
      downloadCsv(
        `purchase_vendors_${todayYmd()}.csv`,
        ['Company', 'Contact Person', 'Email', 'Mobile', 'Phone', 'Website', 'Address', 'Purchased (BDT)', 'Bills'],
        rows.map((v) => [
          v.companyName,
          v.contactPerson,
          v.email,
          v.mobileNumber,
          v.phoneNumber,
          v.website,
          v.address,
          v.purchaseTotal,
          v.billCount,
        ]),
      );
      toast.success(t('admin.purchase.vendors.exported', 'Exported {n} vendors', { n: rows.length }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('admin.purchase.vendors.exportFailed', 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<Supplier, unknown>[]>(
    () => [
      {
        accessorKey: 'companyName',
        header: t('admin.purchase.vendors.colVendor', 'Vendor & Company Name'),
        enableHiding: false,
        size: 260,
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-sm line-clamp-1">{v.companyName}</span>
                {v.email ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{v.email}</span>
                  </span>
                ) : null}
                {v.website ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3 shrink-0" />
                    <span className="truncate">{v.website}</span>
                  </span>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'contactPerson',
        header: t('admin.purchase.vendors.colContact', 'Contact Person'),
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">{row.original.contactPerson || '—'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'mobileNumber',
        header: t('admin.purchase.vendors.colPhone', 'Mobile / Phone'),
        size: 180,
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                <Phone className="h-3 w-3 text-primary shrink-0" />
                <span>{v.mobileNumber || '—'}</span>
              </div>
              {v.phoneNumber ? <div className="pl-[18px] font-mono text-xs text-muted-foreground">{v.phoneNumber}</div> : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'purchaseTotal',
        header: t('admin.purchase.vendors.colPurchased', 'Total Purchased'),
        size: 160,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-sm tabular-nums text-foreground">
              {formatBdtWithSymbol(row.original.purchaseTotal)}
            </span>
            <p className="text-xs text-muted-foreground">
              {row.original.billCount === 1
                ? t('admin.purchase.vendors.billOne', '{n} bill', { n: row.original.billCount })
                : t('admin.purchase.vendors.billMany', '{n} bills', { n: row.original.billCount })}
            </p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const v = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger aria-label={t('common.actions', 'Actions')} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>{t('admin.purchase.vendors.actionsLabel', 'Vendor Actions')}</DropdownMenuLabel>
                <DropdownMenuItem render={<Link href={`/admin/purchase/bills?vendor_id=${encodeURIComponent(v.id)}`} />}>
                  <Receipt className="h-3.5 w-3.5 mr-2" />
                  {t('admin.purchase.vendors.viewBills', 'View Purchase Bills')}
                </DropdownMenuItem>
                <Can menu={MENU} action="update">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditing(v);
                      setFormOpen(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    {t('admin.purchase.vendors.edit', 'Edit Vendor')}
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleting(v)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    {t('admin.purchase.vendors.delete', 'Delete Vendor')}
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
        title={t('admin.purchase.vendors.title', 'Suppliers & Equipment Vendors')}
        subtitle={t('admin.purchase.vendors.subtitle', 'Hardware distributors, cable suppliers and other vendors you purchase from.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.purchase', 'Purchase'), href: '/admin/purchase/bills' },
          { label: t('admin.purchase.vendors.crumb', 'Vendors') },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? t('admin.customers.list.exporting', 'Exporting…') : t('admin.purchase.vendors.exportDirectory', 'Export Directory')}
            </Button>
            <Can menu={MENU} action="create">
              <Button
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
                className="h-9"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.purchase.vendors.add', 'Add Vendor')}
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiTile
          label={t('admin.purchase.vendors.kpiSuppliers', 'Total Suppliers')}
          icon={<Building2 className="h-4 w-4 text-primary" />}
          value={s ? formatCount(s.vendorsCount) : '—'}
          hint={t('admin.purchase.vendors.kpiSuppliersHint', 'Registered vendors')}
        />
        <KpiTile
          label={t('admin.purchase.vendors.kpiPurchased', 'Total Purchased')}
          icon={<Coins className="h-4 w-4 text-primary" />}
          value={s ? formatBdtWithSymbol(s.purchaseTotal) : '—'}
          hint={t('admin.purchase.vendors.kpiPurchasedHint', 'Across all purchase bills')}
        />
        <KpiTile
          label={t('admin.purchase.vendors.kpiUnits', 'Units Purchased')}
          icon={<Boxes className="h-4 w-4 text-emerald-500" />}
          value={s ? formatCount(s.purchasedQty) : '—'}
          hint={t('admin.purchase.vendors.kpiUnitsHint', 'Quantity on purchase bills')}
          hintClassName="text-emerald-600 dark:text-emerald-400 font-medium"
        />
      </div>

      <ListState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={!table.search && page?.meta.total === 0}
        errorTitle={t('admin.purchase.vendors.loadFailed', 'Failed to load vendors')}
        emptyTitle={t('admin.purchase.vendors.emptyTitle', 'No vendors yet')}
        emptyDescription={t('admin.purchase.vendors.emptyDesc', 'Add the suppliers you purchase stock from.')}
        icon={<Building2 className="h-5 w-5" />}
      >
        <DataTable urlState
          columns={columns}
          data={page?.items ?? []}
          getRowId={(r) => r.id}
          searchPlaceholder={t('admin.purchase.vendors.search', 'Search vendor by company, contact, phone or email...')}
          emptyTitle={t('admin.purchase.vendors.emptyFiltered', 'No vendors match your search')}
          server={{
            page: table.page,
            pageSize: table.pageSize,
            total: page?.meta.total ?? 0,
            onPageChange: table.setPage,
            onPageSizeChange: table.onPageSizeChange,
            search: table.search,
            onSearchChange: table.onSearchChange,
          }}
        />
      </ListState>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          {formOpen ? <VendorForm vendor={editing} onDone={() => setFormOpen(false)} /> : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('admin.purchase.vendors.deleteTitle', 'Delete vendor?')}
        description={
          deleting
            ? t('admin.purchase.vendors.deleteDesc', '"{name}" will be removed from the vendor directory.', { name: deleting.companyName })
            : undefined
        }
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleting) return;
          const target = deleting;
          deleteSupplier.mutate(target.id, {
            onSuccess: () => toast.success(t('admin.purchase.vendors.deleted', '"{name}" deleted', { name: target.companyName })),
          });
          setDeleting(null);
        }}
      />
    </div>
  );
}

type VendorField = keyof SupplierPayload;

type FieldDef = { key: VendorField; label: string; required?: boolean; type?: string; half?: boolean };

const vendorFields = (t: ReturnType<typeof useTranslations>): FieldDef[] => [
  { key: 'company_name', label: t('admin.purchase.vendors.fieldCompany', 'Company / Vendor Name'), required: true },
  { key: 'contact_person', label: t('admin.purchase.vendors.fieldContact', 'Contact Person'), required: true, half: true },
  { key: 'email', label: t('admin.purchase.vendors.fieldEmail', 'Email'), required: true, type: 'email', half: true },
  { key: 'mobile_number', label: t('admin.purchase.vendors.fieldMobile', 'Mobile Number'), required: true, type: 'tel', half: true },
  { key: 'phone_number', label: t('admin.purchase.vendors.fieldPhone', 'Phone Number'), type: 'tel', half: true },
  { key: 'website', label: t('admin.purchase.vendors.fieldWebsite', 'Website'), half: true },
  { key: 'facebook_url', label: t('admin.purchase.vendors.fieldFacebook', 'Facebook URL'), half: true },
  { key: 'skype_id', label: t('admin.purchase.vendors.fieldSkype', 'Skype ID'), half: true },
  { key: 'address', label: t('admin.purchase.vendors.fieldAddress', 'Address') },
];

function VendorForm({ vendor, onDone }: { vendor: Supplier | null; onDone: () => void }) {
  const t = useTranslations();
  const fields = vendorFields(t);
  const [values, setValues] = useState<Record<VendorField, string>>({
    company_name: vendor?.companyName ?? '',
    contact_person: vendor?.contactPerson ?? '',
    email: vendor?.email ?? '',
    mobile_number: vendor?.mobileNumber ?? '',
    phone_number: vendor?.phoneNumber ?? '',
    website: vendor?.website ?? '',
    facebook_url: vendor?.facebookUrl ?? '',
    skype_id: vendor?.skypeId ?? '',
    address: vendor?.address ?? '',
  });
  const [localError, setLocalError] = useState<Partial<Record<VendorField, string>>>({});
  const save = useSaveSupplier();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<Record<VendorField, string>> = {};
    if (values.mobile_number && !/^\+?\d{6,15}$/.test(values.mobile_number.trim())) {
      errors.mobile_number = t('admin.purchase.vendors.mobileError', 'Mobile number must be 6–15 digits (optional leading +)');
    }
    setLocalError(errors);
    if (Object.keys(errors).length > 0) return;

    const trimmed = (k: VendorField) => values[k].trim() || undefined;
    const body: SupplierPayload = {
      company_name: values.company_name.trim(),
      contact_person: values.contact_person.trim(),
      email: values.email.trim(),
      mobile_number: values.mobile_number.trim(),
      phone_number: trimmed('phone_number'),
      website: trimmed('website'),
      facebook_url: trimmed('facebook_url'),
      skype_id: trimmed('skype_id'),
      address: trimmed('address'),
    };
    save.mutate(
      { id: vendor?.id, body },
      {
        onSuccess: () => {
          toast.success(
            vendor
              ? t('admin.purchase.vendors.updated', '"{name}" updated', { name: body.company_name })
              : t('admin.purchase.vendors.added', 'Vendor "{name}" added', { name: body.company_name }),
          );
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {vendor ? t('admin.purchase.vendors.edit', 'Edit Vendor') : t('admin.purchase.vendors.formAddTitle', 'Add Supplier / Vendor')}
        </DialogTitle>
        <DialogDescription>{t('admin.purchase.vendors.formDesc', 'Vendors can be selected on requisition and purchase bill lines.')}</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3 py-4">
        {fields.map((f) => {
          const message = localError[f.key] ?? fieldError(save.error, f.key);
          return (
            <div key={f.key} className={f.half ? 'col-span-2 space-y-1.5 sm:col-span-1' : 'col-span-2 space-y-1.5'}>
              <Label htmlFor={`v-${f.key}`}>
                {f.label}
                {f.required ? ' *' : ''}
              </Label>
              <Input
                id={`v-${f.key}`}
                type={f.type ?? 'text'}
                value={values[f.key]}
                onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                aria-invalid={Boolean(message) || undefined}
                required={f.required}
              />
              <FieldError message={message} />
            </div>
          );
        })}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending
            ? t('admin.purchase.vendors.saving', 'Saving…')
            : vendor
              ? t('admin.purchase.vendors.saveChanges', 'Save Changes')
              : t('admin.purchase.vendors.add', 'Add Vendor')}
        </Button>
      </DialogFooter>
    </form>
  );
}

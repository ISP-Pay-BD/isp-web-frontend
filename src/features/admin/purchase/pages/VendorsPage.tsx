'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const MENU = 'inventory_purchess';

export function VendorsPage() {
  const router = useRouter();
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
      toast.success(`Exported ${rows.length} vendors`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<Supplier, unknown>[]>(
    () => [
      {
        accessorKey: 'companyName',
        header: 'Vendor & Company Name',
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
        header: 'Contact Person',
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
        header: 'Mobile / Phone',
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
        header: 'Total Purchased',
        size: 160,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-sm tabular-nums text-foreground">
              {formatBdtWithSymbol(row.original.purchaseTotal)}
            </span>
            <p className="text-xs text-muted-foreground">
              {row.original.billCount} {row.original.billCount === 1 ? 'bill' : 'bills'}
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
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Vendor Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/admin/purchase/bills?vendor_id=${encodeURIComponent(v.id)}`)}>
                  <Receipt className="h-3.5 w-3.5 mr-2" />
                  View Purchase Bills
                </DropdownMenuItem>
                <Can menu={MENU} action="update">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditing(v);
                      setFormOpen(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Edit Vendor
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleting(v)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete Vendor
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers & Equipment Vendors"
        subtitle="Hardware distributors, cable suppliers and other vendors you purchase from."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Purchase', href: '/admin/purchase/bills' },
          { label: 'Vendors' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting…' : 'Export Directory'}
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
                Add Vendor
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiTile
          label="Total Suppliers"
          icon={<Building2 className="h-4 w-4 text-primary" />}
          value={s ? s.vendorsCount.toLocaleString() : '—'}
          hint="Registered vendors"
        />
        <KpiTile
          label="Total Purchased"
          icon={<Coins className="h-4 w-4 text-primary" />}
          value={s ? formatBdtWithSymbol(s.purchaseTotal) : '—'}
          hint="Across all purchase bills"
        />
        <KpiTile
          label="Units Purchased"
          icon={<Boxes className="h-4 w-4 text-emerald-500" />}
          value={s ? s.purchasedQty.toLocaleString() : '—'}
          hint="Quantity on purchase bills"
          hintClassName="text-emerald-600 dark:text-emerald-400 font-medium"
        />
      </div>

      <ListState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={!table.search && page?.meta.total === 0}
        errorTitle="Failed to load vendors"
        emptyTitle="No vendors yet"
        emptyDescription="Add the suppliers you purchase stock from."
        icon={<Building2 className="h-5 w-5" />}
      >
        <DataTable
          columns={columns}
          data={page?.items ?? []}
          getRowId={(r) => r.id}
          searchPlaceholder="Search vendor by company, contact, phone or email..."
          emptyTitle="No vendors match your search"
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
        title="Delete vendor?"
        description={deleting ? `"${deleting.companyName}" will be removed from the vendor directory.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleting) return;
          const target = deleting;
          deleteSupplier.mutate(target.id, { onSuccess: () => toast.success(`"${target.companyName}" deleted`) });
          setDeleting(null);
        }}
      />
    </div>
  );
}

type VendorField = keyof SupplierPayload;

const FIELDS: Array<{ key: VendorField; label: string; required?: boolean; type?: string; half?: boolean }> = [
  { key: 'company_name', label: 'Company / Vendor Name', required: true },
  { key: 'contact_person', label: 'Contact Person', required: true, half: true },
  { key: 'email', label: 'Email', required: true, type: 'email', half: true },
  { key: 'mobile_number', label: 'Mobile Number', required: true, type: 'tel', half: true },
  { key: 'phone_number', label: 'Phone Number', type: 'tel', half: true },
  { key: 'website', label: 'Website', half: true },
  { key: 'facebook_url', label: 'Facebook URL', half: true },
  { key: 'skype_id', label: 'Skype ID', half: true },
  { key: 'address', label: 'Address' },
];

function VendorForm({ vendor, onDone }: { vendor: Supplier | null; onDone: () => void }) {
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
      errors.mobile_number = 'Mobile number must be 6–15 digits (optional leading +)';
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
          toast.success(vendor ? `"${body.company_name}" updated` : `Vendor "${body.company_name}" added`);
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
          {vendor ? 'Edit Vendor' : 'Add Supplier / Vendor'}
        </DialogTitle>
        <DialogDescription>Vendors can be selected on requisition and purchase bill lines.</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3 py-4">
        {FIELDS.map((f) => {
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
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : vendor ? 'Save Changes' : 'Add Vendor'}
        </Button>
      </DialogFooter>
    </form>
  );
}

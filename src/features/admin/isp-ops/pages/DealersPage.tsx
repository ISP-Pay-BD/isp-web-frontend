'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Users, Award, Plus, Download, Phone, MapPin, Pencil, Trash2, UserPlus, X } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TablePagination } from '@/components/shared/TablePagination';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { downloadCsv } from '@/features/admin/accounting/shared/table-utils';
import {
  useAreaOptions,
  useAssignDealerCustomers,
  useDealerCustomers,
  useDealers,
  useDeleteCatalogItem,
  useSaveCatalogItem,
  useUnassignDealerCustomer,
} from '../hooks/use-catalog';
import { CatalogCustomerPicker } from '../components/CatalogCustomerPicker';
import type { CustomerOption, Dealer } from '../catalog.types';

type StatusFilter = '' | 'active' | 'inactive';

interface DealerForm {
  name: string;
  contact_person: string;
  mobile: string;
  area_id: string;
  commission_percent: string;
  status: 'active' | 'inactive';
}

const toForm = (d?: Dealer | null): DealerForm => ({
  name: d?.name ?? '',
  contact_person: d?.contactPerson ?? '',
  mobile: d?.mobile ?? '',
  area_id: d?.areaId ?? '',
  commission_percent: d ? String(d.commissionPercent) : '',
  status: d?.status ?? 'active',
});

function DealerFormDialog({ dealer, open, onOpenChange }: { dealer: Dealer | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const save = useSaveCatalogItem('dealers');
  const areasQuery = useAreaOptions();
  const areas = areasQuery.data ?? [];
  const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors } } = useForm<DealerForm>({
    defaultValues: toForm(dealer),
  });
  useEffect(() => {
    if (open) reset(toForm(dealer));
  }, [open, dealer, reset]);
  const areaId = watch('area_id');
  const status = watch('status');

  const onSubmit = (v: DealerForm) =>
    save.mutate(
      {
        id: dealer?.id,
        body: {
          name: v.name,
          contact_person: v.contact_person,
          mobile: v.mobile,
          area_id: v.area_id || '',
          commission_percent: v.commission_percent === '' ? 0 : Number(v.commission_percent),
          status: v.status,
        },
      },
      {
        onSuccess: () => {
          toast.success(dealer ? 'Dealer updated' : `Dealer "${v.name}" registered`);
          onOpenChange(false);
        },
        onError: (err) => handleApiError(err, setError),
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" /> {dealer ? 'Edit Dealer' : 'Register New Dealer'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Dealers bring in customers; the commission rate is recorded per dealer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="dealer-name" className="text-xs font-semibold">Dealer Name *</Label>
            <Input id="dealer-name" className="text-xs h-9" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dealer-contact" className="text-xs font-semibold">Contact Person</Label>
              <Input id="dealer-contact" className="text-xs h-9" {...register('contact_person')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dealer-mobile" className="text-xs font-semibold">Mobile</Label>
              <Input id="dealer-mobile" inputMode="tel" className="text-xs h-9 font-mono" {...register('mobile')} />
              {errors.mobile && <p className="text-[11px] text-destructive">{errors.mobile.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Coverage Area</Label>
            <Select value={areaId || 'none'} onValueChange={(v) => setValue('area_id', v && v !== 'none' ? String(v) : '')}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue>
                  {(v: string | null) =>
                    v && v !== 'none'
                      ? (areas.find((a) => a.id === v)?.name ?? dealer?.areaName ?? v)
                      : areasQuery.isLoading
                        ? 'Loading areas…'
                        : 'No area'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">No area</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.area_id && <p className="text-[11px] text-destructive">{errors.area_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dealer-commission" className="text-xs font-semibold">Commission (%)</Label>
              <Input
                id="dealer-commission"
                type="number"
                min={0}
                max={100}
                step="0.01"
                className="text-xs h-9 font-mono"
                {...register('commission_percent')}
              />
              {errors.commission_percent && <p className="text-[11px] text-destructive">{errors.commission_percent.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status</Label>
              <Select value={status} onValueChange={(v) => setValue('status', v === 'inactive' ? 'inactive' : 'active')}>
                <SelectTrigger className="text-xs h-9 capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="text-xs">Active</SelectItem>
                  <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs font-semibold" disabled={save.isPending}>
              {dealer ? 'Save Changes' : 'Register Dealer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DealerCustomersDialog({ dealer, onClose }: { dealer: Dealer | null; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<CustomerOption[]>([]);
  const customersQuery = useDealerCustomers(dealer?.id ?? null, { page, pageSize });
  const assign = useAssignDealerCustomers();
  const unassign = useUnassignDealerCustomer();

  useEffect(() => {
    setPage(1);
    setPicking(false);
    setPicked([]);
  }, [dealer?.id]);

  const handleAssign = () => {
    if (!dealer || picked.length === 0) return;
    assign.mutate(
      { dealerId: dealer.id, customerIds: picked.map((c) => c.id) },
      {
        onSuccess: (res) => {
          toast.success(`${Number(res?.assigned ?? picked.length)} customer(s) assigned to ${dealer.name}`);
          setPicked([]);
          setPicking(false);
        },
      },
    );
  };

  const rows = customersQuery.data?.items ?? [];

  return (
    <Dialog open={!!dealer} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-6 border-border/80 shadow-[var(--shadow-md)] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> {dealer?.name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {dealer?.areaName || 'No area'} · {dealer?.commissionPercent}% commission ·{' '}
            {customersQuery.data?.meta.total ?? dealer?.customerCount ?? 0} customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-xs">
          {picking ? (
            <div className="space-y-3 rounded-xl border border-border/60 p-3">
              <CatalogCustomerPicker selected={picked} onChange={setPicked} multiple />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setPicking(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="text-xs" disabled={picked.length === 0 || assign.isPending} onClick={handleAssign}>
                  Assign {picked.length || ''}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">A customer already credited to another dealer is moved here.</p>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => setPicking(true)}>
              <UserPlus className="h-3.5 w-3.5" /> Assign customers
            </Button>
          )}

          {customersQuery.isLoading ? (
            <TableSkeleton rows={3} />
          ) : customersQuery.isError ? (
            <EmptyState
              title="Failed to load customers"
              description={customersQuery.error?.message}
              actionLabel="Retry"
              onAction={() => customersQuery.refetch()}
            />
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">No customers assigned to this dealer yet.</p>
          ) : (
            <div className="rounded-xl border border-border/50 divide-y divide-border/40">
              {rows.map((c) => (
                <div key={c.customerId} className="flex items-center justify-between gap-2 px-3 py-2">
                  <div>
                    <span className="font-semibold text-foreground">{c.name || `#${c.customerId}`}</span>
                    <span className="ml-2 font-mono text-muted-foreground">{c.mobile}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                    disabled={unassign.isPending}
                    onClick={() =>
                      dealer &&
                      unassign.mutate(
                        { dealerId: dealer.id, customerId: c.customerId },
                        { onSuccess: () => toast.success(`${c.name || 'Customer'} unassigned`) },
                      )
                    }
                    aria-label={`Unassign ${c.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {(customersQuery.data?.meta.total ?? 0) > pageSize && (
            <TablePagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={customersQuery.data?.meta.total ?? 0}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DealersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const { data, isLoading, isError, error, refetch } = useDealers({ page, pageSize, search, filters: { status } });
  const remove = useDeleteCatalogItem('dealers');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Dealer | null>(null);
  const [customersOf, setCustomersOf] = useState<Dealer | null>(null);
  const [deleting, setDeleting] = useState<Dealer | null>(null);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const summary = data?.summary;

  const handleExportCsv = () =>
    downloadCsv(
      `dealers_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Dealer ID', 'Name', 'Contact Person', 'Mobile', 'Area', 'Commission %', 'Customers', 'Status'],
      rows.map((r) => [r.id, r.name, r.contactPerson, r.mobile, r.areaName, r.commissionPercent, r.customerCount, r.status]),
    );

  const columns = useMemo<LegacyColumnDef<Dealer, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Dealer',
        enableHiding: false,
        size: 220,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <button
                type="button"
                className="font-bold text-sm text-foreground hover:text-primary transition-colors text-left"
                onClick={() => setCustomersOf(row.original)}
              >
                {row.original.name}
              </button>
              <div className="text-[10px] text-muted-foreground">{row.original.contactPerson || '—'}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'mobile',
        header: 'Contact',
        size: 140,
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5 font-mono text-xs text-foreground">
            <Phone className="h-3 w-3 text-muted-foreground" /> {row.original.mobile || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'areaName',
        header: 'Area',
        size: 150,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <span>{row.original.areaName || '—'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'commissionPercent',
        header: 'Commission',
        size: 110,
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/80 border border-border/50 text-xs font-mono font-bold text-foreground">
            {row.original.commissionPercent}%
          </span>
        ),
      },
      {
        accessorKey: 'customerCount',
        header: 'Customers',
        size: 110,
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-secondary/80 border border-border/50 text-xs font-bold font-mono text-foreground">
            <Users className="h-3 w-3 mr-1 text-primary" />
            {row.original.customerCount}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) =>
          row.original.status === 'active' ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-medium gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />
              Inactive
            </Badge>
          ),
      },
      {
        id: 'actions',
        header: '',
        size: 150,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => setCustomersOf(row.original)} className="h-7 text-xs text-primary hover:bg-primary/10">
              Customers
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(row.original);
                setFormOpen(true);
              }}
              className="h-7 px-2 text-xs"
              aria-label={`Edit ${row.original.name}`}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleting(row.original)}
              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
              aria-label={`Delete ${row.original.name}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load dealers"
        description={error?.message ?? 'Could not fetch dealer records.'}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Dealers"
        subtitle="Field sales partners, their coverage areas, commission rates and the customers they brought in"
        breadcrumb={[{ label: 'Admin', url: '/admin/dashboard' }, { label: 'Dealers' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={rows.length === 0}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Page
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Dealer
            </Button>
          </div>
        }
      />

      {summary && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums text-foreground">{summary.total}</span>{' '}
            <span className="text-muted-foreground">registered dealers · {summary.active} active</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-foreground">{summary.assignedCustomers.toLocaleString()}</span>{' '}
            <span className="text-muted-foreground">customers credited to dealers</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-primary">{summary.avgCommission}%</span>{' '}
            <span className="text-muted-foreground">average commission</span>
          </p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        searchPlaceholder="Search dealer name, contact or mobile..."
        emptyTitle={search || status ? 'No dealers match your filters' : 'No dealers yet'}
        emptyDescription="Register a dealer partner to track the customers they bring in."
        server={{
          page,
          pageSize,
          total: data?.meta.total ?? 0,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
          search,
          onSearchChange,
        }}
        toolbarActions={
          <Select
            value={status || 'all'}
            onValueChange={(v) => {
              setStatus(v === 'active' || v === 'inactive' ? v : '');
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue>
                {(v: string | null) => (v === 'active' ? 'Active' : v === 'inactive' ? 'Inactive' : 'All statuses')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <DealerFormDialog dealer={editing} open={formOpen} onOpenChange={setFormOpen} />
      <DealerCustomersDialog dealer={customersOf} onClose={() => setCustomersOf(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'dealer'}?`}
        description="The dealer and its customer links are removed. Customers themselves are not affected."
        confirmLabel="Delete"
        destructive
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Dealer deleted');
              setDeleting(null);
            },
          })
        }
      />
    </div>
  );
}

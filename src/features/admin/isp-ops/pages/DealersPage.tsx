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

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

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
  const t = useTranslations();
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
          toast.success(
            dealer
              ? t('admin.ops.dealers.updated', 'Dealer updated')
              : t('admin.ops.dealers.registered', 'Dealer "{name}" registered', { name: v.name }),
          );
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
            <Award className="h-4 w-4 text-primary" /> {dealer ? t('admin.ops.dealers.editDealer', 'Edit Dealer') : t('admin.ops.dealers.registerNew', 'Register New Dealer')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t('admin.ops.dealers.formDesc', 'Dealers bring in customers; the commission rate is recorded per dealer.')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="dealer-name" className="text-xs font-semibold">{t('admin.ops.dealers.fieldName', 'Dealer Name *')}</Label>
            <Input id="dealer-name" className="text-xs h-9" {...register('name', { required: t('admin.ops.dealers.nameRequired', 'Name is required') })} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dealer-contact" className="text-xs font-semibold">{t('admin.ops.dealers.fieldContactPerson', 'Contact Person')}</Label>
              <Input id="dealer-contact" className="text-xs h-9" {...register('contact_person')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dealer-mobile" className="text-xs font-semibold">{t('admin.ops.dealers.fieldMobile', 'Mobile')}</Label>
              <Input id="dealer-mobile" inputMode="tel" className="text-xs h-9 font-mono" {...register('mobile')} />
              {errors.mobile && <p className="text-xs text-destructive">{errors.mobile.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coverage-area" className="text-xs font-semibold">{t('admin.ops.dealers.fieldArea', 'Coverage Area')}</Label>
            <Select value={areaId || 'none'} onValueChange={(v) => setValue('area_id', v && v !== 'none' ? String(v) : '')}>
              <SelectTrigger id="coverage-area" className="text-xs h-9">
                <SelectValue>
                  {(v: string | null) =>
                    v && v !== 'none'
                      ? (areas.find((a) => a.id === v)?.name ?? dealer?.areaName ?? v)
                      : areasQuery.isLoading
                        ? t('admin.ops.dealers.loadingAreas', 'Loading areas…')
                        : t('admin.ops.dealers.noArea', 'No area')
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">{t('admin.ops.dealers.noArea', 'No area')}</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.area_id && <p className="text-xs text-destructive">{errors.area_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dealer-commission" className="text-xs font-semibold">{t('admin.ops.dealers.fieldCommission', 'Commission (%)')}</Label>
              <Input
                id="dealer-commission"
                type="number"
                min={0}
                max={100}
                step="0.01"
                className="text-xs h-9 font-mono"
                {...register('commission_percent')}
              />
              {errors.commission_percent && <p className="text-xs text-destructive">{errors.commission_percent.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold">{t('admin.customerPayments.list.colStatus', 'Status')}</Label>
              <Select value={status} onValueChange={(v) => setValue('status', v === 'inactive' ? 'inactive' : 'active')}>
                <SelectTrigger id="status" className="text-xs h-9">
                  <SelectValue>
                    {(v: string | null) => (v === 'inactive' ? t('status.inactive', 'Inactive') : t('status.active', 'Active'))}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="text-xs">{t('status.active', 'Active')}</SelectItem>
                  <SelectItem value="inactive" className="text-xs">{t('status.inactive', 'Inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" size="sm" className="text-xs font-semibold" disabled={save.isPending}>
              {dealer ? t('admin.ops.dealers.saveChanges', 'Save Changes') : t('admin.ops.dealers.registerDealer', 'Register Dealer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DealerCustomersDialog({ dealer, onClose }: { dealer: Dealer | null; onClose: () => void }) {
  const t = useTranslations();
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
          toast.success(
            t('admin.ops.dealers.assigned', '{n} customer(s) assigned to {name}', {
              n: Number(res?.assigned ?? picked.length),
              name: dealer.name,
            }),
          );
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
            {t('admin.ops.dealers.customersDesc', '{area} · {pct}% commission · {n} customers', {
              area: dealer?.areaName || t('admin.ops.dealers.noArea', 'No area'),
              pct: dealer?.commissionPercent ?? 0,
              n: customersQuery.data?.meta.total ?? dealer?.customerCount ?? 0,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-xs">
          {picking ? (
            <div className="space-y-3 rounded-xl border border-border/60 p-3">
              <CatalogCustomerPicker selected={picked} onChange={setPicked} multiple />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setPicking(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button size="sm" className="text-xs" disabled={picked.length === 0 || assign.isPending} onClick={handleAssign}>
                  {picked.length > 0 ? t('admin.ops.dealers.assignN', 'Assign {n}', { n: picked.length }) : t('admin.ops.dealers.assign', 'Assign')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('admin.ops.dealers.moveHint', 'A customer already credited to another dealer is moved here.')}
              </p>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => setPicking(true)}>
              <UserPlus className="h-3.5 w-3.5" /> {t('admin.ops.dealers.assignCustomers', 'Assign customers')}
            </Button>
          )}

          {customersQuery.isLoading ? (
            <TableSkeleton rows={3} />
          ) : customersQuery.isError ? (
            <EmptyState variant="error"
              title={t('admin.ops.dealers.customersFailed', 'Failed to load customers')}
              description={customersQuery.error?.message}
              actionLabel={t('admin.customers.list.retry', 'Retry')}
              onAction={() => customersQuery.refetch()}
            />
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">{t('admin.ops.dealers.noCustomers', 'No customers assigned to this dealer yet.')}</p>
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
                        {
                          onSuccess: () =>
                            toast.success(
                              t('admin.ops.dealers.unassigned', '{name} unassigned', {
                                name: c.name || t('admin.ops.dealers.customerWord', 'Customer'),
                              }),
                            ),
                        },
                      )
                    }
                    aria-label={t('admin.ops.dealers.unassign', 'Unassign {name}', { name: c.name })}
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
  const t = useTranslations();
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
        header: t('admin.ops.dealers.colDealer', 'Dealer'),
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
              <div className="text-xs text-muted-foreground">{row.original.contactPerson || '—'}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'mobile',
        header: t('admin.ops.dealers.colContact', 'Contact'),
        size: 140,
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5 font-mono text-xs text-foreground">
            <Phone className="h-3 w-3 text-muted-foreground" /> {row.original.mobile || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'areaName',
        header: t('admin.ops.dealers.colArea', 'Area'),
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
        header: t('admin.ops.dealers.colCommission', 'Commission'),
        size: 110,
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/80 border border-border/50 text-xs font-mono font-bold text-foreground">
            {row.original.commissionPercent}%
          </span>
        ),
      },
      {
        accessorKey: 'customerCount',
        header: t('admin.ops.dealers.colCustomers', 'Customers'),
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
        header: t('admin.customerPayments.list.colStatus', 'Status'),
        size: 110,
        cell: ({ row }) =>
          row.original.status === 'active' ? (
            <Badge variant="outline" tone="success" className="text-xs font-medium gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              {t('status.active', 'Active')}
            </Badge>
          ) : (
            <Badge variant="outline" tone="danger" className="text-xs font-medium gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />
              {t('status.inactive', 'Inactive')}
            </Badge>
          ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        size: 150,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => setCustomersOf(row.original)} className="h-7 text-xs text-primary hover:bg-primary/10">
              {t('admin.ops.dealers.colCustomers', 'Customers')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(row.original);
                setFormOpen(true);
              }}
              className="h-7 px-2 text-xs"
              aria-label={t('admin.ops.dealers.editNamed', 'Edit {name}', { name: row.original.name })}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleting(row.original)}
              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
              aria-label={t('admin.ops.dealers.deleteNamed', 'Delete {name}', { name: row.original.name })}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.dealers.loadFailed', 'Failed to load dealers')}
        description={error?.message ?? t('admin.ops.dealers.loadFailedHint', 'Could not fetch dealer records.')}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('nav.dealers', 'Dealers')}
        subtitle={t('admin.ops.dealers.subtitle', 'Field sales partners, their coverage areas, commission rates and the customers they brought in')}
        breadcrumb={[{ label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' }, { label: t('nav.dealers', 'Dealers') }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={rows.length === 0}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> {t('admin.ops.dealers.exportPage', 'Export Page')}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> {t('admin.ops.dealers.addDealer', 'Add Dealer')}
            </Button>
          </div>
        }
      />

      {summary && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums text-foreground">{summary.total}</span>{' '}
            <span className="text-muted-foreground">
              {t('admin.ops.dealers.statRegistered', 'registered dealers · {n} active', { n: summary.active })}
            </span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-foreground">{formatCount(summary.assignedCustomers)}</span>{' '}
            <span className="text-muted-foreground">{t('admin.ops.dealers.statCredited', 'customers credited to dealers')}</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-primary">{summary.avgCommission}%</span>{' '}
            <span className="text-muted-foreground">{t('admin.ops.dealers.statAvg', 'average commission')}</span>
          </p>
        </div>
      )}

      <DataTable urlState
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.ops.dealers.searchPlaceholder', 'Search dealer name, contact or mobile...')}
        emptyTitle={
          search || status
            ? t('admin.ops.dealers.emptyFiltered', 'No dealers match your filters')
            : t('admin.ops.dealers.emptyNone', 'No dealers yet')
        }
        emptyDescription={t('admin.ops.dealers.emptyHint', 'Register a dealer partner to track the customers they bring in.')}
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
            <SelectTrigger aria-label={t('admin.ops.dealers.filterStatus', 'Filter by status')} className="h-9 min-w-[130px] text-xs">
              <SelectValue>
                {(v: string | null) =>
                  v === 'active'
                    ? t('status.active', 'Active')
                    : v === 'inactive'
                      ? t('status.inactive', 'Inactive')
                      : t('admin.customerPayments.list.allStatuses', 'All statuses')
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.customerPayments.list.allStatuses', 'All statuses')}</SelectItem>
              <SelectItem value="active">{t('status.active', 'Active')}</SelectItem>
              <SelectItem value="inactive">{t('status.inactive', 'Inactive')}</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <DealerFormDialog dealer={editing} open={formOpen} onOpenChange={setFormOpen} />
      <DealerCustomersDialog dealer={customersOf} onClose={() => setCustomersOf(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('admin.ops.dealers.deleteTitle', 'Delete {name}?', { name: deleting?.name ?? t('admin.ops.dealers.dealerWord', 'dealer') })}
        description={t('admin.ops.dealers.deleteDesc', 'The dealer and its customer links are removed. Customers themselves are not affected.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success(t('admin.ops.dealers.deleted', 'Dealer deleted'));
              setDeleting(null);
            },
          })
        }
      />
    </div>
  );
}

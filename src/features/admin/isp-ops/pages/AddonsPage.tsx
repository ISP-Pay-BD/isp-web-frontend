'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Layers,
  Search,
  Plus,
  Tv,
  Film,
  Globe,
  Radio,
  CheckCircle2,
  MoreVertical,
  RefreshCw,
  X,
  ArrowRight,
  DollarSign,
  Eye,
  Pencil,
  Sliders,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { CardGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { TablePagination } from '@/components/shared/TablePagination';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { todayYmd } from '@/features/admin/accounting/shared/table-utils';
import {
  useAddonSubscriptions,
  useAddons,
  useDeleteAddonSubscription,
  useDeleteCatalogItem,
  useSaveAddonSubscription,
  useSaveCatalogItem,
} from '../hooks/use-catalog';
import { CatalogCustomerPicker } from '../components/CatalogCustomerPicker';
import {
  ADDON_CATEGORIES,
  SUBSCRIPTION_STATUSES,
  type Addon,
  type AddonBillingType,
  type AddonCategory,
  type AddonSubscription,
  type CustomerOption,
  type SubscriptionStatus,
} from '../catalog.types';

type CategoryFilter = 'all' | AddonCategory;
type StatusFilter = 'all' | 'active' | 'inactive';

const CARD_PAGE_SIZE = 12;

const categoryConfig: Record<AddonCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
  ott: { label: 'OTT Entertainment', icon: Film, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  iptv: { label: 'IPTV Channels / STB', icon: Tv, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  static_ip: { label: 'Public Static IP', icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  other: { label: 'Hardware & Other', icon: Radio, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
};

const billingLabel = (b: string) => (b === 'one_time' ? 'One-time' : 'Monthly');

interface AddonForm {
  name: string;
  category: AddonCategory;
  price: string;
  billing_type: AddonBillingType;
  description: string;
  active: boolean;
}

const toForm = (a?: Addon | null): AddonForm => ({
  name: a?.name ?? '',
  category: a?.category ?? 'other',
  price: a ? String(a.price) : '',
  billing_type: a?.billingType ?? 'monthly',
  description: a?.description ?? '',
  active: a?.active ?? true,
});

function AddonFormDialog({ addon, open, onOpenChange }: { addon: Addon | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const save = useSaveCatalogItem('addons');
  const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors } } = useForm<AddonForm>({
    defaultValues: toForm(addon),
  });
  useEffect(() => {
    if (open) reset(toForm(addon));
  }, [open, addon, reset]);
  const category = watch('category');
  const billing = watch('billing_type');

  const onSubmit = (v: AddonForm) =>
    save.mutate(
      {
        id: addon?.id,
        body: { name: v.name, category: v.category, price: Number(v.price), billing_type: v.billing_type, description: v.description, active: v.active },
      },
      {
        onSuccess: () => {
          toast.success(addon ? 'Add-on updated' : `Add-on "${v.name}" created`);
          onOpenChange(false);
        },
        onError: (err) => handleApiError(err, setError),
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> {addon ? 'Edit Add-on Product' : 'Create New Add-on Product'}
          </DialogTitle>
          <DialogDescription className="text-xs">Sellable OTT, IPTV, static IP or hardware add-on.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="addon-name" className="text-xs font-semibold text-muted-foreground">Add-on Title *</Label>
            <Input id="addon-name" className="h-9 text-xs" {...register('name', { required: 'Title is required' })} />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Category *</Label>
              <Select value={category} onValueChange={(v) => v && setValue('category', v as AddonCategory)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue>{(v: string | null) => categoryConfig[(v ?? 'other') as AddonCategory]?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {ADDON_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{categoryConfig[c].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addon-price" className="text-xs font-semibold text-muted-foreground">Price (BDT) *</Label>
              <Input
                id="addon-price"
                type="number"
                min={0}
                step="0.01"
                className="h-9 text-xs font-mono"
                {...register('price', { required: 'Price is required' })}
              />
              {errors.price && <p className="text-[11px] text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Billing *</Label>
              <Select value={billing} onValueChange={(v) => v && setValue('billing_type', v === 'one_time' ? 'one_time' : 'monthly')}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue>{(v: string | null) => billingLabel(v ?? 'monthly')}</SelectValue>
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="one_time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addon-desc" className="text-xs font-semibold text-muted-foreground">Description</Label>
            <Input id="addon-desc" className="h-9 text-xs" {...register('description')} />
            {errors.description && <p className="text-[11px] text-destructive">{errors.description.message}</p>}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" {...register('active')} />
            Active — available for new customer subscriptions
          </label>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-xs">Cancel</Button>
            <Button type="submit" disabled={save.isPending} className="text-xs font-semibold">
              {addon ? 'Save Changes' : 'Create Add-on Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssignAddonDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const save = useSaveAddonSubscription();
  const activeAddons = useAddons({ page: 1, pageSize: 100, filters: { active: 1 } });
  const [customer, setCustomer] = useState<CustomerOption[]>([]);
  const [addonId, setAddonId] = useState('');
  const [startDate, setStartDate] = useState(todayYmd());
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!open) return;
    setCustomer([]);
    setAddonId('');
    setStartDate(todayYmd());
    setEndDate('');
  }, [open]);

  const addons = activeAddons.data?.items ?? [];
  const submit = () =>
    save.mutate(
      { body: { customer_id: Number(customer[0]?.id), addon_id: Number(addonId), start_date: startDate, end_date: endDate || undefined } },
      {
        onSuccess: () => {
          toast.success('Add-on assigned');
          onOpenChange(false);
        },
        onError: (err) => handleApiError(err),
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Assign Add-on to Customer</DialogTitle>
          <DialogDescription className="text-xs">The add-on&apos;s current price is recorded on the subscription.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-xs">
          <CatalogCustomerPicker selected={customer} onChange={setCustomer} />
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Add-on *</Label>
            <Select value={addonId || null} onValueChange={(v) => v && setAddonId(String(v))}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue>
                  {(v: string | null) => {
                    const a = addons.find((x) => x.id === v);
                    return a ? `${a.name} · ৳${a.price.toLocaleString()}` : activeAddons.isLoading ? 'Loading add-ons…' : 'Select add-on';
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {addons.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-xs">
                    {a.name} · ৳{a.price.toLocaleString()} ({billingLabel(a.billingType)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sub-start" className="text-xs font-semibold">Start Date</Label>
              <Input id="sub-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sub-end" className="text-xs font-semibold">End Date</Label>
              <Input id="sub-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="text-xs">Cancel</Button>
            <Button onClick={submit} disabled={!customer[0] || !addonId || save.isPending} className="text-xs font-semibold">Assign</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SubscriptionsCard() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | SubscriptionStatus>('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [removing, setRemoving] = useState<AddonSubscription | null>(null);
  const subs = useAddonSubscriptions({ page, pageSize, search, filters: { status } });
  const save = useSaveAddonSubscription();
  const remove = useDeleteAddonSubscription();

  const onSearchChange = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const { mutate: saveSub } = save;
  const columns = useMemo<LegacyColumnDef<AddonSubscription, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer',
        size: 180,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-xs text-foreground block">{row.original.customerName || `#${row.original.customerId}`}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{row.original.customerMobile}</span>
          </div>
        ),
      },
      {
        accessorKey: 'addonName',
        header: 'Add-on',
        size: 170,
        cell: ({ row }) => (
          <div>
            <span className="text-xs font-medium text-foreground block">{row.original.addonName || '—'}</span>
            <span className="text-[10px] text-muted-foreground">{billingLabel(row.original.billingType)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 100,
        cell: ({ row }) => <CurrencyDisplay amount={row.original.price} className="text-xs font-semibold" />,
      },
      {
        accessorKey: 'startDate',
        header: 'Period',
        size: 170,
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-muted-foreground">
            {row.original.startDate || '—'} → {row.original.endDate || 'open'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 140,
        cell: ({ row }) => (
          <Select
            value={row.original.status}
            onValueChange={(v) =>
              v &&
              v !== row.original.status &&
              saveSub(
                { id: row.original.id, body: { status: v } },
                { onSuccess: () => toast.success(`Subscription ${v}`), onError: (err) => handleApiError(err) },
              )
            }
          >
            <SelectTrigger className="h-7 w-[120px] text-[11px] capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBSCRIPTION_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-destructive hover:bg-destructive/10"
            onClick={() => setRemoving(row.original)}
            aria-label="Remove subscription"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    [saveSub],
  );

  const summary = subs.data?.summary;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Customer Subscriptions</CardTitle>
          <CardDescription className="text-xs">
            {summary
              ? `${summary.active} active · ৳${summary.monthlyRecurring.toLocaleString()} monthly recurring · ৳${summary.oneTimeTotal.toLocaleString()} one-time`
              : 'Which customers have which add-ons'}
          </CardDescription>
        </div>
        <Button size="sm" className="text-xs gap-1.5" onClick={() => setAssignOpen(true)}>
          <UserPlus className="h-3.5 w-3.5" /> Assign Add-on
        </Button>
      </CardHeader>
      <CardContent>
        {subs.isError ? (
          <EmptyState title="Failed to load subscriptions" description={subs.error?.message} actionLabel="Retry" onAction={() => subs.refetch()} />
        ) : (
          <DataTable
            columns={columns}
            data={subs.data?.items ?? []}
            isLoading={subs.isLoading}
            getRowId={(r) => r.id}
            searchPlaceholder="Search customer, mobile or add-on..."
            emptyTitle={search || status ? 'No subscriptions match your filters' : 'No customer has an add-on yet'}
            enableColumnVisibility={false}
            server={{
              page,
              pageSize,
              total: subs.data?.meta.total ?? 0,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s);
                setPage(1);
              },
              search,
              onSearchChange,
            }}
            toolbarActions={
              <Select
                value={status || 'all'}
                onValueChange={(v) => {
                  setStatus(v && v !== 'all' ? (v as SubscriptionStatus) : '');
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[130px] text-xs capitalize">
                  <SelectValue>{(v: string | null) => (v && v !== 'all' ? v : 'All statuses')}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {SUBSCRIPTION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        )}
      </CardContent>
      <AssignAddonDialog open={assignOpen} onOpenChange={setAssignOpen} />
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Remove this subscription?"
        description={removing ? `${removing.addonName} for ${removing.customerName}` : undefined}
        confirmLabel="Remove"
        destructive
        onConfirm={() =>
          removing &&
          remove.mutate(removing.id, {
            onSuccess: () => {
              toast.success('Subscription removed');
              setRemoving(null);
            },
          })
        }
      />
    </Card>
  );
}

export function AddonsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300); // debounce server search
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch, isFetching } = useAddons({
    page,
    pageSize: CARD_PAGE_SIZE,
    search,
    filters: {
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      active: statusFilter === 'all' ? undefined : statusFilter === 'active' ? 1 : 0,
    },
  });
  const save = useSaveCatalogItem('addons');
  const remove = useDeleteCatalogItem('addons');

  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Addon | null>(null);
  const [deleting, setDeleting] = useState<Addon | null>(null);

  const addons = data?.items ?? [];
  const stats = data?.summary;

  const openForm = (a: Addon | null) => {
    setEditing(a);
    setFormOpen(true);
  };

  const toggleStatus = (a: Addon) =>
    save.mutate(
      { id: a.id, body: { active: !a.active } },
      {
        onSuccess: () => {
          toast.success(`"${a.name}" ${a.active ? 'deactivated' : 'activated'}`);
          setSelectedAddon(null);
        },
        onError: (err) => handleApiError(err),
      },
    );

  const resetFilters = () => {
    setSearchInput('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  if (isLoading) return <CardGridSkeleton />;
  if (isError || !stats) {
    return <EmptyState title="Failed to load add-ons" description={error?.message} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const kpis: { label: string; value: React.ReactNode; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
    { label: 'Total Add-ons', value: stats.total, icon: Layers, tone: 'purple' },
    { label: 'Active', value: stats.active, icon: CheckCircle2, tone: 'emerald' },
    { label: 'OTT Passes', value: stats.byCategory.ott, icon: Film, tone: 'purple' },
    { label: 'IPTV / STB', value: stats.byCategory.iptv, icon: Tv, tone: 'blue' },
    { label: 'Static IPs', value: stats.byCategory.static_ip, icon: Globe, tone: 'emerald' },
    { label: 'Avg. Price', value: `৳${Math.round(stats.avgPrice).toLocaleString()}`, icon: DollarSign, tone: 'amber' },
  ];
  const toneClass: Record<string, string> = {
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="VAS & Add-on Products"
        subtitle="Manage sellable OTT subscriptions, IPTV channel packages, public static IPs, and hardware leases."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Addons & VAS' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs border-border/80 hover:bg-accent gap-1.5">
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => openForm(null)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              New Add-on
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label} className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{k.label}</span>
                <div className={cn('p-2 rounded-lg border', toneClass[k.tone])}>
                  <k.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-foreground">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search add-ons by title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter((v as CategoryFilter) || 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] h-9 text-xs bg-background/80">
              <SelectValue>{(v: string | null) => (v && v !== 'all' ? categoryConfig[v as AddonCategory].label : 'All Categories')}</SelectValue>
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Categories</SelectItem>
              {ADDON_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{categoryConfig[c].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter((v as StatusFilter) || 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs bg-background/80">
              <SelectValue>{(v: string | null) => (v === 'active' ? 'Active Only' : v === 'inactive' ? 'Disabled Only' : 'All Status')}</SelectValue>
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Disabled Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {addons.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-10 w-10 text-muted-foreground" />}
          title={search || categoryFilter !== 'all' || statusFilter !== 'all' ? 'No add-on products match' : 'No add-on products yet'}
          description="Create a catalog add-on, or clear the filters."
          actionLabel="Clear Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity', isFetching && 'opacity-60')}>
          {addons.map((addon) => {
            const cfg = categoryConfig[addon.category];
            const Icon = cfg.icon;
            return (
              <Card
                key={addon.id}
                className={cn(
                  'group relative border border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card/90 transition-all duration-200 overflow-hidden cursor-pointer shadow-sm',
                  !addon.active && 'opacity-65',
                )}
                onClick={() => setSelectedAddon(addon)}
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className={cn('p-2.5 rounded-xl border', cfg.bg, cfg.color, cfg.border)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5',
                          addon.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
                        )}
                      >
                        {addon.active ? 'Active' : 'Disabled'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none"
                          aria-label="Add-on actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedAddon(addon); }}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> Inspect Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openForm(addon); }}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleStatus(addon); }}>
                            <Sliders className="h-3.5 w-3.5 mr-2" /> {addon.active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-400" onClick={(e) => { e.stopPropagation(); setDeleting(addon); }}>
                            <X className="h-3.5 w-3.5 mr-2" /> Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">#{addon.id}</span>
                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{addon.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cfg.label} · {addon.activeSubscriptions} active subscriber{addon.activeSubscriptions === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase">Retail Price</span>
                      <p className="text-lg font-bold font-mono text-foreground">
                        ৳{addon.price.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground">{addon.billingType === 'monthly' ? '/mo' : ' once'}</span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary group-hover:translate-x-1 transition-transform p-0 h-auto font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAddon(addon);
                      }}
                    >
                      Inspect <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {(data?.meta.total ?? 0) > CARD_PAGE_SIZE && (
        <TablePagination
          currentPage={page}
          pageSize={CARD_PAGE_SIZE}
          pageSizeOptions={[CARD_PAGE_SIZE]}
          totalItems={data?.meta.total ?? 0}
          onPageChange={setPage}
          onPageSizeChange={() => setPage(1)}
        />
      )}

      <SubscriptionsCard />

      {/* Inspector Drawer */}
      <Sheet open={!!selectedAddon} onOpenChange={(open) => !open && setSelectedAddon(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full sm:max-w-md overflow-y-auto">
          {selectedAddon && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">#{selectedAddon.id}</Badge>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px]', selectedAddon.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20')}
                  >
                    {selectedAddon.active ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedAddon.name}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">{selectedAddon.description || 'No description'}</SheetDescription>
              </SheetHeader>
              <Card className="border border-border/70 bg-muted/20 p-4">
                <div className="space-y-3">
                  {[
                    ['Category', categoryConfig[selectedAddon.category].label],
                    ['Price', `৳${selectedAddon.price.toLocaleString()}`],
                    ['Billing', billingLabel(selectedAddon.billingType)],
                    ['Active Subscriptions', String(selectedAddon.activeSubscriptions)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 font-semibold text-xs" disabled={save.isPending} onClick={() => toggleStatus(selectedAddon)}>
                  {selectedAddon.active ? 'Deactivate Product' : 'Activate Product'}
                </Button>
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    openForm(selectedAddon);
                    setSelectedAddon(null);
                  }}
                >
                  Edit
                </Button>
                <Button variant="outline" className="text-xs" onClick={() => setSelectedAddon(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AddonFormDialog addon={editing} open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'add-on'}?`}
        description="Only add-ons that were never assigned can be deleted; deactivate it otherwise."
        confirmLabel="Delete"
        destructive
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Add-on deleted');
              setDeleting(null);
            },
          })
        }
      />
    </div>
  );
}

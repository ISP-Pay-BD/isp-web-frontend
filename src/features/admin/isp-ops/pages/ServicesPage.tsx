'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Boxes,
  Search,
  Plus,
  Home,
  Wrench,
  Truck,
  Settings2,
  ArrowRight,
  RefreshCw,
  X,
  MoreVertical,
  Eye,
  Pencil,
  Sliders,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { CardGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TablePagination } from '@/components/shared/TablePagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { useDeleteCatalogItem, useSaveCatalogItem, useServiceCatalog } from '../hooks/use-catalog';
import { SERVICE_CATEGORIES, type CatalogService, type ServiceCategory } from '../catalog.types';

const CARD_PAGE_SIZE = 12;

const categoryConfig: Record<ServiceCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
  installation: { label: 'Installation', icon: Home, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  relocation: { label: 'Relocation', icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  repair: { label: 'Repair', icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  maintenance: { label: 'Maintenance', icon: Settings2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  other: { label: 'Other', icon: Boxes, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

interface ServiceForm {
  name: string;
  code: string;
  category: ServiceCategory;
  price: string;
  description: string;
  active: boolean;
}

const toForm = (s?: CatalogService | null): ServiceForm => ({
  name: s?.name ?? '',
  code: s?.code ?? '',
  category: s?.category ?? 'installation',
  price: s ? String(s.price) : '',
  description: s?.description ?? '',
  active: s?.active ?? true,
});

function ServiceFormDialog({ service, open, onOpenChange }: { service: CatalogService | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const save = useSaveCatalogItem('service-catalog');
  const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors } } = useForm<ServiceForm>({
    defaultValues: toForm(service),
  });
  useEffect(() => {
    if (open) reset(toForm(service));
  }, [open, service, reset]);
  const category = watch('category');

  const onSubmit = (v: ServiceForm) =>
    save.mutate(
      { id: service?.id, body: { name: v.name, code: v.code, category: v.category, price: Number(v.price), description: v.description, active: v.active } },
      {
        onSuccess: () => {
          toast.success(service ? 'Service updated' : `Service "${v.name}" created`);
          onOpenChange(false);
        },
        onError: (err) => handleApiError(err, setError),
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> {service ? 'Edit Service' : 'Add Service'}</DialogTitle>
          <DialogDescription className="text-xs">A chargeable one-off service such as installation, relocation or repair.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="svc-name" className="text-xs font-semibold text-muted-foreground">Service Name *</Label>
            <Input id="svc-name" className="h-9 text-xs" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="svc-code" className="text-xs font-semibold text-muted-foreground">Short Code</Label>
              <Input
                id="svc-code"
                className="h-9 text-xs font-mono uppercase"
                {...register('code', { setValueAs: (v: string) => v.toUpperCase() })}
              />
              {errors.code && <p className="text-[11px] text-destructive">{errors.code.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Category *</Label>
              <Select value={category} onValueChange={(v) => v && setValue('category', v as ServiceCategory)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue>{(v: string | null) => categoryConfig[(v ?? 'other') as ServiceCategory]?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {SERVICE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{categoryConfig[c].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svc-price" className="text-xs font-semibold text-muted-foreground">Price (BDT) *</Label>
            <Input id="svc-price" type="number" min={0} step="0.01" className="h-9 text-xs font-mono" {...register('price', { required: 'Price is required' })} />
            {errors.price && <p className="text-[11px] text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svc-desc" className="text-xs font-semibold text-muted-foreground">Description</Label>
            <Input id="svc-desc" className="h-9 text-xs" {...register('description')} />
            {errors.description && <p className="text-[11px] text-destructive">{errors.description.message}</p>}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" {...register('active')} />
            Active — offered to customers
          </label>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-xs">Cancel</Button>
            <Button type="submit" disabled={save.isPending} className="text-xs font-semibold">{service ? 'Save Changes' : 'Create Service'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ServicesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | ServiceCategory>('all');

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300); // debounce server search
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch, isFetching } = useServiceCatalog({
    page,
    pageSize: CARD_PAGE_SIZE,
    search,
    filters: { category: category === 'all' ? undefined : category },
  });
  const save = useSaveCatalogItem('service-catalog');
  const remove = useDeleteCatalogItem('service-catalog');

  const [selected, setSelected] = useState<CatalogService | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogService | null>(null);
  const [deleting, setDeleting] = useState<CatalogService | null>(null);

  const services = data?.items ?? [];
  const stats = data?.summary;

  const openForm = (s: CatalogService | null) => {
    setEditing(s);
    setFormOpen(true);
  };

  const toggleStatus = (s: CatalogService) =>
    save.mutate(
      { id: s.id, body: { active: !s.active } },
      {
        onSuccess: () => {
          toast.success(`"${s.name}" ${s.active ? 'deactivated' : 'activated'}`);
          setSelected(null);
        },
        onError: (err) => handleApiError(err),
      },
    );

  if (isLoading) return <CardGridSkeleton />;
  if (isError || !stats) {
    return <EmptyState title="Failed to load services" description={error?.message} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const kpis = [
    { label: 'Services', value: stats.total, sub: `${stats.active} active`, icon: Boxes, tone: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { label: 'Installation', value: stats.byCategory.installation, sub: 'catalog entries', icon: Home, tone: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { label: 'Repair & Relocation', value: stats.byCategory.repair + stats.byCategory.relocation, sub: 'catalog entries', icon: Wrench, tone: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { label: 'Avg. Price', value: `৳${Math.round(stats.avgPrice).toLocaleString()}`, sub: 'across the catalog', icon: DollarSign, tone: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Service Catalog"
        subtitle="One-off chargeable services — installation, relocation, repair and maintenance — with their prices."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Services' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs border-border/80 hover:bg-accent gap-1.5">
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => openForm(null)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              New Service
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{k.label}</span>
                <div className={cn('p-2 rounded-lg border', k.tone)}>
                  <k.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-foreground">{k.value}</div>
              <div className="mt-2 text-[11px] text-muted-foreground">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services by name, code or description..."
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
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory((v as 'all' | ServiceCategory) || 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] h-9 text-xs bg-background/80">
            <SelectValue>{(v: string | null) => (v && v !== 'all' ? categoryConfig[v as ServiceCategory].label : 'All Categories')}</SelectValue>
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="all">All Categories</SelectItem>
            {SERVICE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{categoryConfig[c].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={<Boxes className="h-10 w-10 text-muted-foreground" />}
          title={search || category !== 'all' ? 'No services match your filters' : 'No services in the catalog yet'}
          description="Add a chargeable service, or clear the filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchInput('');
            setCategory('all');
          }}
        />
      ) : (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity', isFetching && 'opacity-60')}>
          {services.map((service) => {
            const cfg = categoryConfig[service.category];
            const Icon = cfg.icon;
            return (
              <Card
                key={service.id}
                className={cn(
                  'group relative border border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card/90 transition duration-200 overflow-hidden cursor-pointer shadow-sm',
                  !service.active && 'opacity-65',
                )}
                onClick={() => setSelected(service)}
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={cn('p-2.5 rounded-xl border', cfg.bg, cfg.color, cfg.border)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {service.code && (
                        <Badge variant="outline" className="font-mono text-[10px] bg-muted/40 border-border/60 text-muted-foreground">{service.code}</Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none"
                          aria-label="Service actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelected(service); }}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> Inspect Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openForm(service); }}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleStatus(service); }}>
                            <Sliders className="h-3.5 w-3.5 mr-2" /> {service.active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-400" onClick={(e) => { e.stopPropagation(); setDeleting(service); }}>
                            <X className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{cfg.label}</span>
                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{service.name}</h4>
                    {service.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>}
                  </div>
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase">Price</span>
                      <p className="text-lg font-bold font-mono text-foreground">৳{service.price.toLocaleString()}</p>
                    </div>
                    <span className={cn('text-[10px] flex items-center gap-1', service.active ? 'text-emerald-400' : 'text-muted-foreground')}>
                      <CheckCircle2 className="h-3 w-3" /> {service.active ? 'Active' : 'Disabled'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary group-hover:translate-x-1 transition-transform p-0 h-auto font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(service);
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

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  {selected.code && (
                    <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">{selected.code}</Badge>
                  )}
                  <Badge variant="outline" className="font-mono text-[10px] bg-muted/40 border-border/60 text-muted-foreground">#{selected.id}</Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selected.name}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">{selected.description || 'No description'}</SheetDescription>
              </SheetHeader>
              <Card className="border border-border/70 bg-muted/20 p-4 space-y-3">
                {[
                  ['Category', categoryConfig[selected.category].label],
                  ['Price', `৳${selected.price.toLocaleString()}`],
                  ['Status', selected.active ? 'Active' : 'Disabled'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground font-mono">{value}</span>
                  </div>
                ))}
              </Card>
              <div className="pt-4 flex gap-2">
                <Button className="flex-1 font-semibold text-xs" disabled={save.isPending} onClick={() => toggleStatus(selected)}>
                  {selected.active ? 'Deactivate Service' : 'Activate Service'}
                </Button>
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    openForm(selected);
                    setSelected(null);
                  }}
                >
                  Edit
                </Button>
                <Button variant="outline" className="text-xs" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ServiceFormDialog service={editing} open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'service'}?`}
        description="The service is removed from the catalog."
        confirmLabel="Delete"
        destructive
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Service deleted');
              setDeleting(null);
            },
          })
        }
      />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Smartphone,
  Search,
  Plus,
  CheckCircle2,
  MoreVertical,
  RefreshCw,
  X,
  ArrowRight,
  DollarSign,
  Eye,
  Pencil,
  Sliders,
  Signal,
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
import { useTranslations } from '@/i18n/locale-context';
import { useDeleteCatalogItem, useMobilePlans, useSaveCatalogItem } from '../hooks/use-catalog';
import type { MobilePlan } from '../catalog.types';

import { formatBdtWithSymbol, formatCount } from '@/lib/format';
type StatusFilter = 'all' | 'active' | 'inactive';

const CARD_PAGE_SIZE = 12;

type Translate = ReturnType<typeof useTranslations>;

const perGb = (t: Translate, p: MobilePlan) =>
  p.dataGb > 0 ? `৳${(p.price / p.dataGb).toFixed(2)}/GB` : t('admin.ops.mobilePlans.voiceOnly', 'Voice only');

interface PlanForm {
  name: string;
  operator: string;
  data_gb: string;
  minutes: string;
  validity_days: string;
  price: string;
  active: boolean;
}

const toForm = (p?: MobilePlan | null): PlanForm => ({
  name: p?.name ?? '',
  operator: p?.operator ?? '',
  data_gb: p ? String(p.dataGb) : '',
  minutes: p ? String(p.minutes) : '',
  validity_days: p ? String(p.validityDays) : '',
  price: p ? String(p.price) : '',
  active: p?.active ?? true,
});

function PlanFormDialog({ plan, open, onOpenChange }: { plan: MobilePlan | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const t = useTranslations();
  const save = useSaveCatalogItem('mobile-plans');
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<PlanForm>({ defaultValues: toForm(plan) });
  useEffect(() => {
    if (open) reset(toForm(plan));
  }, [open, plan, reset]);

  const onSubmit = (v: PlanForm) =>
    save.mutate(
      {
        id: plan?.id,
        body: {
          name: v.name,
          operator: v.operator,
          data_gb: v.data_gb === '' ? 0 : Number(v.data_gb),
          minutes: v.minutes === '' ? 0 : Number(v.minutes),
          validity_days: Number(v.validity_days),
          price: Number(v.price),
          active: v.active,
        },
      },
      {
        onSuccess: () => {
          toast.success(plan ? t('admin.ops.mobilePlans.updated', 'Plan updated') : t('admin.ops.mobilePlans.created', 'Plan "{name}" created', { name: v.name }));
          onOpenChange(false);
        },
        onError: (err) => handleApiError(err, setError),
      },
    );

  const num = (name: keyof PlanForm, label: string, required = false, step = '1') => (
    <div className="space-y-1.5">
      <Label htmlFor={`plan-${name}`} className="text-xs font-semibold text-muted-foreground">
        {label}
        {required && ' *'}
      </Label>
      <Input
        id={`plan-${name}`}
        type="number"
        min={0}
        step={step}
        className="h-9 text-xs font-mono"
        {...register(name, required ? { required: t('admin.ops.mobilePlans.fieldRequired', '{field} is required', { field: label }) } : {})}
      />
      {errors[name] && <p className="text-xs text-destructive">{String(errors[name]?.message)}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> {plan ? t('admin.ops.mobilePlans.editTitle', 'Edit Mobile Plan') : t('admin.ops.mobilePlans.createTitle', 'Create Mobile Plan')}</DialogTitle>
          <DialogDescription className="text-xs">{t('admin.ops.mobilePlans.formDesc', 'Operator bundle with data quota, voice minutes, validity and price.')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-name" className="text-xs font-semibold text-muted-foreground">{t('admin.ops.mobilePlans.fieldTitle', 'Plan Title *')}</Label>
              <Input id="plan-name" className="h-9 text-xs" {...register('name', { required: t('admin.ops.mobilePlans.titleRequired', 'Title is required') })} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-operator" className="text-xs font-semibold text-muted-foreground">{t('admin.ops.mobilePlans.fieldOperator', 'Operator *')}</Label>
              <Input id="plan-operator" className="h-9 text-xs" {...register('operator', { required: t('admin.ops.mobilePlans.operatorRequired', 'Operator is required') })} />
              {errors.operator && <p className="text-xs text-destructive">{errors.operator.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {num('data_gb', t('admin.ops.mobilePlans.fieldData', 'Data (GB)'), false, '0.01')}
            {num('minutes', t('admin.ops.mobilePlans.fieldMinutes', 'Voice Minutes'))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {num('validity_days', t('admin.ops.mobilePlans.fieldValidity', 'Validity (Days)'), true)}
            {num('price', t('admin.ops.mobilePlans.fieldPrice', 'Price (BDT)'), true, '0.01')}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" {...register('active')} />
            {t('admin.ops.mobilePlans.fieldActive', 'Active — offered for sale')}
          </label>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-xs">{t('common.cancel', 'Cancel')}</Button>
            <Button type="submit" disabled={save.isPending} className="text-xs font-semibold">{plan ? t('admin.ops.mobilePlans.saveChanges', 'Save Changes') : t('admin.ops.mobilePlans.createTitle', 'Create Mobile Plan')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MobilePlansPage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [operator, setOperator] = useState('all');
  const [validity, setValidity] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300); // debounce server search
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch, isFetching } = useMobilePlans({
    page,
    pageSize: CARD_PAGE_SIZE,
    search,
    filters: {
      operator: operator === 'all' ? undefined : operator,
      validity_days: validity === 'all' ? undefined : validity,
      active: statusFilter === 'all' ? undefined : statusFilter === 'active' ? 1 : 0,
    },
  });
  const save = useSaveCatalogItem('mobile-plans');
  const remove = useDeleteCatalogItem('mobile-plans');

  const [selectedPlan, setSelectedPlan] = useState<MobilePlan | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MobilePlan | null>(null);
  const [deleting, setDeleting] = useState<MobilePlan | null>(null);

  const plans = data?.items ?? [];
  const stats = data?.summary;

  const openForm = (p: MobilePlan | null) => {
    setEditing(p);
    setFormOpen(true);
  };

  const toggleStatus = (p: MobilePlan) =>
    save.mutate(
      { id: p.id, body: { active: !p.active } },
      {
        onSuccess: () => {
          toast.success(
            p.active
              ? t('admin.ops.mobilePlans.disabledToast', 'Plan "{name}" disabled', { name: p.name })
              : t('admin.ops.mobilePlans.activatedToast', 'Plan "{name}" activated', { name: p.name }),
          );
          setSelectedPlan(null);
        },
        onError: (err) => handleApiError(err),
      },
    );

  const resetFilters = () => {
    setSearchInput('');
    setOperator('all');
    setValidity('all');
    setStatusFilter('all');
    setPage(1);
  };

  if (isLoading) return <CardGridSkeleton />;
  if (isError || !stats) {
    return <EmptyState variant="error" title={t('admin.ops.mobilePlans.loadFailed', 'Failed to load mobile plans')} description={error?.message} actionLabel={t('common.retry', 'Retry')} onAction={() => refetch()} />;
  }

  const kpis = [
    { label: t('admin.ops.mobilePlans.kpiTotal', 'Total Plans'), value: formatCount(stats.total), icon: Smartphone, tone: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { label: t('admin.ops.mobilePlans.kpiActive', 'Active Catalog'), value: formatCount(stats.active), icon: CheckCircle2, tone: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { label: t('admin.ops.mobilePlans.kpiMaxData', 'Max Data Cap'), value: `${stats.maxDataGb} GB`, icon: Signal, tone: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { label: t('admin.ops.mobilePlans.kpiAvg', 'Avg. Tariff'), value: `${formatBdtWithSymbol(Math.round(stats.avgPrice))}`, icon: DollarSign, tone: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={t('admin.ops.mobilePlans.title', 'Mobile Plans')}
        subtitle={t('admin.ops.mobilePlans.subtitle', 'Operator data and voice bundles you sell: quota, minutes, validity and price.')}
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Mobile Plans' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5">
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              {t('admin.ops.mobilePlans.refresh', 'Refresh')}
            </Button>
            <Button size="sm" onClick={() => openForm(null)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              {t('admin.ops.mobilePlans.newPlan', 'New Plan')}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl border', k.tone)}>
                <k.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <h3 className="text-xl font-bold font-mono text-foreground">{k.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.ops.mobilePlans.search', 'Search plans by name or operator...')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9 text-xs bg-background/80"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground" aria-label={t('common.table.clearSearch', 'Clear search')}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={operator} onValueChange={(v) => { setOperator(v ? String(v) : 'all'); setPage(1); }}>
              <SelectTrigger aria-label={t('admin.ops.mobilePlans.filterOperator', 'Filter by operator')} className="min-w-[150px] h-9 text-xs bg-background/80 border-border/80">
                <SelectValue>{(v: string | null) => (v && v !== 'all' ? v : t('admin.ops.mobilePlans.allOperators', 'All Operators'))}</SelectValue>
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">{t('admin.ops.mobilePlans.allOperators', 'All Operators')}</SelectItem>
                {stats.operators.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={validity} onValueChange={(v) => { setValidity(v ? String(v) : 'all'); setPage(1); }}>
              <SelectTrigger aria-label={t('admin.ops.mobilePlans.filterValidity', 'Filter by validity')} className="min-w-[150px] h-9 text-xs bg-background/80 border-border/80">
                <SelectValue>{(v: string | null) => (v && v !== 'all' ? t('admin.ops.mobilePlans.days', '{n} Days', { n: v }) : t('admin.ops.mobilePlans.allValidities', 'All Validities'))}</SelectValue>
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">{t('admin.ops.mobilePlans.allValidities', 'All Validities')}</SelectItem>
                {stats.validities.map((d) => (
                  <SelectItem key={d} value={String(d)}>{t('admin.ops.mobilePlans.days', '{n} Days', { n: d })}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter((v as StatusFilter) || 'all'); setPage(1); }}>
              <SelectTrigger aria-label={t('admin.ops.mobilePlans.filterStatus', 'Filter by status')} className="min-w-[140px] h-9 text-xs bg-background/80 border-border/80">
                <SelectValue>{(v: string | null) => (v === 'active' ? t('admin.ops.mobilePlans.activeOnly', 'Active Only') : v === 'inactive' ? t('admin.ops.mobilePlans.disabledOnly', 'Disabled Only') : t('admin.ops.mobilePlans.allStatus', 'All Status'))}</SelectValue>
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">{t('admin.ops.mobilePlans.allStatus', 'All Status')}</SelectItem>
                <SelectItem value="active">{t('admin.ops.mobilePlans.activeOnly', 'Active Only')}</SelectItem>
                <SelectItem value="inactive">{t('admin.ops.mobilePlans.disabledOnly', 'Disabled Only')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={<Smartphone className="h-10 w-10 text-muted-foreground" />}
          title={search || operator !== 'all' || validity !== 'all' || statusFilter !== 'all' ? t('admin.ops.mobilePlans.noMatch', 'No mobile plans match') : t('admin.ops.mobilePlans.empty', 'No mobile plans yet')}
          description={t('admin.ops.mobilePlans.emptyDesc', 'Create a plan, or reset the filters.')}
          actionLabel={t('admin.ops.mobilePlans.resetFilters', 'Reset Filters')}
          onAction={resetFilters}
        />
      ) : (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity', isFetching && 'opacity-60')}>
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'group relative border border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card/90 transition duration-200 overflow-hidden cursor-pointer shadow-sm',
                !plan.active && 'opacity-65',
              )}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Signal className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      tone={plan.active ? 'success' : 'neutral'} className="text-xs font-semibold px-2 py-0.5"
                    >
                      {plan.active ? t('status.active', 'Active') : t('status.disabled', 'Disabled')}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none"
                        aria-label={t('admin.ops.mobilePlans.planActions', 'Plan actions')}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); }}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> {t('admin.ops.mobilePlans.inspectDetails', 'Inspect Details')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openForm(plan); }}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> {t('common.edit', 'Edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleStatus(plan); }}>
                          <Sliders className="h-3.5 w-3.5 mr-2" /> {plan.active ? t('admin.ops.mobilePlans.disable', 'Disable') : t('admin.ops.mobilePlans.activate', 'Activate')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-rose-400" onClick={(e) => { e.stopPropagation(); setDeleting(plan); }}>
                          <X className="h-3.5 w-3.5 mr-2" /> {t('common.delete', 'Delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{plan.operator}</span>
                  <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{plan.name}</h4>
                </div>
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{t('admin.ops.mobilePlans.cardData', 'Data')}</p>
                    <p className="text-sm font-bold font-mono text-primary">{plan.dataGb} GB</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{t('admin.ops.mobilePlans.cardMinutes', 'Minutes')}</p>
                    <p className="text-sm font-bold font-mono text-foreground">{formatCount(plan.minutes)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{t('admin.ops.mobilePlans.cardValidity', 'Validity')}</p>
                    <p className="text-sm font-bold font-mono text-foreground">{t('admin.ops.mobilePlans.daysShort', '{n}d', { n: formatCount(plan.validityDays) })}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">{perGb(t, plan)}</span>
                    <p className="text-lg font-bold font-mono text-foreground">{formatBdtWithSymbol(plan.price)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary group-hover:translate-x-1 transition-transform p-0 h-auto font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan);
                    }}
                  >
                    {t('admin.ops.mobilePlans.inspect', 'Inspect')} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
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

      <Sheet open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full sm:max-w-md overflow-y-auto">
          {selectedPlan && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">{selectedPlan.operator}</Badge>
                  <Badge
                    variant="outline"
                    tone={selectedPlan.active ? 'success' : 'neutral'} className="text-xs"
                  >
                    {selectedPlan.active ? t('status.active', 'Active') : t('status.disabled', 'Disabled')}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedPlan.name}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">{t('admin.ops.mobilePlans.planNo', 'Plan #{id}', { id: selectedPlan.id })}</SheetDescription>
              </SheetHeader>
              <Card className="border border-border/70 bg-muted/20 p-4 space-y-3">
                {[
                  [t('admin.ops.mobilePlans.detailQuota', 'Data Quota'), `${selectedPlan.dataGb} GB`],
                  [t('admin.ops.mobilePlans.fieldMinutes', 'Voice Minutes'), formatCount(selectedPlan.minutes)],
                  [t('admin.ops.mobilePlans.cardValidity', 'Validity'), t('admin.ops.mobilePlans.daysLower', '{n} days', { n: formatCount(selectedPlan.validityDays) })],
                  [t('admin.ops.mobilePlans.detailPrice', 'Price'), `${formatBdtWithSymbol(selectedPlan.price)}`],
                  [t('admin.ops.mobilePlans.detailRate', 'Effective Rate'), perGb(t, selectedPlan)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground font-mono">{value}</span>
                  </div>
                ))}
              </Card>
              <div className="pt-4 flex gap-2">
                <Button className="flex-1 font-semibold text-xs" disabled={save.isPending} onClick={() => toggleStatus(selectedPlan)}>
                  {selectedPlan.active ? t('admin.ops.mobilePlans.disablePlan', 'Disable Plan') : t('admin.ops.mobilePlans.activatePlan', 'Activate Plan')}
                </Button>
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    openForm(selectedPlan);
                    setSelectedPlan(null);
                  }}
                >
                  {t('common.edit', 'Edit')}
                </Button>
                <Button variant="outline" className="text-xs" onClick={() => setSelectedPlan(null)}>{t('common.close', 'Close')}</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <PlanFormDialog plan={editing} open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('admin.ops.mobilePlans.deleteTitle', 'Delete {name}?', { name: deleting?.name ?? t('admin.ops.mobilePlans.planFallback', 'plan') })}
        description={t('admin.ops.mobilePlans.deleteDesc', 'The plan is removed from the catalog.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success(t('admin.ops.mobilePlans.deleted', 'Plan deleted'));
              setDeleting(null);
            },
          })
        }
      />
    </div>
  );
}

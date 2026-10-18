'use client';

import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHero, PageContent } from '@/components/motion/PageHero';
import {
  Plus,
  MapPin,
  Edit,
  Trash2,
  Globe,
  Search,
  Filter,
  X,
  Building2,
  Users,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocale } from '@/i18n/locale-context';
import { useAreaMutations, useAreaSummary, useAreas, useSubAreas } from '../hooks/use-areas';
import type { ServiceArea, SubArea } from '../types';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { TablePagination } from '@/components/shared/TablePagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { handleApiError, errorMessage } from '@/lib/api/utils/error-handler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** Backend field names so server validation errors map onto the inputs. */
const areaSchema = z.object({
  area_name: z.string().trim().min(2, 'Name is required'),
  area_code: z.string().trim().min(1, 'Code is required').max(10, 'Up to 10 characters'),
  status: z.enum(['active', 'inactive']),
});
const subAreaSchema = areaSchema.extend({
  area_code: z.string().trim().min(1, 'Code is required').max(50, 'Up to 50 characters'),
});

type AreaFormValues = z.infer<typeof areaSchema>;

type StatusFilter = 'all' | 'active' | 'inactive';

const AREA_PAGE_SIZE = 25;

export function AreasPage() {
  const { t } = useLocale();
  const statusItems = { active: t('status.active', 'Active'), inactive: t('status.inactive', 'Inactive') };
  const [areaPage, setAreaPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const search = useDebouncedValue(searchQuery.trim());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const areaParams = { page: areaPage, perPage: AREA_PAGE_SIZE, search, status: statusFilter };

  const { data, isLoading, isError, error, refetch } = useAreas(areaParams);
  const summaryQuery = useAreaSummary();
  const m = useAreaMutations();

  const [pickedAreaId, setPickedAreaId] = useState<string | null>(null);

  // Dialogs
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [editArea, setEditArea] = useState<ServiceArea | null>(null);
  const [deleteArea, setDeleteArea] = useState<ServiceArea | null>(null);

  const [subAreaDialogOpen, setSubAreaDialogOpen] = useState(false);
  const [editingSubArea, setEditingSubArea] = useState<SubArea | null>(null);
  const [deleteSubArea, setDeleteSubArea] = useState<SubArea | null>(null);

  const areaForm = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: { area_name: '', area_code: '', status: 'active' },
  });
  const subForm = useForm<AreaFormValues>({
    resolver: zodResolver(subAreaSchema),
    defaultValues: { area_name: '', area_code: '', status: 'active' },
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  // The picked area, else the first one on the page.
  const selectedArea = useMemo(
    () => items.find((a) => a.id === pickedAreaId) ?? items[0] ?? null,
    [items, pickedAreaId],
  );
  const selectedAreaId = selectedArea?.id ?? null;

  // Sub-area pagination (server side)
  const [subPage, setSubPage] = useState({ areaId: '', page: 1 });
  const [subPageSize, setSubPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const subCurrentPage = subPage.areaId === selectedAreaId ? subPage.page : 1;
  const subQuery = useSubAreas(selectedAreaId, subCurrentPage, subPageSize);
  const subareas = useMemo(() => subQuery.data?.items ?? [], [subQuery.data?.items]);
  const subTotal = subQuery.data?.meta.total ?? selectedArea?.subareaCount ?? 0;

  const summary = summaryQuery.data;
  const kpi = (n: number | undefined) => (summary ? n ?? 0 : '…');

  // Handlers for Area Modals
  const openCreateArea = () => {
    setEditArea(null);
    areaForm.reset({ area_name: '', area_code: '', status: 'active' });
    setAreaDialogOpen(true);
  };

  const openEditArea = (area: ServiceArea) => {
    setEditArea(area);
    areaForm.reset({ area_name: area.name, area_code: area.code, status: area.status });
    setAreaDialogOpen(true);
  };

  const onSubmitArea = async (values: AreaFormValues) => {
    try {
      if (editArea) {
        await m.update.mutateAsync({ id: editArea.id, body: values });
      } else {
        const created = await m.create.mutateAsync(values);
        if (created.id) setPickedAreaId(created.id);
      }
      setAreaDialogOpen(false);
    } catch (err) {
      handleApiError(err, areaForm.setError);
    }
  };

  // Handlers for SubArea Modals
  const openCreateSubArea = () => {
    setEditingSubArea(null);
    subForm.reset({ area_name: '', area_code: '', status: 'active' });
    setSubAreaDialogOpen(true);
  };

  const openEditSubArea = useCallback(
    (sub: SubArea) => {
      setEditingSubArea(sub);
      subForm.reset({ area_name: sub.name, area_code: sub.code, status: sub.status });
      setSubAreaDialogOpen(true);
    },
    [subForm],
  );

  const subColumns = useMemo<LegacyColumnDef<SubArea, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.areas.page.colSubName', 'Sub-area Name'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-muted p-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-foreground">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'code',
        header: t('admin.areas.page.colCode', 'Area Code'),
        cell: ({ row }) => (
          <span className="rounded border border-border/40 bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground">
            {row.original.code || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.customerPayments.list.colStatus', 'Status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Can menu="area" action="update">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 transition-colors hover:bg-primary/10 hover:text-primary"
                onClick={() => openEditSubArea(row.original)}
                title={t('admin.areas.page.editSub', 'Edit sub-area')}
                aria-label={t('admin.areas.page.editSub', 'Edit sub-area')}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Can>
            <Can menu="area" action="delete">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive transition-colors hover:bg-destructive/10"
                onClick={() => setDeleteSubArea(row.original)}
                title={t('admin.areas.page.deleteSub', 'Delete sub-area')}
                aria-label={t('admin.areas.page.deleteSub', 'Delete sub-area')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Can>
          </div>
        ),
      },
    ],
    [openEditSubArea, t],
  );

  const onSubmitSubArea = async (values: AreaFormValues) => {
    try {
      if (editingSubArea) {
        await m.updateSub.mutateAsync({ id: editingSubArea.id, body: values });
      } else if (selectedAreaId) {
        await m.createSub.mutateAsync({ areaId: selectedAreaId, body: values });
      }
      setSubAreaDialogOpen(false);
      setEditingSubArea(null);
    } catch (err) {
      handleApiError(err, subForm.setError);
    }
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.areas.page.loadFailed', 'Failed to load areas')}
        description={errorMessage(error, t('admin.areas.page.loadFailedHint', 'Could not fetch service areas.'))}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Page Hero */}
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Globe className="h-6 w-6" />
            </div>
            {t('admin.areas.page.title', 'Service Areas')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            {t('admin.areas.page.subtitle', 'Geographic coverage zones and their sub-areas used for customer assignment.')}
          </p>
        </div>
        <Can menu="area" action="create">
          <Button
            size="sm"
            onClick={openCreateArea}
            className="shadow-md font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition duration-200"
          >
            <Plus className="h-4 w-4" /> {t('admin.areas.page.newArea', 'New Area')}
          </Button>
        </Can>
      </PageHero>

      <PageContent className="space-y-6">
        {/* KPI Metric Strips (backend summary) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(
            [
              { label: t('admin.areas.page.kpiTotal', 'Total Areas'), value: kpi(summary?.totalAreas), unit: t('admin.areas.page.unitZones', 'zones'), icon: Globe, tone: 'bg-primary/10 text-primary', valueTone: '' },
              { label: t('admin.areas.page.kpiActive', 'Active Areas'), value: kpi(summary?.activeAreas), unit: t('admin.areas.page.unitOperational', 'operational'), icon: CheckCircle2, tone: 'bg-emerald-500/10 text-emerald-500', valueTone: 'text-emerald-600 dark:text-emerald-400' },
              { label: t('admin.areas.page.kpiSubareas', 'Total Sub-areas'), value: kpi(summary?.totalSubareas), unit: t('admin.areas.page.unitSectors', 'sectors'), icon: Layers, tone: 'bg-blue-500/10 text-blue-500', valueTone: 'text-blue-600 dark:text-blue-400' },
              { label: t('admin.areas.page.kpiWithout', 'Without Sub-areas'), value: kpi(summary?.areasWithoutSubareas), unit: t('admin.areas.page.unitPending', 'pending breakdown'), icon: AlertTriangle, tone: 'bg-amber-500/10 text-amber-500', valueTone: 'text-amber-600 dark:text-amber-400' },
            ] as const
          ).map((k) => (
            <Card key={k.label} className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm transition duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{k.label}</span>
                <div className={`p-2 rounded-lg ${k.tone}`}>
                  <k.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-bold tracking-tight tabular-nums ${k.valueTone}`}>{k.value}</span>
                <span className="text-xs text-muted-foreground">{k.unit}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Master-Detail 2-Pane Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANE: Areas Navigator List */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-3">
            <Card className="border-border/60 bg-card/90 shadow-sm overflow-hidden ring-1 ring-border/50">
              <div className="p-3.5 border-b border-border/60 bg-muted/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">{t('admin.areas.page.coverageZones', 'Coverage Zones')}</span>
                    <Badge variant="secondary" className="text-xs font-mono px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                      {data?.meta.total ?? 0}
                    </Badge>
                  </div>
                  <Can menu="area" action="create">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openCreateArea}
                      className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10 gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> {t('admin.areas.page.add', 'Add')}
                    </Button>
                  </Can>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder={t('admin.areas.page.searchPlaceholder', 'Search name or code...')}
                      aria-label={t('admin.areas.page.searchLabel', 'Search areas')}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setAreaPage(1);
                      }}
                      className="pl-8 pr-7 h-8 bg-background border-border/60 text-xs shadow-inner"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label={t('admin.customers.list.clearSearch', 'Clear search')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => {
                      setStatusFilter((v as StatusFilter) || 'all');
                      setAreaPage(1);
                    }}
                    items={{ all: t('admin.customers.list.pillAll', 'All'), ...statusItems }}
                  >
                    <SelectTrigger aria-label={t('admin.areas.page.filterStatus', 'Filter by status')} className="min-w-[100px] h-8 bg-background border-border/60 text-xs">
                      <Filter className="h-3 w-3 mr-1 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('admin.customers.list.pillAll', 'All')}</SelectItem>
                      <SelectItem value="active">{statusItems.active}</SelectItem>
                      <SelectItem value="inactive">{statusItems.inactive}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Area List Items */}
              <div className="divide-y divide-border/40 max-h-[620px] overflow-y-auto p-1.5 space-y-1">
                {items.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      {search || statusFilter !== 'all'
                        ? t('admin.areas.page.noMatch', 'No areas match the filter')
                        : t('admin.areas.page.noAreas', 'No service areas yet')}
                    </p>
                  </div>
                ) : (
                  items.map((area) => {
                    const isSelected = selectedAreaId === area.id;
                    return (
                      <div
                        key={area.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setPickedAreaId(area.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setPickedAreaId(area.id);
                          }
                        }}
                        className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition duration-200 text-left ${
                          isSelected
                            ? 'bg-primary/10 border border-primary/30 shadow-sm text-foreground'
                            : 'hover:bg-muted/40 border border-transparent text-foreground/80 hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`p-2 rounded-lg transition-colors shrink-0 ${
                              isSelected
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                            }`}
                          >
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-semibold text-sm truncate ${isSelected ? 'text-primary' : ''}`}>
                                {area.name}
                              </span>
                              <span
                                className={`h-1.5 w-1.5 rounded-full shrink-0 ${area.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`}
                              />
                            </div>
                            <div className="text-xs font-mono text-muted-foreground truncate">
                              {t('admin.areas.page.customersLine', '{code} · {n} customers', { code: area.code || '—', n: area.totalCustomers })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <Badge
                            variant={isSelected ? 'default' : 'secondary'}
                            tone={isSelected ? undefined : 'neutral'} className="text-xs font-mono px-2 py-0.5"
                          >
                            {t('admin.areas.page.subBadge', '{n} sub', { n: area.subareaCount })}
                          </Badge>
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${
                              isSelected ? 'text-primary translate-x-0.5' : 'text-muted-foreground/50 opacity-0 group-hover:opacity-100'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {(data?.meta.totalPages ?? 1) > 1 && (
                <TablePagination
                  currentPage={areaPage}
                  pageSize={AREA_PAGE_SIZE}
                  totalItems={data?.meta.total ?? 0}
                  onPageChange={setAreaPage}
                  onPageSizeChange={() => undefined}
                  pageSizeOptions={[AREA_PAGE_SIZE]}
                />
              )}
            </Card>
          </div>

          {/* RIGHT PANE: Selected Area Detail & Sub-areas Table */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-4">
            {selectedArea ? (
              <>
                {/* Active Area Banner Card */}
                <Card className="border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-sm ring-1 ring-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-md">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-xl font-bold tracking-tight text-foreground">{selectedArea.name}</h2>
                          <Badge variant="outline" className="font-mono text-xs bg-background/80 border-border/80 text-muted-foreground">
                            {selectedArea.code || `#${selectedArea.id}`}
                          </Badge>
                          {selectedArea.status === 'active' ? (
                            <Badge variant="outline" tone="success" className="text-xs font-medium gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                              {t('admin.areas.page.activeZone', 'Active Zone')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted text-muted-foreground border-border/60 text-xs font-medium">
                              {statusItems.inactive}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                          <span>
                            <strong className="text-foreground">{selectedArea.subareaCount}</strong> {t('admin.areas.page.unitSubareas', 'sub-areas')}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <strong className="text-foreground">{selectedArea.totalCustomers}</strong> {t('admin.areas.page.unitCustomers', 'customers')} (
                            {t('admin.areas.page.activeCount', '{n} active', { n: selectedArea.activeCustomers })})
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Can menu="area" action="update">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditArea(selectedArea)}
                          className="h-8 gap-1.5 text-xs font-medium border-border/80 hover:bg-muted/50"
                        >
                          <Edit className="h-3.5 w-3.5" /> {t('admin.areas.page.editArea', 'Edit Area')}
                        </Button>
                      </Can>
                      <Can menu="area" action="delete">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteArea(selectedArea)}
                          className="h-8 gap-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> {t('common.delete', 'Delete')}
                        </Button>
                      </Can>
                    </div>
                  </div>
                </Card>

                {/* Sub-areas Management Section */}
                <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/50 overflow-hidden">
                  <div className="p-4 border-b border-border/60 bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          {t('admin.areas.page.subareasIn', 'Sub-areas in {name}', { name: selectedArea.name })}
                          <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary border border-primary/20">
                            {subTotal}
                          </Badge>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t('admin.areas.page.subareasHint', 'Sectors, streets or distribution blocks under this coverage zone.')}
                        </p>
                      </div>
                    </div>

                    <Can menu="area" action="create">
                      <Button
                        size="sm"
                        onClick={openCreateSubArea}
                        className="h-8 text-xs font-semibold gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="h-3.5 w-3.5" /> {t('admin.areas.page.addSub', 'Add Sub-area')}
                      </Button>
                    </Can>
                  </div>

                  {subQuery.isLoading ? (
                    <div className="p-6">
                      <PageSkeleton variant="table" rows={3} />
                    </div>
                  ) : subQuery.isError ? (
                    <div className="p-6">
                      <EmptyState variant="error"
                        title={t('admin.areas.page.subLoadFailed', 'Could not load sub-areas')}
                        description={errorMessage(subQuery.error)}
                        actionLabel={t('admin.customers.list.retry', 'Retry')}
                        onAction={() => subQuery.refetch()}
                      />
                    </div>
                  ) : subareas.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground border border-border/60">
                          <Layers className="h-6 w-6 opacity-60" />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">{t('admin.areas.page.noSubs', 'No sub-areas configured')}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t('admin.areas.page.noSubsHint', 'Break down {name} into sectors, blocks, or wards.', { name: selectedArea.name })}
                        </p>
                        <Can menu="area" action="create">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={openCreateSubArea}
                            className="mt-2 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <Plus className="h-3.5 w-3.5" /> {t('admin.areas.page.createFirstSub', 'Create First Sub-area')}
                          </Button>
                        </Can>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3">
                      <DataTable
                        key={selectedAreaId}
                        className="space-y-0"
                        columns={subColumns}
                        data={subareas}
                        getRowId={(sub) => sub.id}
                        enableColumnVisibility={false}
                        enableLayoutToggle={false}
                        server={{
                          page: subCurrentPage,
                          pageSize: subPageSize,
                          total: subTotal,
                          onPageChange: (page) => setSubPage({ areaId: selectedAreaId ?? '', page }),
                          onPageSizeChange: (size) => {
                            setSubPageSize(size);
                            setSubPage({ areaId: selectedAreaId ?? '', page: 1 });
                          },
                        }}
                      />
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <Card className="border-border/60 bg-card p-12 text-center ring-1 ring-border/50">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Globe className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{t('admin.areas.page.noAreas', 'No service areas yet')}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('admin.areas.page.noAreasHint', 'Create a coverage zone to start assigning customers and sub-areas.')}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </PageContent>

      {/* ── Area Create/Edit Dialog ─────────────────────────────────── */}
      <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {editArea ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              {editArea ? t('admin.areas.page.editZone', 'Edit Coverage Zone') : t('admin.areas.page.addArea', 'Add Service Area')}
            </DialogTitle>
            <DialogDescription>
              {editArea
                ? t('admin.areas.page.editZoneDesc', 'Update the coverage zone name, code or status.')
                : t('admin.areas.page.addAreaDesc', 'Define a new coverage zone.')}
            </DialogDescription>
          </DialogHeader>
          <AreaFormFields
            form={areaForm}
            onSubmit={onSubmitArea}
            codeHint={t('admin.areas.page.codeHint', 'Up to {n} characters', { n: 10 })}
            submitLabel={editArea ? t('admin.areas.page.saveChanges', 'Save Changes') : t('admin.areas.page.createArea', 'Create Service Area')}
          />
        </DialogContent>
      </Dialog>

      {/* ── Area Delete Confirmation ────────────────────────────────── */}
      <ConfirmDialog
        open={deleteArea !== null}
        onOpenChange={(open) => !open && setDeleteArea(null)}
        title={t('admin.areas.page.deleteAreaTitle', 'Delete Service Area')}
        description={
          deleteArea && deleteArea.totalCustomers > 0
            ? t('admin.areas.page.deleteAreaAssigned', '{n} customers are assigned to this area and will need reassignment. Delete it anyway?', { n: deleteArea.totalCustomers })
            : t('admin.areas.page.deleteAreaConfirm', 'Are you sure you want to delete this coverage zone?')
        }
        confirmLabel={t('admin.areas.page.deleteArea', 'Delete Area')}
        destructive
        onConfirm={async () => {
          if (deleteArea) {
            await m.remove.mutateAsync(deleteArea.id);
            if (pickedAreaId === deleteArea.id) setPickedAreaId(null);
            setDeleteArea(null);
          }
        }}
      />

      {/* ── Sub-area Create/Edit Dialog ─────────────────────────────── */}
      <Dialog open={subAreaDialogOpen} onOpenChange={setSubAreaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {editingSubArea ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              {editingSubArea ? t('admin.areas.page.editSub', 'Edit sub-area') : t('admin.areas.page.addNewSub', 'Add New Sub-area')}
            </DialogTitle>
            <DialogDescription>
              {editingSubArea
                ? t('admin.areas.page.editSubDesc', 'Update sub-area label, code, or status.')
                : t('admin.areas.page.addSubDesc', 'Create a sub-area inside {name}.', {
                    name: selectedArea?.name ?? t('admin.areas.page.thisZone', 'this zone'),
                  })}
            </DialogDescription>
          </DialogHeader>
          <AreaFormFields
            form={subForm}
            onSubmit={onSubmitSubArea}
            codeHint={t('admin.areas.page.codeHint', 'Up to {n} characters', { n: 50 })}
            submitLabel={editingSubArea ? t('admin.areas.page.saveChanges', 'Save Changes') : t('admin.areas.page.addSub', 'Add Sub-area')}
          />
        </DialogContent>
      </Dialog>

      {/* ── Sub-area Delete Confirmation ────────────────────────────── */}
      <ConfirmDialog
        open={deleteSubArea !== null}
        onOpenChange={(open) => !open && setDeleteSubArea(null)}
        title={t('admin.areas.page.deleteSub', 'Delete sub-area')}
        description={t('admin.areas.page.deleteSubConfirm', 'Are you sure you want to delete this sub-area? Customers assigned here may need re-routing.')}
        confirmLabel={t('admin.areas.page.deleteSub', 'Delete sub-area')}
        destructive
        onConfirm={async () => {
          if (deleteSubArea) {
            await m.removeSub.mutateAsync(deleteSubArea.id);
            setDeleteSubArea(null);
          }
        }}
      />
    </div>
  );
}

function AreaFormFields({
  form,
  onSubmit,
  codeHint,
  submitLabel,
}: {
  form: ReturnType<typeof useForm<AreaFormValues>>;
  onSubmit: (values: AreaFormValues) => Promise<void>;
  codeHint: string;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;
  const { t, te } = useLocale();
  const statusItems = { active: t('status.active', 'Active'), inactive: t('status.inactive', 'Inactive') };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="area_name" className="text-xs font-semibold">{t('admin.areas.page.fieldName', 'Name')}</Label>
        <Input id="area_name" {...register('area_name')} className="h-10 shadow-sm" />
        {errors.area_name && <p className="text-xs text-destructive">{te(errors.area_name.message ?? '')}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="area_code" className="text-xs font-semibold">{t('admin.areas.page.fieldCode', 'Code')}</Label>
        <Input id="area_code" {...register('area_code')} className="h-10 shadow-sm font-mono" />
        {errors.area_code ? (
          <p className="text-xs text-destructive">{te(errors.area_code.message ?? '')}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{codeHint}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="status" className="text-xs font-semibold">{t('admin.customerPayments.list.colStatus', 'Status')}</Label>
        <Select
          value={watch('status')}
          onValueChange={(v) => setValue('status', v === 'inactive' ? 'inactive' : 'active')}
          items={statusItems}
        >
          <SelectTrigger id="status" className="h-10 shadow-sm w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{statusItems.active}</SelectItem>
            <SelectItem value="inactive">{statusItems.inactive}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        className="w-full font-semibold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? t('admin.areas.page.saving', 'Saving…') : submitLabel}
      </Button>
    </form>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
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
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
  useAddSubArea,
  useUpdateSubArea,
  useDeleteSubArea,
} from '../hooks/use-areas';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { TablePagination } from '@/components/shared/TablePagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Area, SubArea } from '@/data/shared/types';

const areaSchema = z.object({
  name: z.string().min(2, 'Area name required'),
  subareas: z.string().optional(),
});

type AreaFormValues = z.infer<typeof areaSchema>;

const subAreaSchema = z.object({
  name: z.string().min(2, 'Sub-area name required'),
  areaCode: z.string().min(2, 'Area code required'),
  status: z.enum(['active', 'inactive']),
});

type SubAreaFormValues = z.infer<typeof subAreaSchema>;

type StatusFilter = 'all' | 'active' | 'inactive';

export function AreasPage() {
  const { data, isLoading, isError, refetch } = useAreas();
  const createMutation = useCreateArea();
  const updateMutation = useUpdateArea();
  const deleteMutation = useDeleteArea();
  const addSubAreaMutation = useAddSubArea();
  const updateSubAreaMutation = useUpdateSubArea();
  const deleteSubAreaMutation = useDeleteSubArea();

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Dialogs
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [editArea, setEditArea] = useState<Area | null>(null);
  const [deleteAreaId, setDeleteAreaId] = useState<string | null>(null);

  const [subAreaDialogOpen, setSubAreaDialogOpen] = useState(false);
  const [editingSubArea, setEditingSubArea] = useState<{ areaId: string; sub: SubArea } | null>(null);
  const [creatingSubAreaFor, setCreatingSubAreaFor] = useState<string | null>(null);
  const [deleteSubAreaInfo, setDeleteSubAreaInfo] = useState<{ areaId: string; subId: string } | null>(null);

  const {
    register: registerArea,
    handleSubmit: handleSubmitArea,
    reset: resetArea,
    formState: { errors: areaErrors, isSubmitting: isSubmittingArea },
  } = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: { name: '', subareas: '' },
  });

  const {
    register: registerSub,
    handleSubmit: handleSubmitSub,
    reset: resetSub,
    setValue: setSubValue,
    watch: watchSub,
    formState: { errors: subErrors, isSubmitting: isSubmittingSub },
  } = useForm<SubAreaFormValues>({
    resolver: zodResolver(subAreaSchema),
    defaultValues: { name: '', areaCode: '', status: 'active' },
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  // Set default selected area on initial load or if selected is deleted
  useEffect(() => {
    if (items.length > 0) {
      if (!selectedAreaId || !items.some((a) => a.id === selectedAreaId)) {
        setSelectedAreaId(items[0].id);
      }
    } else {
      setSelectedAreaId(null);
    }
  }, [items, selectedAreaId]);

  const filteredAreas = useMemo(() => {
    let result = items;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.subareas.some(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.areaCode.toLowerCase().includes(q)
          )
      );
    }
    if (statusFilter === 'inactive') {
      result = []; // In mock schema all parent areas are active
    }
    return result;
  }, [items, searchQuery, statusFilter]);

  const selectedArea = useMemo(
    () => items.find((a) => a.id === selectedAreaId) || null,
    [items, selectedAreaId]
  );

  // Subarea Pagination
  const [subCurrentPage, setSubCurrentPage] = useState(1);
  const [subPageSize, setSubPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const subareasList = useMemo(() => selectedArea?.subareas ?? [], [selectedArea?.subareas]);
  const subTotalPages = Math.max(1, Math.ceil(subareasList.length / subPageSize));
  const safeSubPage = Math.min(Math.max(1, subCurrentPage), subTotalPages);

  const paginatedSubareas = useMemo(() => {
    const start = (safeSubPage - 1) * subPageSize;
    return subareasList.slice(start, start + subPageSize);
  }, [subareasList, safeSubPage, subPageSize]);

  // High-level KPI Stats like the old PHP system
  const totalAreas = items.length;
  const activeAreas = items.length; // all active in default mock
  const totalSubAreas = items.reduce((acc, a) => acc + a.subareas.length, 0);
  const areasWithoutSubareas = items.filter((a) => a.subareas.length === 0).length;

  // Handlers for Area Modals
  const openCreateArea = () => {
    setEditArea(null);
    resetArea({ name: '', subareas: '' });
    setAreaDialogOpen(true);
  };

  const openEditArea = (area: Area) => {
    setEditArea(area);
    resetArea({
      name: area.name,
      subareas: area.subareas.map((s) => s.name).join(', '),
    });
    setAreaDialogOpen(true);
  };

  const onSubmitArea = async (values: AreaFormValues) => {
    const subareas = values.subareas
      ? values.subareas
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    if (editArea) {
      await updateMutation.mutateAsync({ id: editArea.id, name: values.name });
    } else {
      const res = await createMutation.mutateAsync({
        name: values.name,
        subareas,
      });
      if (res?.id) {
        setSelectedAreaId(res.id);
      }
    }
    setAreaDialogOpen(false);
  };

  // Handlers for SubArea Modals
  const openCreateSubArea = (areaId: string) => {
    setEditingSubArea(null);
    setCreatingSubAreaFor(areaId);
    resetSub({ name: '', areaCode: '', status: 'active' });
    setSubAreaDialogOpen(true);
  };

  const openEditSubArea = (areaId: string, sub: SubArea) => {
    setEditingSubArea({ areaId, sub });
    setCreatingSubAreaFor(null);
    resetSub({ name: sub.name, areaCode: sub.areaCode, status: sub.status });
    setSubAreaDialogOpen(true);
  };

  const onSubmitSubArea = async (values: SubAreaFormValues) => {
    if (editingSubArea) {
      await updateSubAreaMutation.mutateAsync({
        areaId: editingSubArea.areaId,
        subId: editingSubArea.sub.id,
        payload: values,
      });
    } else if (creatingSubAreaFor) {
      await addSubAreaMutation.mutateAsync({
        areaId: creatingSubAreaFor,
        payload: { name: values.name, areaCode: values.areaCode },
      });
    }
    setSubAreaDialogOpen(false);
    setEditingSubArea(null);
    setCreatingSubAreaFor(null);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load areas"
        description="Could not fetch service area workspace data."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Hero */}
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Globe className="h-6 w-6" />
            </div>
            Service Areas
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Geographic coverage zones, point-of-presence regions, and sub-area network routing.
          </p>
        </div>
        <Can menu="area" action="create">
          <Button
            size="sm"
            onClick={openCreateArea}
            className="shadow-md font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> New Area
          </Button>
        </Can>
      </PageHero>

      <PageContent className="space-y-6">
        {/* KPI Metric Strips (From PHP All.php) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Areas
              </span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Globe className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums">
                {totalAreas}
              </span>
              <span className="text-xs text-muted-foreground">zones</span>
            </div>
          </Card>

          <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:border-emerald-500/40 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Areas
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
                {activeAreas}
              </span>
              <span className="text-xs text-muted-foreground">operational</span>
            </div>
          </Card>

          <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:border-blue-500/40 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Sub-areas
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums text-blue-600 dark:text-blue-400">
                {totalSubAreas}
              </span>
              <span className="text-xs text-muted-foreground">sectors</span>
            </div>
          </Card>

          <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:border-amber-500/40 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Without Sub-areas
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums text-amber-600 dark:text-amber-400">
                {areasWithoutSubareas}
              </span>
              <span className="text-xs text-muted-foreground">pending breakdown</span>
            </div>
          </Card>
        </div>

        {/* Master-Detail 2-Pane Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANE: Areas Navigator List */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-3">
            <Card className="border-border/60 bg-card/90 shadow-sm overflow-hidden ring-1 ring-border/50">
              <div className="p-3.5 border-b border-border/60 bg-muted/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Coverage Zones
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                      {filteredAreas.length}
                    </Badge>
                  </div>
                  <Can menu="area" action="create">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openCreateArea}
                      className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10 gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </Can>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Filter areas & sub-areas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-7 h-8 bg-background border-border/60 text-xs shadow-inner"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                  >
                    <SelectTrigger className="w-[100px] h-8 bg-background border-border/60 text-xs">
                      <Filter className="h-3 w-3 mr-1 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Area List Items */}
              <div className="divide-y divide-border/40 max-h-[620px] overflow-y-auto p-1.5 space-y-1">
                {filteredAreas.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <p className="text-xs text-muted-foreground">No areas match filter</p>
                  </div>
                ) : (
                  filteredAreas.map((area) => {
                    const isSelected = selectedAreaId === area.id;
                    return (
                      <div
                        key={area.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedAreaId(area.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedAreaId(area.id);
                          }
                        }}
                        className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 text-left ${
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
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground truncate">
                              {area.id}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <Badge
                            variant={isSelected ? 'default' : 'secondary'}
                            className={`text-[10px] font-mono px-2 py-0.5 ${
                              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/70 text-muted-foreground'
                            }`}
                          >
                            {area.subareas.length} sub
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
                          <h2 className="text-xl font-bold tracking-tight text-foreground">
                            {selectedArea.name}
                          </h2>
                          <Badge variant="outline" className="font-mono text-xs bg-background/80 border-border/80 text-muted-foreground">
                            {selectedArea.id}
                          </Badge>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-medium gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                            Active Zone
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span>Contains <strong className="text-foreground">{selectedArea.subareas.length}</strong> defined sub-areas</span>
                          <span>•</span>
                          <span>Ready for customer assignment</span>
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
                          <Edit className="h-3.5 w-3.5" /> Edit Area
                        </Button>
                      </Can>
                      <Can menu="area" action="delete">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteAreaId(selectedArea.id)}
                          className="h-8 gap-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
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
                          Sub-areas in {selectedArea.name}
                          <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary border border-primary/20">
                            {selectedArea.subareas.length}
                          </Badge>
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Specific sectors, streets, or local distribution blocks under this coverage zone.
                        </p>
                      </div>
                    </div>

                    <Can menu="area" action="create">
                      <Button
                        size="sm"
                        onClick={() => openCreateSubArea(selectedArea.id)}
                        className="h-8 text-xs font-semibold gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Sub-area
                      </Button>
                    </Can>
                  </div>

                  {selectedArea.subareas.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground border border-border/60">
                          <Layers className="h-6 w-6 opacity-60" />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">No sub-areas configured</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Break down <strong className="text-foreground">{selectedArea.name}</strong> into sectors, blocks, or wards to streamline router routing and field technician tasks.
                        </p>
                        <Can menu="area" action="create">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCreateSubArea(selectedArea.id)}
                            className="mt-2 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <Plus className="h-3.5 w-3.5" /> Create First Sub-area
                          </Button>
                        </Can>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-border/60 bg-muted/30">
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[40%]">
                              Sub-area Name
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[30%]">
                              Area Code
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[15%]">
                              Status
                            </TableHead>
                            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[15%]">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedSubareas.map((sub) => (
                            <TableRow
                              key={sub.id}
                              className="group border-border/40 hover:bg-muted/30 transition-colors"
                            >
                              <TableCell>
                                <div className="flex items-center gap-2.5">
                                  <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <MapPin className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="font-semibold text-sm text-foreground">
                                    {sub.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded border border-border/40">
                                  {sub.areaCode}
                                </span>
                              </TableCell>
                              <TableCell>
                                {sub.status === 'active' ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium gap-1"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-muted text-muted-foreground border-border/60 text-[11px] font-medium gap-1"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground inline-block" />
                                    Inactive
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Can menu="area" action="update">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
                                      onClick={() => openEditSubArea(selectedArea.id, sub)}
                                      title="Edit sub-area"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  </Can>
                                  <Can menu="area" action="delete">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:bg-destructive/10 transition-colors"
                                      onClick={() =>
                                        setDeleteSubAreaInfo({
                                          areaId: selectedArea.id,
                                          subId: sub.id,
                                        })
                                      }
                                      title="Delete sub-area"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </Can>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Subareas Pagination */}
                  {selectedArea.subareas.length > 0 && (
                    <TablePagination
                      currentPage={safeSubPage}
                      pageSize={subPageSize}
                      totalItems={selectedArea.subareas.length}
                      onPageChange={setSubCurrentPage}
                      onPageSizeChange={setSubPageSize}
                      pageSizeOptions={[10, 20, 50, 100]}
                    />
                  )}
                </Card>
              </>
            ) : (
              <Card className="border-border/60 bg-card p-12 text-center ring-1 ring-border/50">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Globe className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Select a Coverage Zone</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pick any service area from the left sidebar to inspect and configure its nested sub-areas, coverage codes, and operational status.
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
              {editArea ? 'Edit Coverage Zone' : 'Add Service Area'}
            </DialogTitle>
            <DialogDescription>
              {editArea
                ? 'Update the coverage zone designation.'
                : 'Define a new master coverage zone and optional initial sub-areas.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitArea(onSubmitArea)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Area Name</Label>
              <Input
                {...registerArea('name')}
                placeholder="e.g. Uttara / Dhanmondi"
                className="h-10 shadow-sm"
              />
              {areaErrors.name && (
                <p className="text-xs text-destructive">{areaErrors.name.message}</p>
              )}
            </div>
            {!editArea && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Sub-areas (comma-separated, optional)
                </Label>
                <Input
                  {...registerArea('subareas')}
                  placeholder="Sector 7, Sector 11, Sector 13"
                  className="h-10 shadow-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  You can also add and manage individual sub-areas inside the workspace later.
                </p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full font-semibold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmittingArea}
            >
              {editArea ? 'Save Changes' : 'Create Service Area'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Area Delete Confirmation ────────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(deleteAreaId)}
        onOpenChange={(open) => !open && setDeleteAreaId(null)}
        title="Delete Service Area"
        description="Are you sure you want to delete this coverage zone? Sub-areas and customer associations will need reassignment."
        confirmLabel="Delete Area"
        destructive
        onConfirm={() => {
          if (deleteAreaId) {
            deleteMutation.mutate(deleteAreaId);
            setDeleteAreaId(null);
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
              {editingSubArea ? 'Edit Sub-area' : 'Add New Sub-area'}
            </DialogTitle>
            <DialogDescription>
              {editingSubArea
                ? 'Update sub-area label, area code, or activation status.'
                : `Create a dedicated sub-area inside ${selectedArea?.name || 'this zone'}.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitSub(onSubmitSubArea)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Sub-area Name</Label>
              <Input
                {...registerSub('name')}
                placeholder="e.g. Sector 7 / Road 12"
                className="h-10 shadow-sm"
              />
              {subErrors.name && (
                <p className="text-xs text-destructive">{subErrors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Area Code / Routing Prefix</Label>
              <Input
                {...registerSub('areaCode')}
                placeholder="e.g. UTT-S7 / DHAN-R12"
                className="h-10 shadow-sm font-mono"
              />
              {subErrors.areaCode && (
                <p className="text-xs text-destructive">{subErrors.areaCode.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status</Label>
              <Select
                value={watchSub('status')}
                onValueChange={(v) => setSubValue('status', v as 'active' | 'inactive')}
              >
                <SelectTrigger className="h-10 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full font-semibold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmittingSub}
            >
              {editingSubArea ? 'Save Changes' : 'Add Sub-area'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Sub-area Delete Confirmation ────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(deleteSubAreaInfo)}
        onOpenChange={(open) => !open && setDeleteSubAreaInfo(null)}
        title="Delete Sub-area"
        description="Are you sure you want to delete this sub-area? Customers assigned here may need re-routing."
        confirmLabel="Delete Sub-area"
        destructive
        onConfirm={() => {
          if (deleteSubAreaInfo) {
            deleteSubAreaMutation.mutate(deleteSubAreaInfo);
            setDeleteSubAreaInfo(null);
          }
        }}
      />
    </div>
  );
}

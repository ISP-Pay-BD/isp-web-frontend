'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Edit, Trash2, ChevronDown, ChevronRight, Globe, Layers, Search, Filter, X, ArrowUpDown, ChevronUp, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAreas, useCreateArea, useUpdateArea, useDeleteArea, useAddSubArea, useUpdateSubArea, useDeleteSubArea } from '../hooks/use-areas';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
import { staggerContainer, fadeUp, hoverLift } from '@/lib/animations';

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

type SortField = 'name' | 'subareas';
type SortDir = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';

const statStyles: Record<string, { iconBg: string; iconText: string; border: string }> = {
  primary: { iconBg: 'bg-primary/10', iconText: 'text-primary', border: 'border-primary/20' },
  emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  blue: { iconBg: 'bg-blue-500/10', iconText: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  amber: { iconBg: 'bg-amber-500/10', iconText: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
};

export function AreasPage() {
  const { data, isLoading, isError, refetch } = useAreas();
  const createMutation = useCreateArea();
  const updateMutation = useUpdateArea();
  const deleteMutation = useDeleteArea();
  const addSubAreaMutation = useAddSubArea();
  const updateSubAreaMutation = useUpdateSubArea();
  const deleteSubAreaMutation = useDeleteSubArea();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editArea, setEditArea] = useState<Area | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [subAreaDialogOpen, setSubAreaDialogOpen] = useState(false);
  const [editingSubArea, setEditingSubArea] = useState<{ areaId: string; sub: SubArea } | null>(null);
  const [creatingSubAreaFor, setCreatingSubAreaFor] = useState<string | null>(null);
  const [deleteSubAreaId, setDeleteSubAreaId] = useState<{ areaId: string; subId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: { name: '', subareas: '' },
  });

  const { register: registerSub, handleSubmit: handleSubmitSub, reset: resetSub, formState: { errors: subErrors, isSubmitting: isSubmittingSub }, watch: watchSub } = useForm<SubAreaFormValues>({
    resolver: zodResolver(subAreaSchema),
    defaultValues: { name: '', areaCode: '', status: 'active' },
  });

  const items = data?.items ?? [];

  const filteredAndSortedItems = useMemo(() => {
    let result = items;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (area) =>
          area.name.toLowerCase().includes(query) ||
          area.id.toLowerCase().includes(query)
      );
    }

    if (statusFilter === 'inactive') {
      result = [];
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'subareas') {
        comparison = a.subareas.length - b.subareas.length;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [items, searchQuery, statusFilter, sortField, sortDir]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setEditArea(null);
    reset({ name: '', subareas: '' });
    setDialogOpen(true);
  };

  const openEdit = (area: Area) => {
    setEditArea(area);
    reset({ name: area.name, subareas: area.subareas.map((s) => s.name).join(', ') });
    setDialogOpen(true);
  };

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

  const onSubmit = async (values: AreaFormValues) => {
    const subareas = values.subareas
      ? values.subareas.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    if (editArea) {
      await updateMutation.mutateAsync({ id: editArea.id, name: values.name });
    } else {
      await createMutation.mutateAsync({ name: values.name, subareas });
    }
    setDialogOpen(false);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    );
  };

  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError) {
    return (
      <EmptyState title="Failed to load areas" description="Could not fetch service area tree." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  const stats = [
    { label: 'Total Areas', value: items.length, icon: Globe, color: 'primary' },
    { label: 'Active Areas', value: items.length, icon: Globe, color: 'emerald' },
    { label: 'Total Sub-areas', value: items.reduce((sum, area) => sum + area.subareas.length, 0), icon: Layers, color: 'blue' },
    { label: 'Avg. Sub-areas/Area', value: Math.round(items.reduce((sum, area) => sum + area.subareas.length, 0) / Math.max(1, items.length)), icon: MapPin, color: 'amber' },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Globe className="h-6 w-6" />
            </div>
            Service Areas
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Geographic coverage zones and sub-areas for customer assignment and routing.
          </p>
        </div>
        <Can menu="area" action="create">
          <motion.div whileHover={hoverLift}>
            <Button size="sm" onClick={openCreate} className="shadow-sm font-semibold gap-1.5">
              <Plus className="h-4 w-4" /> New Area
            </Button>
          </motion.div>
        </Can>
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={fadeUp} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const style = statStyles[stat.color];
          return (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={idx}
            >
              <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden group">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${style.iconBg} ${style.iconText} border ${style.border} group-hover:scale-110 transition-transform duration-200`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Toolbar + Table */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-border/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 min-w-[200px] sm:min-w-[280px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <SelectTrigger className="w-full sm:w-[130px] h-9 bg-background border-border/60 text-sm shadow-sm">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1 w-fit bg-muted/50">
                {filteredAndSortedItems.length} result{filteredAndSortedItems.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Table */}
          {filteredAndSortedItems.length === 0 ? (
            <div className="py-16">
              <EmptyState
                title={searchQuery || statusFilter !== 'all' ? "No areas found" : "No service areas"}
                description={searchQuery || statusFilter !== 'all' ? "Try a different search term or filter." : "Create your first coverage zone to assign customers."}
                actionLabel={searchQuery || statusFilter !== 'all' ? undefined : "New Area"}
                onAction={searchQuery || statusFilter !== 'all' ? undefined : openCreate}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => toggleSort('name')}
                        className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Area Name <SortIcon field="name" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Code</span>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => toggleSort('subareas')}
                        className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Sub-areas <SortIcon field="subareas" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</span>
                    </TableHead>
                    <TableHead className="text-right w-[100px]">
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedItems.map((area) => {
                    const isExpanded = expanded.has(area.id);
                    return (
                       <AnimatePresence key={`wrap-${area.id}`} mode="popLayout">
                        {/* Main Row */}
                        <motion.tr
                          key={`row-${area.id}`}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className={`group border-border/40 transition-all duration-200 ${
                            isExpanded
                              ? 'bg-primary/[0.03] border-l-2 border-l-primary'
                              : 'hover:bg-muted/30 border-l-2 border-l-transparent'
                          }`}
                        >
                          <TableCell className="pr-0">
                            <button
                              type="button"
                              onClick={() => toggleExpand(area.id)}
                              className="p-1.5 rounded-lg hover:bg-muted/50 transition-all duration-200 active:scale-95"
                            >
                              <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                              >
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </motion.div>
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <motion.div
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  isExpanded
                                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                    : 'bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-sm group-hover:shadow-primary/20'
                                }`}
                                whileHover={{ scale: 1.05 }}
                              >
                                <MapPin className="h-4 w-4" />
                              </motion.div>
                              <div>
                                <div className={`font-semibold text-sm transition-colors ${isExpanded ? 'text-primary' : 'group-hover:text-primary'}`}>
                                  {area.name}
                                </div>
                                <div className="text-xs text-muted-foreground md:hidden font-mono">{area.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
                              {area.id}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs bg-muted/40">
                              {area.subareas.length}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-medium gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Can menu="area" action="update">
                                <motion.div whileHover={hoverLift}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                                    onClick={() => openEdit(area)}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                </motion.div>
                              </Can>
                              <Can menu="area" action="delete">
                                <motion.div whileHover={hoverLift}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                    onClick={() => setDeleteId(area.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </motion.div>
                              </Can>
                            </div>
                          </TableCell>
                        </motion.tr>

                        {/* Expanded Sub-areas Row */}
                        {isExpanded && (
                          <motion.tr
                            key={`sub-${area.id}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className="bg-muted/15 border-border/40"
                          >
                            <TableCell colSpan={6} className="p-0">
                              <div className="px-6 py-4 ml-10 border-l-2 border-primary/30">
                                <div className="flex items-center gap-2 mb-3">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium text-foreground">
                                    Sub-areas in {area.name}
                                  </span>
                                  <Badge variant="secondary" className="text-[10px] font-mono ml-1 bg-primary/10 text-primary border border-primary/20">
                                    {area.subareas.length}
                                  </Badge>
                                  <Can menu="area" action="create">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 ml-2 text-xs gap-1 text-primary hover:bg-primary/10"
                                      onClick={() => openCreateSubArea(area.id)}
                                    >
                                      <Plus className="h-3 w-3" /> Add
                                    </Button>
                                  </Can>
                                </div>
                                {area.subareas.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {area.subareas.map((sub, idx) => (
                                      <motion.div
                                        key={sub.id}
                                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04, type: 'spring', stiffness: 400, damping: 25 }}
                                        className="group/sub flex items-center gap-1"
                                      >
                                        <Badge
                                          variant="secondary"
                                          className="text-xs bg-background hover:bg-primary/10 text-foreground border border-border/60 hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                          <MapPin className="h-3 w-3 mr-1 text-primary/60" />
                                          {sub.name}
                                          {sub.status === 'inactive' && (
                                            <span className="ml-1 text-[10px] text-muted-foreground">(off)</span>
                                          )}
                                        </Badge>
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity duration-150">
                                          <Can menu="area" action="update">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-5 w-5 hover:bg-primary/10 hover:text-primary"
                                              onClick={() => openEditSubArea(area.id, sub)}
                                            >
                                              <Edit className="h-2.5 w-2.5" />
                                            </Button>
                                          </Can>
                                          <Can menu="area" action="delete">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-5 w-5 text-destructive hover:bg-destructive/10"
                                              onClick={() => setDeleteSubAreaId({ areaId: area.id, subId: sub.id })}
                                            >
                                              <Trash2 className="h-2.5 w-2.5" />
                                            </Button>
                                          </Can>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">No sub-areas defined</p>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {editArea ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              {editArea ? 'Edit Area' : 'Add Service Area'}
            </DialogTitle>
            <DialogDescription>Define a coverage zone and optional sub-areas (comma-separated).</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Area Name</Label>
              <Input {...register('name')} placeholder="e.g. Uttara" className="h-10 shadow-sm" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            {!editArea && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sub-areas (comma-separated)</Label>
                <Input {...register('subareas')} placeholder="Sector 7, Sector 11, Sector 13" className="h-10 shadow-sm" />
              </div>
            )}
            <Button type="submit" className="w-full font-semibold shadow-sm" disabled={isSubmitting}>
              {editArea ? 'Save Changes' : 'Create Area'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Area"
        description="Customers assigned to this area will need reassignment."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId);
            setDeleteId(null);
          }
        }}
      />

      {/* Sub-Area Create/Edit Dialog */}
      <Dialog open={subAreaDialogOpen} onOpenChange={setSubAreaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {editingSubArea ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              {editingSubArea ? 'Edit Sub-area' : 'Add Sub-area'}
            </DialogTitle>
            <DialogDescription>
              {editingSubArea ? 'Update the sub-area details.' : 'Create a new sub-area within this coverage zone.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitSub(onSubmitSubArea)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Sub-area Name</Label>
              <Input {...registerSub('name')} placeholder="e.g. Sector 7" className="h-10 shadow-sm" />
              {subErrors.name && <p className="text-xs text-destructive">{subErrors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Area Code</Label>
              <Input {...registerSub('areaCode')} placeholder="e.g. UTT-S7" className="h-10 shadow-sm font-mono" />
              {subErrors.areaCode && <p className="text-xs text-destructive">{subErrors.areaCode.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status</Label>
              <Select {...registerSub('status')} defaultValue={watchSub('status')}>
                <SelectTrigger className="h-10 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full font-semibold shadow-sm" disabled={isSubmittingSub}>
              {editingSubArea ? 'Save Changes' : 'Add Sub-area'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sub-Area Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteSubAreaId)}
        onOpenChange={(open) => !open && setDeleteSubAreaId(null)}
        title="Delete Sub-area"
        description="This sub-area will be permanently removed. Customers assigned here may need reassignment."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteSubAreaId) {
            deleteSubAreaMutation.mutate(deleteSubAreaId);
            setDeleteSubAreaId(null);
          }
        }}
      />
    </motion.div>
  );
}

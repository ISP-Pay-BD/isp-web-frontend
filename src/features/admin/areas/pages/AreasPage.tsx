'use client';

import { useState } from 'react';
import { Plus, MapPin, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAreas, useCreateArea, useUpdateArea, useDeleteArea } from '../hooks/use-areas';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Area } from '@/data/shared/types';

const areaSchema = z.object({
  name: z.string().min(2, 'Area name required'),
  subareas: z.string().optional(),
});

type AreaFormValues = z.infer<typeof areaSchema>;

export function AreasPage() {
  const { data, isLoading, isError, refetch } = useAreas();
  const createMutation = useCreateArea();
  const updateMutation = useUpdateArea();
  const deleteMutation = useDeleteArea();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editArea, setEditArea] = useState<Area | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: { name: '', subareas: '' },
  });

  const items = data?.items ?? [];

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

  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError) {
    return (
      <EmptyState title="Failed to load areas" description="Could not fetch service area tree." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Service Areas</h1>
          <p className="text-muted-foreground text-sm">
            Geographic coverage zones and sub-areas for customer assignment and routing.
          </p>
        </div>
        <Can menu="area" action="create">
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Area
          </Button>
        </Can>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No service areas" description="Create your first coverage zone to assign customers." actionLabel="Add Area" onAction={openCreate} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((area) => (
            <Card key={area.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{area.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">{area.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Can menu="area" action="update">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(area)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </Can>
                    <Can menu="area" action="delete">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(area.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </Can>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <button
                  type="button"
                  onClick={() => toggleExpand(area.id)}
                  className="flex w-full items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {expanded.has(area.id) ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  {area.subareas.length} sub-areas
                </button>
                {expanded.has(area.id) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {area.subareas.map((sub) => (
                      <Badge key={sub.id} variant="secondary" className="text-xs">{sub.name}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editArea ? 'Edit Area' : 'Add Service Area'}</DialogTitle>
            <DialogDescription>Define a coverage zone and optional sub-areas (comma-separated).</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Area Name</Label>
              <Input {...register('name')} placeholder="e.g. Uttara" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            {!editArea && (
              <div className="space-y-1.5">
                <Label>Sub-areas (comma-separated)</Label>
                <Input {...register('subareas')} placeholder="Sector 7, Sector 11, Sector 13" />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {editArea ? 'Save Changes' : 'Create Area'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}

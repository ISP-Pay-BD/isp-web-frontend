'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ImageIcon, Plus, Pencil, Trash2 } from 'lucide-react';
import { platformService } from '@/lib/api/services/platform.service';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { PlatformPageHeader, platformDate } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ProductShowcaseItem, ShowcaseInput } from '@/features/platform/types';

const EMPTY: ShowcaseInput = { name: '', target: 'website', bullets: '', sort_order: 0, status: 'active' };

function ShowcaseDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ProductShowcaseItem | null;
}) {
  const qc = useQueryClient();
  const form = useForm<ShowcaseInput>({ defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    form.reset(
      editing
        ? {
            name: editing.name,
            target: editing.target,
            bullets: editing.bullets.join('\n'),
            sort_order: editing.sortOrder,
            status: editing.status,
          }
        : EMPTY,
    );
  }, [open, editing, form]);

  const save = useMutation({
    mutationFn: (v: ShowcaseInput) => {
      const payload = { ...v, sort_order: Number(v.sort_order) || 0 };
      return editing ? platformService.updateShowcase(editing.id, payload) : platformService.createShowcase(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Showcase section updated' : 'Showcase section created');
      void qc.invalidateQueries({ queryKey: ['platform', 'showcase'] });
      onOpenChange(false);
    },
    onError: (err) => handleApiError(err, form.setError as never),
  });

  const err = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${editing.name}` : 'New showcase section'}</DialogTitle>
        </DialogHeader>
        <form id="showcase-form" onSubmit={form.handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sc-name">Section name</Label>
            <Input id="sc-name" {...form.register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
            {err.name ? <p className="text-xs text-destructive">{err.name.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-target">Shown on</Label>
            <select id="sc-target" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('target')}>
              <option value="website">Website</option>
              <option value="mobile">Mobile app</option>
            </select>
            {err.target ? <p className="text-xs text-destructive">{err.target.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-sort">Sort order</Label>
            <Input id="sc-sort" type="number" min={0} {...form.register('sort_order')} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sc-bullets">Highlights (one per line)</Label>
            <Textarea id="sc-bullets" rows={5} {...form.register('bullets')} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/40 p-3 sm:col-span-2">
            <span className="text-sm">Active</span>
            <Switch
              checked={form.watch('status') === 'active'}
              onCheckedChange={(v) => form.setValue('status', v ? 'active' : 'inactive')}
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="showcase-form" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create section'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShowcasePage() {
  const qc = useQueryClient();
  const [target, setTarget] = useState<'all' | 'website' | 'mobile'>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductShowcaseItem | null>(null);
  const [deleting, setDeleting] = useState<ProductShowcaseItem | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'showcase'],
    queryFn: () => platformService.getShowcaseSections(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => platformService.deleteShowcase(id),
    onSuccess: () => {
      toast.success('Showcase section deleted');
      void qc.invalidateQueries({ queryKey: ['platform', 'showcase'] });
    },
    onSettled: () => setDeleting(null),
  });

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load showcase"
        description={error instanceof Error ? error.message : 'Could not retrieve showcase sections.'}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const q = search.trim().toLowerCase();
  const filteredItems = data.items.filter(
    (item) =>
      (target === 'all' || item.target === target) &&
      (!q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)),
  );
  const activeCount = data.items.filter((i) => i.status === 'active').length;
  const imageCount = data.items.reduce((s, i) => s + i.imageCount, 0);

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Product Showcase"
        subtitle="Screenshot sections shown on the marketing website and the mobile app"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Showcase' },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" /> New section
          </Button>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{data.items.length}</span>{' '}
          <span className="text-muted-foreground">sections</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">{activeCount}</span>{' '}
          <span className="text-muted-foreground">active</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{imageCount}</span>{' '}
          <span className="text-muted-foreground">screenshots</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'website', 'mobile'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTarget(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                target === t
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-card border border-border/70 hover:bg-muted text-muted-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="max-w-xs w-full">
          <input
            type="search"
            placeholder="Search sections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 px-3 rounded-lg border border-border/70 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          title={data.items.length === 0 ? 'No showcase sections yet' : 'No sections match'}
          description={data.items.length === 0 ? 'Create a section, then upload its screenshots from the classic admin.' : undefined}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="border-border/60 bg-card overflow-hidden group hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnailUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                  <Badge
                    className="absolute top-3 right-3 text-[10px] font-bold shadow-xs"
                    variant={item.status === 'active' ? 'default' : 'secondary'}
                  >
                    {item.status}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{item.slug}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                      {item.subtitle}
                    </Badge>
                  </div>
                  {item.bullets.length > 0 ? (
                    <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                      {item.bullets.slice(0, 4).map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </CardContent>
              </div>
              <div className="px-4 pb-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {item.imageCount} screenshot{item.imageCount === 1 ? '' : 's'} · {platformDate(item.createdAt)}
                </span>
                <span className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setEditing(item);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={() => setDeleting(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ShowcaseDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? `Delete ${deleting.name}?` : 'Delete section'}
        description="The section and all of its screenshots are deleted permanently."
        confirmLabel={remove.isPending ? 'Deleting…' : 'Delete section'}
        destructive
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}

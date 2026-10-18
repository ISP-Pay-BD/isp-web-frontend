'use client';

import { useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Puzzle, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { platformService } from '@/lib/api/services/platform.service';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { PlatformPageHeader } from '@/features/platform/shared';
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
import { formatBdt } from '@/lib/format';
import type { PlatformPluginItem, PluginInput } from '@/features/platform/types';

const PER_PAGE = 30;

type PluginForm = Omit<PluginInput, 'status'> & { published: boolean };

const EMPTY: PluginForm = {
  name: '',
  slug: '',
  category: '',
  description: '',
  price: 0,
  price_type: '',
  billing_cycle: '',
  image: '',
  published: true,
};

function PluginDialog({
  open,
  onOpenChange,
  editing,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: PlatformPluginItem | null;
  categories: string[];
}) {
  const qc = useQueryClient();
  const form = useForm<PluginForm>({ defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    form.reset(
      editing
        ? {
            name: editing.name,
            slug: editing.slug,
            category: editing.category,
            description: editing.description,
            price: editing.priceBdt,
            price_type: editing.priceType ?? '',
            billing_cycle: editing.billingCycle ?? '',
            image: '',
            published: editing.published,
          }
        : EMPTY,
    );
  }, [open, editing, form]);

  const save = useMutation({
    mutationFn: (v: PluginForm) => {
      const payload: Partial<PluginInput> = {
        name: v.name,
        slug: v.slug || undefined,
        category: v.category,
        description: v.description,
        price: Number(v.price) || 0,
        price_type: v.price_type,
        billing_cycle: v.billing_cycle,
        status: v.published ? 1 : 0,
      };
      if (v.image) payload.image = v.image;
      return editing
        ? platformService.updatePlugin(editing.id, payload)
        : platformService.createPlugin(payload as PluginInput);
    },
    onSuccess: () => {
      toast.success(editing ? 'Plugin updated' : 'Plugin created');
      void qc.invalidateQueries({ queryKey: ['platform', 'plugins'] });
      onOpenChange(false);
    },
    onError: (err) => handleApiError(err, form.setError as never),
  });

  const err = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${editing.name}` : 'New plugin'}</DialogTitle>
        </DialogHeader>
        <form id="plugin-form" onSubmit={form.handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pl-name">Name</Label>
            <Input id="pl-name" {...form.register('name', { required: 'Plugin name is required' })} />
            {err.name ? <p className="text-xs text-destructive">{err.name.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pl-slug">Slug (engine key)</Label>
            <Input id="pl-slug" placeholder="derived from the name" {...form.register('slug')} className="font-mono text-xs" />
            {err.slug ? <p className="text-xs text-destructive">{err.slug.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pl-category">Category</Label>
            <Input id="pl-category" list="plugin-categories" {...form.register('category')} />
            <datalist id="plugin-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pl-desc">Description</Label>
            <Textarea id="pl-desc" rows={4} {...form.register('description')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pl-price">Price (৳, 0 = free)</Label>
            <Input id="pl-price" type="number" step="0.01" min={0} {...form.register('price')} />
            {err.price ? <p className="text-xs text-destructive">{err.price.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pl-cycle">Billing cycle</Label>
            <Input id="pl-cycle" placeholder="monthly, one-time…" {...form.register('billing_cycle')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pl-price-type">Price label</Label>
            <Input id="pl-price-type" placeholder="Free, Paid, Usage…" {...form.register('price_type')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pl-image">Image path or URL {editing ? '(leave empty to keep)' : ''}</Label>
            <Input id="pl-image" {...form.register('image')} className="font-mono text-xs" />
            {err.image ? <p className="text-xs text-destructive">{err.image.message}</p> : null}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/40 p-3 sm:col-span-2">
            <div>
              <div className="text-sm font-medium">Published</div>
              <div className="text-xs text-muted-foreground">Visible in the public marketplace and the tenant engines catalog</div>
            </div>
            <Switch checked={form.watch('published')} onCheckedChange={(v) => form.setValue('published', v)} />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="plugin-form" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create plugin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PluginsPage() {
  const qc = useQueryClient();
  const [category, setCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformPluginItem | null>(null);
  const [deleting, setDeleting] = useState<PlatformPluginItem | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'plugins', { category, search, page }],
    queryFn: () => platformService.getPluginsCatalog({ category, search, page, perPage: PER_PAGE }),
    placeholderData: keepPreviousData,
  });

  const toggle = useMutation({
    mutationFn: (p: PlatformPluginItem) => platformService.setPluginStatus(p.id, p.published ? 0 : 1),
    onSuccess: (_, p) => {
      toast.success(p.published ? `${p.name} unpublished` : `${p.name} published`);
      void qc.invalidateQueries({ queryKey: ['platform', 'plugins'] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => platformService.deletePlugin(id),
    onSuccess: () => {
      toast.success('Plugin deleted');
      void qc.invalidateQueries({ queryKey: ['platform', 'plugins'] });
    },
    onSettled: () => setDeleting(null),
  });

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load plugins"
        description={error instanceof Error ? error.message : 'Could not retrieve marketplace plugins.'}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const { summary, categories } = data.summary;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Plugins & Marketplace Addons"
        subtitle="The catalog behind the public marketplace and every tenant's ISP engines page"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Plugins & Addons' },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" /> New plugin
          </Button>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{summary.total}</span>{' '}
          <span className="text-muted-foreground">plugins</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">{summary.published}</span>{' '}
          <span className="text-muted-foreground">published</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{summary.installs.toLocaleString()}</span>{' '}
          <span className="text-muted-foreground">enabled tenant installations</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {['', ...categories].map((cat) => (
            <button
              key={cat || 'all'}
              type="button"
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                category === cat
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-card border border-border/70 hover:bg-muted text-muted-foreground'
              }`}
            >
              {cat || 'all'}
            </button>
          ))}
        </div>

        <div className="max-w-xs w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search plugins..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/70 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          title={search || category ? 'No plugins match' : 'No plugins yet'}
          description={search || category ? 'Clear the filters to see the whole catalog.' : 'Create the first marketplace plugin.'}
          actionLabel={search || category ? 'Clear filters' : undefined}
          onAction={
            search || category
              ? () => {
                  setSearchInput('');
                  setCategory('');
                }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((plugin) => (
            <Card key={plugin.id} className="border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition flex flex-col justify-between">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <PluginIcon src={plugin.imageUrl} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{plugin.name}</h3>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {plugin.category}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {plugin.slug}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={plugin.published}
                    disabled={toggle.isPending}
                    onCheckedChange={() => toggle.mutate(plugin)}
                    aria-label={plugin.published ? 'Unpublish' : 'Publish'}
                  />
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {plugin.description || 'No description yet.'}
                </p>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="font-bold font-mono text-primary text-sm">
                    {plugin.priceBdt === 0
                      ? 'Free'
                      : `৳${formatBdt(plugin.priceBdt)}${plugin.billingCycle ? ` / ${plugin.billingCycle}` : ''}`}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">{plugin.installs} enabled tenants</span>
                </div>
                <div className="flex justify-end gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => {
                      setEditing(plugin);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                    disabled={plugin.installs > 0}
                    title={plugin.installs > 0 ? 'Tenants have this plugin enabled' : undefined}
                    onClick={() => setDeleting(plugin)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-xs">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      ) : null}

      <PluginDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} categories={categories} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? `Delete ${deleting.name}?` : 'Delete plugin'}
        description="The plugin is removed from the marketplace and the engines catalog."
        confirmLabel={remove.isPending ? 'Deleting…' : 'Delete plugin'}
        destructive
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}

/** Catalog image, or the plugin glyph when there is none or the file is missing. */
function PluginIcon({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <Puzzle className="h-5 w-5" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="h-5 w-5 object-contain" onError={() => setFailed(true)} />;
}

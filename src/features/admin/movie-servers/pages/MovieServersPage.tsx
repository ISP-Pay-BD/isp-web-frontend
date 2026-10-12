'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TablePagination } from '@/components/shared/TablePagination';
import { toast } from 'sonner';
import {
  ExternalLink,
  Plus,
  RefreshCw,
  Film,
  PlaySquare,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Search,
  Star,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useDebouncedValue } from '@/features/admin/settings/hooks/use-debounced-value';
import { useAuthStore } from '@/stores/auth-store';
import {
  useCreateMovieServer,
  useDeleteMovieServer,
  useMovieServers,
  useTestMovieServer,
  useUpdateMovieServer,
  type MovieServer,
  type MovieServerInput,
  type ProbeResult,
} from '../hooks/use-movie-servers';

const EMPTY_FORM: MovieServerInput = { name: '', url: '', details: '', rating: '' };

export function MovieServersPage() {
  // Server writes are tenant-admin only on the backend (POP accounts read + test).
  const canManage = useAuthStore((st) => st.user?.role === 'admin');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const { data, isLoading, isError, error, refetch, isFetching } = useMovieServers({ page, pageSize, search: debouncedSearch });

  const createServer = useCreateMovieServer();
  const updateServer = useUpdateMovieServer();
  const deleteServer = useDeleteMovieServer();
  const testServer = useTestMovieServer();

  const [probes, setProbes] = useState<Record<string, ProbeResult>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<MovieServer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<MovieServerInput>(EMPTY_FORM);
  const [deleting, setDeleting] = useState<MovieServer | null>(null);

  const list = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const probeList = Object.values(probes);
  const reachable = probeList.filter((p) => p.reachable).length;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (srv: MovieServer) => {
    setEditing(srv);
    setForm({ name: srv.name, url: srv.url, details: srv.details, rating: srv.rating === null ? '' : String(srv.rating) });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.url.trim()) {
      toast.error('Name and URL are required');
      return;
    }
    const onSuccess = () => {
      toast.success(editing ? `${form.name} updated` : `${form.name} added`);
      setFormOpen(false);
    };
    if (editing) updateServer.mutate({ id: editing.id, input: form }, { onSuccess });
    else createServer.mutate(form, { onSuccess });
  };

  const handleTest = (srv: MovieServer) => {
    setTestingId(srv.id);
    testServer.mutate(srv.id, {
      onSuccess: (res) => {
        setProbes((prev) => ({ ...prev, [srv.id]: res }));
        if (res.reachable) toast.success(`${srv.name} responded${res.status ? ` (HTTP ${res.status})` : ''} in ${res.durationMs ?? 0} ms`);
        else toast.error(`${srv.name}: ${res.error ?? 'no response'}`);
      },
      onSettled: () => setTestingId(null),
    });
  };

  const handleOpen = (srv: MovieServer) => {
    if (!/^(https?|ftp):\/\//i.test(srv.url)) {
      toast.error('This server has no openable URL');
      return;
    }
    window.open(srv.url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load movie servers"
        description={errorMessage(error)}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const saving = createServer.isPending || updateServer.isPending;

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Movie & Media Servers"
        subtitle="FTP, streaming and media endpoints published to your subscribers."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Movie Servers' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
            {canManage && (
              <Button
                size="sm"
                onClick={openCreate}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Media Server
              </Button>
            )}
          </div>
        }
      />

      {/* KPI ribbon — counts from the API, reachability from checks run on this page */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Servers</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Film className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">{total}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Published to subscribers</div>
          </CardContent>
        </Card>
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reachable</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">
              {probeList.length ? `${reachable} / ${probeList.length}` : '—'}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Of servers tested this session</div>
          </CardContent>
        </Card>
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unreachable</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-rose-400">
              {probeList.length ? probeList.length - reachable : '—'}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Checked from the billing server</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, URL or details..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 h-9 text-xs bg-background/80"
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Film className="h-5 w-5" />}
          title={search ? 'No servers match your search' : 'No media servers yet'}
          description={search ? 'Try a different name or URL.' : 'Add the FTP or streaming servers your subscribers can use.'}
          actionLabel={search ? 'Clear search' : canManage ? 'Add Media Server' : undefined}
          onAction={search ? () => setSearch('') : canManage ? openCreate : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((srv) => {
            const probe = probes[srv.id];
            return (
              <Card
                key={srv.id}
                className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm hover:border-primary/50 hover:bg-card/90 transition duration-200 overflow-hidden"
              >
                <CardHeader className="p-5 border-b border-border/50 flex flex-row items-start justify-between space-y-0 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {srv.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={srv.imageUrl} alt="" className="h-10 w-10 rounded-xl object-cover border border-border/60" />
                    ) : (
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <PlaySquare className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <CardTitle className="text-base font-bold text-foreground truncate">{srv.name}</CardTitle>
                      {srv.rating !== null && srv.rating > 0 && (
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-500">
                          <Star className="h-3 w-3 fill-current" /> {srv.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  {probe && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-semibold uppercase shrink-0',
                        probe.reachable
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                      )}
                    >
                      {probe.reachable ? `Up · ${probe.durationMs ?? 0} ms` : 'Unreachable'}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-0.5">Endpoint URL</span>
                    <p className="font-mono text-xs text-foreground truncate">{srv.url}</p>
                  </div>
                  {srv.details && <p className="text-xs text-muted-foreground line-clamp-2">{srv.details}</p>}
                  {probe && !probe.reachable && probe.error && (
                    <p className="text-[11px] text-rose-400">{probe.error}</p>
                  )}

                  <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-border/50">
                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 gap-1.5 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleting(srv)}
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5" onClick={() => openEdit(srv)}>
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 gap-1.5 border-border/80 hover:bg-accent"
                      disabled={testingId === srv.id}
                      onClick={() => handleTest(srv)}
                    >
                      <Activity className={cn('h-3 w-3', testingId === srv.id && 'animate-pulse')} />
                      {testingId === srv.id ? 'Testing…' : 'Test'}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5"
                      onClick={() => handleOpen(srv)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {total > pageSize && (
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          pageSizeOptions={[12, 24, 48]}
        />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit media server' : 'Add media server'}</DialogTitle>
            <DialogDescription>Subscribers see these servers in their portal and app.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-xs" maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">URL</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="http://… or ftp://…"
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Details</Label>
              <Textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="text-xs h-20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rating (0 – 9.99, optional)</Label>
              <Input
                type="number"
                min={0}
                max={9.99}
                step={0.1}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add server'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete media server?"
        description={deleting ? `"${deleting.name}" will be removed for all subscribers.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          const target = deleting;
          setDeleting(null);
          if (!target) return;
          deleteServer.mutate(target.id, { onSuccess: () => toast.success(`${target.name} deleted`) });
        }}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import {
  Globe,
  Plus,
  Search,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Ban,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PlatformPageHeader } from '@/features/platform/shared';
import { toast } from 'sonner';

export function TenantsListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'tenants', { q: search, status: statusFilter }],
    queryFn: () => mockFetch('platform.tenants.list', { q: search, status: statusFilter }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockFetch('platform.tenants.delete', id),
    onSuccess: () => {
      toast.success('Tenant portal deleted successfully');
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete tenant portal');
      setDeletingId(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      mockFetch('platform.tenants.update', id, { status }),
    onSuccess: (_, vars) => {
      toast.success(`Tenant status updated to ${vars.status}`);
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update tenant status');
    },
  });

  const copyUrl = (slug: string) => {
    const url = `https://${slug}.isppaybd.com`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success('Portal URL copied to clipboard');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (isLoading) {
    return <PageSkeleton rows={6} />;
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load tenants"
        description="Could not retrieve tenant portals from the server."
        actionLabel="Try Again"
        onAction={() => refetch()}
      />
    );
  }

  const { items, stats } = data;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Tenant Portals"
        subtitle="Subdomain portals for each ISP — one platform application, isolated tenant data"
        actions={
          <Link href="/platform/tenants/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-1.5 h-4 w-4" /> Create Portal
            </Button>
          </Link>
        }
      />

      {/* Top Stat Overview Cards (Mirroring PHP Tenants.php) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Portals"
          value={stats.total}
          description="Provisioned ISP instances"
          icon={Globe}
        />
        <StatCard
          title="Active Portals"
          value={stats.active}
          description="Live and billing subscribers"
          icon={CheckCircle2}
        />
        <StatCard
          title="Suspended Portals"
          value={stats.suspended}
          description="Temporarily disabled"
          icon={Ban}
        />
        <StatCard
          title="Trial Portals"
          value={stats.trial}
          description="14-day evaluation tenants"
          icon={Filter}
        />
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, slug, email, owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
              </select>
              {(search || statusFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table & Responsive Mobile Cards */}
      {items.length === 0 ? (
        <EmptyState
          icon={<Globe className="h-10 w-10 text-muted-foreground" />}
          title="No tenant portals found"
          description={
            search || statusFilter
              ? 'No tenants match your search criteria.'
              : 'Create a subdomain portal for an ISP. No Nginx or DNS change is required per tenant.'
          }
          actionLabel={search || statusFilter ? undefined : 'Create First Portal'}
          onAction={search || statusFilter ? undefined : () => router.push('/platform/tenants/new')}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3">ISP Company & Branding</th>
                    <th className="px-4 py-3">Portal URL</th>
                    <th className="px-4 py-3">Owner Contact</th>
                    <th className="px-4 py-3">Plan & Subs</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
                            style={{ backgroundColor: t.primaryColor || '#f75803' }}
                          >
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link href={`/platform/tenants/${t.id}`} className="font-semibold text-foreground hover:underline">
                              {t.name}
                            </Link>
                            <div className="text-xs text-muted-foreground">ID: {t.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <a
                            href={`https://${t.slug}.isppaybd.com`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {t.slug}.isppaybd.com
                            <ExternalLink className="h-3 w-3 inline" />
                          </a>
                          <button
                            onClick={() => copyUrl(t.slug)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                            title="Copy Portal URL"
                          >
                            {copiedSlug === t.slug ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-foreground">{t.ownerName}</div>
                        <div className="text-xs text-muted-foreground">{t.ownerEmail}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{t.ownerPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-semibold text-xs mb-0.5">
                          {t.plan}
                        </Badge>
                        <div className="text-xs text-muted-foreground">{t.customers.toLocaleString()} active subs</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            t.status === 'active'
                              ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-xs'
                              : t.status === 'trial'
                              ? 'border-amber-500/30 text-amber-600 bg-amber-500/10 text-xs'
                              : 'border-red-500/30 text-red-600 bg-red-500/10 text-xs'
                          }
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/platform/tenants/${t.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                              Details
                            </Button>
                          </Link>
                          <Link href={`/platform/tenants/${t.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit Tenant">
                              <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              statusMutation.mutate({
                                id: t.id,
                                status: t.status === 'active' ? 'suspended' : 'active',
                              })
                            }
                            title={t.status === 'active' ? 'Suspend Portal' : 'Activate Portal'}
                          >
                            {t.status === 'active' ? (
                              <Ban className="h-3.5 w-3.5 text-amber-600" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => setDeletingId(t.id)}
                            title="Delete Tenant"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards Fallback (<768px) */}
          <div className="grid gap-3 md:hidden">
            {items.map((t) => (
              <Card key={t.id} className="border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-8 w-8 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ backgroundColor: t.primaryColor || '#f75803' }}
                      >
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/platform/tenants/${t.id}`} className="font-semibold text-sm hover:underline">
                          {t.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">{t.plan} tier</div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        t.status === 'active'
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-xs'
                          : t.status === 'trial'
                          ? 'border-amber-500/30 text-amber-600 bg-amber-500/10 text-xs'
                          : 'border-red-500/30 text-red-600 bg-red-500/10 text-xs'
                      }
                    >
                      {t.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-border/40 font-mono">
                    <span className="text-muted-foreground">URL:</span>
                    <div className="flex items-center gap-1.5">
                      <span>{t.slug}.isppaybd.com</span>
                      <button onClick={() => copyUrl(t.slug)}>
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Owner:</span>
                    <span>{t.ownerName} ({t.ownerPhone})</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Subscribers:</span>
                    <span className="font-semibold text-foreground">{t.customers.toLocaleString()} users</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Link href={`/platform/tenants/${t.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Details
                      </Button>
                    </Link>
                    <Link href={`/platform/tenants/${t.id}/edit`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setDeletingId(t.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Tenant Portal"
        description="Are you sure you want to permanently delete this tenant portal? All tenant subscribers, packages and accounting data will be unlinked."
        confirmLabel="Yes, Delete Portal"
        destructive
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </div>
  );
}

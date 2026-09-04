'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Search,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useFreeRequests } from '../hooks/use-customers';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FreeRequestItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  area: string;
  reseller?: string | null;
  temporaryExpiry?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function FreeRequestsPage() {
  const { data, isLoading, isError, refetch } = useFreeRequests();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectId, setRejectId] = useState<string | null>(null);

  const requests = (data as FreeRequestItem[]) || [];

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        search === '' ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.phone.includes(search) ||
        r.area.toLowerCase().includes(search.toLowerCase()) ||
        (r.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  const pendingCount = useMemo(() => requests.filter((r) => r.status === 'pending').length, [requests]);
  const approvedCount = useMemo(() => requests.filter((r) => r.status === 'approved').length, [requests]);
  const rejectedCount = useMemo(() => requests.filter((r) => r.status === 'rejected').length, [requests]);

  const handleApprove = (item: FreeRequestItem) => {
    toast.success(`Lead "${item.name}" approved — 7-day free trial activated.`);
  };

  const handleReject = () => {
    if (!rejectId) return;
    const item = requests.find((r) => r.id === rejectId);
    toast.success(`Lead "${item?.name}" rejected.`);
    setRejectId(null);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (isError) {
    return (
      <EmptyState
        title="Error loading free user requests"
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Free User Requests"
        subtitle="Prospective leads and trial broadband requests pending verification and line commissioning."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customers', url: '/admin/customers' },
          { label: 'Free User Requests' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70 bg-card shadow-2xs animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both hover:shadow-md hover:border-border transition-all duration-200" style={{ animationDelay: '0ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Pending Approval</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 transition-transform duration-200 hover:scale-110">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">{pendingCount}</div>
            <p className="text-muted-foreground mt-1 text-[11px]">Awaiting admin review</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card shadow-2xs animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both hover:shadow-md hover:border-border transition-all duration-200" style={{ animationDelay: '80ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Approved</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 transition-transform duration-200 hover:scale-110">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">{approvedCount}</div>
            <p className="text-muted-foreground mt-1 text-[11px]">Trials activated</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card shadow-2xs animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both hover:shadow-md hover:border-border transition-all duration-200" style={{ animationDelay: '160ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Rejected</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 transition-transform duration-200 hover:scale-110">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight text-red-600 dark:text-red-400">{rejectedCount}</div>
            <p className="text-muted-foreground mt-1 text-[11px]">Declined requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-2xs bg-card animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both" style={{ animationDelay: '200ms' }}>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search name, phone, area, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs transition-shadow duration-200 focus:shadow-[0_0_0_2px] focus:shadow-primary/20"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center">
            {[
              { key: 'all', label: 'All', count: requests.length },
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'approved', label: 'Approved', count: approvedCount },
              { key: 'rejected', label: 'Rejected', count: rejectedCount },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key as typeof statusFilter)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150',
                  statusFilter === f.key
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:border-foreground/30',
                )}
              >
                {f.label}
                <span className={cn('tabular-nums', statusFilter === f.key ? 'text-background/70' : 'text-muted-foreground')}>{f.count}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="border-border/70 shadow-2xs bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both hidden sm:block" style={{ animationDelay: '280ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Applicant Lead</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Email</th>
                <th className="py-3.5 px-4">Coverage Area</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Reseller</th>
                <th className="py-3.5 px-4 hidden xl:table-cell">Temporary Expiry</th>
                <th className="py-3.5 px-4">Request Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground">
                    No requests match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((req, i) => (
                  <tr
                    key={req.id}
                    className="hover:bg-muted/30 transition-colors group animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both"
                    style={{ animationDelay: `${320 + i * 40}ms` }}
                  >
                    <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">{i + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs border border-primary/20 transition-transform duration-200 group-hover:scale-110 shrink-0">
                          {req.name.slice(-1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">{req.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{req.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      {req.email ? (
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Mail className="h-3 w-3" /> {req.email}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-foreground text-xs">
                        <MapPin className="h-3 w-3 text-muted-foreground" /> {req.area}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      {req.reseller ? (
                        <Badge variant="outline" className="text-[10px] font-medium bg-muted/30">{req.reseller}</Badge>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs">Direct</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 hidden xl:table-cell">
                      <span className="font-mono text-xs text-muted-foreground">
                        {req.temporaryExpiry ? new Date(req.temporaryExpiry).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        {new Date(req.requestedAt).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="h-7 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white"
                            onClick={() => handleApprove(req)}
                          >
                            <ThumbsUp className="mr-1 h-3 w-3" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => setRejectId(req.id)}
                          >
                            <ThumbsDown className="mr-1 h-3 w-3" /> Reject
                          </Button>
                        </div>
                      ) : req.status === 'approved' ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium justify-end">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-500 font-medium justify-end">
                          <XCircle className="h-3.5 w-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card Layout */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <Card className="border-border/70 shadow-2xs bg-card p-8 text-center text-muted-foreground text-sm">
            No requests match the current filter.
          </Card>
        ) : (
          filtered.map((req, i) => (
            <Card
              key={req.id}
              className="border-border/70 bg-card shadow-2xs p-4 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-both hover:shadow-md transition-all duration-200"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs border border-primary/20 shrink-0">
                    {req.name.slice(-1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate">{req.name}</h3>
                    <p className="text-[11px] text-muted-foreground font-mono">{req.phone}</p>
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {req.area}
                </div>
                {req.email && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3 w-3" /> {req.email}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {new Date(req.requestedAt).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => handleApprove(req)}
                  >
                    <ThumbsUp className="mr-1 h-3 w-3" /> Approve Trial
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setRejectId(req.id)}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Reject Confirmation */}
      <ConfirmDialog
        open={!!rejectId}
        onOpenChange={(open) => !open && setRejectId(null)}
        title="Reject Free User Request?"
        description="This will decline the trial application. The applicant will not receive access."
        confirmLabel="Reject Request"
        destructive
        onConfirm={handleReject}
      />
    </div>
  );
}

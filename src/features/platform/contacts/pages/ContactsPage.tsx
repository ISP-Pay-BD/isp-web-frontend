'use client';

import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformService } from '@/lib/api/services/platform.service';
import { PlatformPageHeader, platformDateTime } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import type { PlatformContact } from '@/features/platform/types';

const STATUS_OPTIONS: PlatformContact['status'][] = ['new', 'contacted', 'qualified', 'won', 'lost'];
const PER_PAGE = 20;

export function ContactsPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'contacts', { search, status, page }],
    queryFn: () => platformService.getLeads({ search, status, page, perPage: PER_PAGE }),
    placeholderData: keepPreviousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status: next }: { id: string; status: PlatformContact['status'] }) =>
      platformService.updateLeadStatus(id, next),
    onSuccess: () => {
      toast.success('Contact status updated');
      void queryClient.invalidateQueries({ queryKey: ['platform', 'contacts'] });
      void queryClient.invalidateQueries({ queryKey: ['platform', 'dashboard'] });
    },
  });

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load contacts"
        description={error instanceof Error ? error.message : 'Could not retrieve inbound lead requests.'}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const { summary } = data;
  const filtered = Boolean(search || status);

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Inbound Leads & Contacts"
        subtitle="Contact-form inquiries and addon requests from the public marketing pages"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Contacts' },
        ]}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{summary.total}</span>{' '}
          <span className="text-muted-foreground">total inquiries</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{summary.new}</span>{' '}
          <span className="text-muted-foreground">new</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-500">{summary.qualified}</span>{' '}
          <span className="text-muted-foreground">qualified</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">{summary.won}</span>{' '}
          <span className="text-muted-foreground">won</span>
        </p>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, company, email, phone, message..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs capitalize"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {data.items.length === 0 ? (
          <EmptyState
            title={filtered ? 'No contacts match' : 'No contacts yet'}
            description={filtered ? 'Try adjusting your search or status filter.' : 'Inquiries from the public site will appear here.'}
            actionLabel={filtered ? 'Clear filters' : undefined}
            onAction={
              filtered
                ? () => {
                    setSearchInput('');
                    setStatus('');
                  }
                : undefined
            }
          />
        ) : (
          data.items.map((c) => (
            <Card key={c.id} className="border-border/60 bg-card hover:border-primary/40 transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{c.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {c.source}
                      </Badge>
                      {c.pluginSlug ? (
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {c.pluginSlug}
                        </Badge>
                      ) : null}
                    </div>
                    {c.company ? <div className="text-xs font-medium text-foreground/80">{c.company}</div> : null}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-0.5">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:underline">
                          <Mail className="h-3 w-3 text-primary" /> {c.email}
                        </a>
                      ) : null}
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 font-mono hover:underline">
                        <Phone className="h-3 w-3 text-emerald-500" /> {c.phone}
                      </a>
                    </div>
                    {c.message ? (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/30 mt-2 max-w-2xl leading-relaxed whitespace-pre-line">
                        &ldquo;{c.message}&rdquo;
                      </p>
                    ) : null}
                    <div className="text-[10px] text-muted-foreground font-mono pt-1">{platformDateTime(c.createdAt)}</div>
                  </div>
                  <Select
                    value={c.status}
                    disabled={statusMutation.isPending}
                    onValueChange={(value) => statusMutation.mutate({ id: c.id, status: value as PlatformContact['status'] })}
                  >
                    <SelectTrigger className="h-8 w-[130px] capitalize shrink-0 text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize text-xs">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {data.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-xs">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {data.page} of {data.totalPages} · {data.total} results
          </span>
          <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

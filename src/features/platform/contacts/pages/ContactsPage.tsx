'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import type { PlatformContact } from '@/data/platform/contacts.data';

const STATUS_OPTIONS: PlatformContact['status'][] = ['new', 'contacted', 'qualified', 'won', 'lost'];

export function ContactsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'contacts'],
    queryFn: () => mockFetch('platform.contacts'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PlatformContact['status'] }) =>
      mockFetch('platform.contacts.updateStatus', id, status),
    onSuccess: () => {
      toast.success('Contact status updated');
      queryClient.invalidateQueries({ queryKey: ['platform', 'contacts'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load contacts"
        description="Could not retrieve inbound lead requests."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const items = data.items.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const newCount = data.items.filter((c) => c.status === 'new').length;
  const qualifiedCount = data.items.filter((c) => c.status === 'qualified').length;
  const wonCount = data.items.filter((c) => c.status === 'won').length;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Inbound Leads & Contacts"
        subtitle="Inbound inquiries from public marketing pages, enterprise demo requests, and pricing calculators"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Contacts' },
        ]}
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{data.items.length}</span>{' '}
          <span className="text-muted-foreground">total inquiries</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{newCount}</span>{' '}
          <span className="text-muted-foreground">new unread leads</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-500">{qualifiedCount}</span>{' '}
          <span className="text-muted-foreground">qualified prospects</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">{wonCount}</span>{' '}
          <span className="text-muted-foreground">converted tenants</span>
        </p>
      </div>

      <div className="flex justify-between items-center gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search lead name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState
            title="No contacts found"
            description="Try adjusting your search filters."
            actionLabel="Clear search"
            onAction={() => setSearch('')}
          />
        ) : (
          items.map((c) => (
            <Card key={c.id} className="border-border/60 bg-card hover:border-primary/40 transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{c.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {c.source}
                      </Badge>
                    </div>
                    <div className="text-xs font-medium text-foreground/80">{c.company}</div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-primary" /> {c.email}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <Phone className="h-3 w-3 text-emerald-500" /> {c.phone}
                      </span>
                    </div>
                    {c.message ? (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/30 mt-2 max-w-2xl leading-relaxed">&ldquo;{c.message}&rdquo;</p>
                    ) : null}
                    <div className="text-[10px] text-muted-foreground font-mono pt-1">{c.createdAt}</div>
                  </div>
                  <Select
                    value={c.status}
                    onValueChange={(value) =>
                      statusMutation.mutate({ id: c.id, status: value as PlatformContact['status'] })
                    }
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
    </div>
  );
}

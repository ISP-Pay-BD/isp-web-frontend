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

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Contact Inquiries"
        subtitle="Inbound leads from landing forms, pricing page, and demo requests"
      />

      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, company, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState title="No contacts found" description="Try adjusting your search filters." />
        ) : (
          items.map((c) => (
            <Card key={c.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{c.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {c.source}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{c.company}</div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {c.email}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </span>
                    </div>
                    {c.message ? (
                      <p className="text-sm text-muted-foreground/90 mt-2 max-w-2xl">&ldquo;{c.message}&rdquo;</p>
                    ) : null}
                    <div className="text-[11px] text-muted-foreground">{c.createdAt}</div>
                  </div>
                  <Select
                    value={c.status}
                    onValueChange={(value) =>
                      statusMutation.mutate({ id: c.id, status: value as PlatformContact['status'] })
                    }
                  >
                    <SelectTrigger className="h-9 w-[140px] capitalize shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
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

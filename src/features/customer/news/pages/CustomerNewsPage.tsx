'use client';

import { useState } from 'react';
import { Calendar, Search, ArrowRight, Bell, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  CustomerEmptyState,
} from '@/features/customer/shared';
import { useCustomerNews } from '../hooks/use-customer-news';
import type { CustomerNotice } from '@/lib/api/adapters/customer.adapter';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 20;

export function CustomerNewsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomerNews({ page, perPage: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [selectedNews, setSelectedNews] = useState<CustomerNotice | null>(null);

  if (isLoading) {
    return (
      <CustomerPageShell title="News & Notices" subtitle="Loading announcements...">
        <CustomerLoadingSkeleton variant="news" />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="News & Notices" subtitle="Provider Announcements">
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const q = search.toLowerCase().trim();
  const items = q
    ? data.items.filter((item) => item.title.toLowerCase().includes(q) || item.details.toLowerCase().includes(q))
    : data.items;
  const totalPages = data.meta.totalPages;

  return (
    <CustomerPageShell
      title="News & Notices"
      subtitle="Maintenance schedules and announcements from your provider."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'News & Notices' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-card max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 p-0 focus-visible:ring-0 shadow-none text-xs"
          />
        </div>

        {items.length === 0 ? (
          <CustomerEmptyState
            icon={<Bell className="h-10 w-10 text-muted-foreground/60" />}
            title="No notices found"
            description={
              data.items.length === 0
                ? 'Your provider has not published any notices yet.'
                : 'No notices on this page match your search.'
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <Card
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="relative flex flex-col justify-between p-5 hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="space-y-2.5">
                  <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </span>

                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {item.title || 'Notice'}
                  </h3>

                  {item.details && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.details}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-primary font-semibold">
                  <span>Read full announcement</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedNews ? formatDate(selectedNews.createdAt) : ''}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold leading-snug">{selectedNews?.title || 'Notice'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-3 border-t text-sm text-foreground/90 leading-relaxed">
              <p className="whitespace-pre-wrap">{selectedNews?.details || 'No further details.'}</p>

              <div className="flex items-center justify-between gap-2 pt-2">
                {selectedNews?.url ? (
                  <a
                    href={selectedNews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Open link <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span />
                )}
                <Button onClick={() => setSelectedNews(null)} size="sm">
                  Close Notice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerPageShell>
  );
}

'use client';

import { useState } from 'react';
import {
  Newspaper,
  Pin,
  Calendar,
  Search,
  ArrowRight,
  Bell,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState, CustomerEmptyState } from '@/features/customer/shared';
import { useCustomerNews } from '../hooks/use-customer-news';
import { formatDate } from '@/lib/format';
import type { NewsItem } from '@/data/shared/types';

export function CustomerNewsPage() {
  const { data, isLoading, isError, refetch } = useCustomerNews();
  const [search, setSearch] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  if (isLoading) {
    return (
      <CustomerPageShell title="News & Notices" subtitle="Loading announcements...">
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="News & Notices" subtitle="Provider Announcements">
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const items = data.items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.titleBn ?? '').toLowerCase().includes(search.toLowerCase()) ||
      item.body.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <CustomerPageShell
      title="News & Notices"
      subtitle="Stay informed with network maintenance schedules, POP upgrades, and official announcements."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'News & Notices' },
      ]}
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-card max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notices, schedules, packages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 p-0 focus-visible:ring-0 shadow-none text-xs"
          />
        </div>

        {/* Notices Cards Grid */}
        {items.length === 0 ? (
          <CustomerEmptyState
            icon={<Bell className="h-10 w-10 text-muted-foreground/60" />}
            title="No notices found"
            description="There are currently no active provider announcements matching your query."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <Card
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className={`relative flex flex-col justify-between p-5 hover:border-primary/50 transition-all cursor-pointer group ${
                  item.pinned ? 'border-primary/40 bg-primary/[0.02]' : ''
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.publishedAt)}
                      </span>
                    </div>

                    {item.pinned && (
                      <Badge variant="secondary" className="gap-1 text-[10px] font-bold text-primary">
                        <Pin className="h-3 w-3 fill-primary" />
                        Pinned Notice
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  {item.titleBn && (
                    <p className="text-xs text-muted-foreground font-bengali">{item.titleBn}</p>
                  )}

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.body}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-primary font-semibold">
                  <span>Read full announcement</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* News Detail Modal */}
        <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedNews ? formatDate(selectedNews.publishedAt) : ''}
                </Badge>
                {selectedNews?.pinned && (
                  <Badge variant="secondary" className="text-xs">
                    Pinned Announcement
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-bold leading-snug">
                {selectedNews?.title}
              </DialogTitle>
              {selectedNews?.titleBn && (
                <DialogDescription className="font-bengali text-sm text-foreground/80 mt-1">
                  {selectedNews.titleBn}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-4 pt-3 border-t text-sm text-foreground/90 leading-relaxed">
              <p>{selectedNews?.body}</p>

              <div className="p-3.5 rounded-xl border bg-muted/40 text-xs space-y-1 text-muted-foreground">
                <span className="font-semibold text-foreground">Notice Broadcast Scope:</span>
                <p>All active residential and commercial subscribers connected to the local POP.</p>
              </div>

              <div className="flex justify-end pt-2">
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

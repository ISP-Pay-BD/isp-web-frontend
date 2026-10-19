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
import { formatCount, formatDate } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

const PAGE_SIZE = 20;

export function CustomerNewsPage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomerNews({ page, perPage: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [selectedNews, setSelectedNews] = useState<CustomerNotice | null>(null);

  const title = t('customer.news.title', 'News & Notices');

  if (isLoading) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.news.loading', 'Loading announcements…')}>
        <CustomerLoadingSkeleton variant="news" />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.news.errorSubtitle', 'Provider announcements')}>
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
      title={title}
      subtitle={t('customer.news.subtitle', 'Maintenance schedules and announcements from your provider.')}
      breadcrumbs={[{ label: t('customer.common.crumb', 'Customer'), href: '/customer/dashboard' }, { label: title }]}
    >
      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder={t('customer.news.search', 'Search notices…')}
            aria-label={t('customer.news.search', 'Search notices…')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-10"
          />
        </div>

        {items.length === 0 ? (
          <CustomerEmptyState
            icon={<Bell className="text-muted-foreground/60 h-10 w-10" />}
            title={t('customer.news.empty', 'No notices found')}
            description={
              data.items.length === 0
                ? t('customer.news.emptyNone', 'Your provider has not published any notices yet.')
                : t('customer.news.emptySearch', 'No notices on this page match your search.')
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <Card
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedNews(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedNews(item);
                  }
                }}
                className="group hover:border-primary/50 focus-visible:ring-ring/50 relative flex cursor-pointer flex-col justify-between p-5 transition-colors duration-200 ease-out outline-none focus-visible:ring-3"
              >
                <div className="space-y-2.5">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-mono text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(item.createdAt)}
                  </span>

                  <h3 className="text-foreground group-hover:text-primary text-base font-bold transition-colors">
                    {item.title || t('customer.news.notice', 'Notice')}
                  </h3>

                  {item.details && (
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">{item.details}</p>
                  )}
                </div>

                <div className="text-primary mt-4 flex min-h-8 items-center justify-between border-t pt-3 text-sm font-semibold">
                  <span>{t('customer.news.read', 'Read full announcement')}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="text-muted-foreground flex items-center justify-end gap-2 text-sm">
            <span>{t('customer.common.pageOf', 'Page {page} of {total}', { page: formatCount(page), total: formatCount(totalPages) })}</span>
            <Button
              variant="outline"
              className="h-11 w-11 p-0"
              aria-label={t('customer.common.previousPage', 'Previous page')}
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-11 w-11 p-0"
              aria-label={t('customer.common.nextPage', 'Next page')}
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedNews ? formatDate(selectedNews.createdAt) : ''}
                </Badge>
              </div>
              <DialogTitle className="text-xl leading-snug font-bold">
                {selectedNews?.title || t('customer.news.notice', 'Notice')}
              </DialogTitle>
            </DialogHeader>

            <div className="text-foreground/90 space-y-4 border-t pt-3 text-sm leading-relaxed">
              <p className="whitespace-pre-wrap">{selectedNews?.details || t('customer.news.noDetails', 'No further details.')}</p>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                {selectedNews?.url ? (
                  <a
                    href={selectedNews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold hover:underline"
                  >
                    {t('customer.news.openLink', 'Open link')} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span />
                )}
                <Button onClick={() => setSelectedNews(null)} className="h-11 w-full sm:w-auto">
                  {t('customer.news.close', 'Close notice')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerPageShell>
  );
}

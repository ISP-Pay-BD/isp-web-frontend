'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { TablePagination } from '@/components/shared/TablePagination';
import { Images, Monitor, Smartphone, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useProductShowcase, type ShowcaseCategory } from '../hooks/use-product-showcase';

const TARGETS = [
  { value: '', label: 'All' },
  { value: 'website', label: 'Web portal' },
  { value: 'mobile', label: 'Mobile app' },
] as const;

export function AdminProductShowcasePage() {
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState('');
  const { data, isLoading, isError, error, refetch } = useProductShowcase({ page, pageSize: 12, target });
  const [open, setOpen] = useState<{ category: ShowcaseCategory; index: number } | null>(null);

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load showcase" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const current = open ? open.category.images[open.index] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Showcase"
        subtitle="Screens of the web portal and mobile app to share with prospects and new subscribers"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Engagement' }, { label: 'Product Showcase' }]}
      />

      <div className="flex flex-wrap items-center gap-2">
        {TARGETS.map((t) => (
          <Button
            key={t.value || 'all'}
            size="sm"
            variant={target === t.value ? 'default' : 'outline'}
            className="h-8 text-xs"
            onClick={() => {
              setTarget(t.value);
              setPage(1);
            }}
          >
            {t.label}
          </Button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{data.meta.total} galleries</span>
      </div>

      {data.items.length === 0 ? (
        <EmptyState icon={<Images className="h-5 w-5" />} title="No showcase galleries yet" description="Galleries published by the platform will appear here." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((cat) => {
            const cover = cat.images[0];
            return (
              <Card key={cat.id} className="border-border/60 overflow-hidden group hover:border-primary/60 transition shadow-sm hover:shadow-md flex flex-col bg-card/80">
                <button
                  type="button"
                  disabled={!cover}
                  onClick={() => cover && setOpen({ category: cat, index: 0 })}
                  className="relative aspect-video bg-muted/60 flex items-center justify-center overflow-hidden border-b border-border/40"
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.url} alt={cover.caption || cat.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform" />
                  ) : (
                    <Images className="h-8 w-8 text-muted-foreground/50" />
                  )}
                  <Badge variant="secondary" className="absolute bottom-2.5 right-2.5 text-[10px] font-mono bg-background/80 backdrop-blur-xs gap-1">
                    <Images className="h-3 w-3" /> {cat.images.length}
                  </Badge>
                </button>
                <CardContent className="space-y-2.5 p-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-foreground leading-snug">{cat.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0 gap-1">
                      {cat.target === 'mobile' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                      {cat.target === 'mobile' ? 'Mobile' : 'Web'}
                    </Badge>
                  </div>
                  {cat.bullets.length > 0 && (
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {cat.bullets.slice(0, 4).map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-px" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {data.meta.total > 12 && (
        <TablePagination currentPage={page} pageSize={12} totalItems={data.meta.total} onPageChange={setPage} onPageSizeChange={() => undefined} pageSizeOptions={[12]} />
      )}

      <Dialog open={Boolean(open)} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{open?.category.name}</DialogTitle>
            <DialogDescription>{current?.caption || `Screen ${open ? open.index + 1 : 0} of ${open?.category.images.length ?? 0}`}</DialogDescription>
          </DialogHeader>
          {open && current && (
            <div className="space-y-3">
              <div className="relative rounded-xl bg-muted/40 border border-border/60 overflow-hidden flex items-center justify-center max-h-[70vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.url} alt={current.caption || open.category.name} className="max-h-[70vh] w-auto object-contain" />
              </div>
              {open.category.images.length > 1 && (
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={open.index === 0}
                    onClick={() => setOpen({ ...open, index: open.index - 1 })}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <div className="flex gap-1.5">
                    {open.category.images.map((img, i) => (
                      <button
                        key={img.id}
                        type="button"
                        aria-label={`Screen ${i + 1}`}
                        onClick={() => setOpen({ ...open, index: i })}
                        className={cn('h-2 w-2 rounded-full', i === open.index ? 'bg-primary' : 'bg-muted-foreground/30')}
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={open.index >= open.category.images.length - 1}
                    onClick={() => setOpen({ ...open, index: open.index + 1 })}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

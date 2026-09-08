'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Play, Eye, Star } from 'lucide-react';
import type { ProductShowcaseItem } from '@/data/platform/contacts.data';

export function AdminProductShowcasePage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'domain', 'productShowcase'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'productShowcase');
      return res as { items: ProductShowcaseItem[] };
    },
  });

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load showcase" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Showcase"
        subtitle="Demo videos for sales and onboarding"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Product Showcase' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => (
          <Card key={item.id} className="border-border/60 overflow-hidden group">
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              <Play className="h-10 w-10 text-muted-foreground/60 transition group-hover:text-primary" />
              {item.featured && (
                <Badge className="absolute top-2 left-2 gap-1">
                  <Star className="h-3 w-3" />
                  Featured
                </Badge>
              )}
            </div>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm leading-snug">{item.title}</h3>
                <Badge variant="outline">{item.category}</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{item.subtitle}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                {item.views.toLocaleString()} views
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

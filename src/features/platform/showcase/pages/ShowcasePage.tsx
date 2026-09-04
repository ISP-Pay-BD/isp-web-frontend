'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, Sparkles } from 'lucide-react';

export function ShowcasePage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'showcase'],
    queryFn: () => mockFetch('platform.showcase'),
  });

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load showcase"
        description="Could not retrieve product demo videos."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Product Showcase"
        subtitle="Demo videos and feature highlights for marketing and sales"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => (
          <Card key={item.id} className="border-border/60 overflow-hidden group">
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <Play className="h-12 w-12 text-white/90 relative z-10 group-hover:scale-110 transition-transform" />
              {item.featured ? (
                <Badge className="absolute top-2 right-2 bg-primary text-xs">
                  <Sparkles className="h-3 w-3 mr-1" /> Featured
                </Badge>
              ) : null}
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {item.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {item.views.toLocaleString()} views
                </span>
                <span>{item.createdAt}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

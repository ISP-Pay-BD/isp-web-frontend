'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, Star } from 'lucide-react';

export function ShowcasePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [activeVideo, setActiveVideo] = useState<{ title: string; subtitle: string; description: string } | null>(null);

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

  const filteredItems = data.items.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalViews = data.items.reduce((s, i) => s + i.views, 0);

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Product Showcase & Demos"
        subtitle="High-fidelity video demonstrations, interactive walkthroughs, and platform capability highlights"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Showcase' },
        ]}
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{data.items.length}</span>{' '}
          <span className="text-muted-foreground">demo modules</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{totalViews.toLocaleString()}</span>{' '}
          <span className="text-muted-foreground">total video views</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">1080p 60fps</span>{' '}
          <span className="text-muted-foreground">native video stream</span>
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'Billing', 'Network', 'Portal'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-card border border-border/70 hover:bg-muted text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="max-w-xs w-full">
          <input
            type="text"
            placeholder="Search showcases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 px-3 rounded-lg border border-border/70 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            onClick={() => setActiveVideo(item)}
            className="border-border/60 bg-card overflow-hidden group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-primary/20 to-slate-950 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <div className="h-12 w-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center relative z-10 shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
                {item.featured ? (
                  <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold shadow-xs">
                    <Star className="mr-1 h-3 w-3 fill-current" /> Featured
                  </Badge>
                ) : null}
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                    {item.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
              </CardContent>
            </div>
            <div className="px-4 pb-4 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-primary" /> {item.views.toLocaleString()} plays
              </span>
              <span>{item.createdAt}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

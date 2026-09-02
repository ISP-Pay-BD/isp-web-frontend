'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Puzzle, Search } from 'lucide-react';
import { formatBdt } from '@/lib/format';

export function PluginsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'plugins'],
    queryFn: () => mockFetch('platform.plugins'),
  });

  if (isLoading) return <PageSkeleton rows={4} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load plugins"
        description="Could not retrieve marketplace plugins."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const items = data.items.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Plugins & Addons"
        subtitle="Manage marketplace plugins available to tenant ISPs"
      />

      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plugins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((plugin) => (
          <Card key={plugin.id} className="border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Puzzle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{plugin.name}</h3>
                    <Badge variant="outline" className="text-xs mt-0.5">
                      {plugin.category}
                    </Badge>
                  </div>
                </div>
                <Badge variant={plugin.installed ? 'default' : 'secondary'} className="text-xs">
                  {plugin.installed ? 'Active' : 'Available'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{plugin.desc}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-primary">
                  {plugin.priceBdt === 0 ? 'Free' : `৳${formatBdt(plugin.priceBdt)}/mo`}
                </span>
                <span className="text-muted-foreground">{plugin.installs} installs</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
